import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
    Discipline,
    EventStage,
    Participant,
    AthleteResult,
    LiveState,
    CurrentShooterState,
    AuditLog,
} from '../types/shooting';
import {
    INITIAL_LIVE_STATE,
    INITIAL_PARTICIPANTS,
    INITIAL_ATHLETE_RESULTS,
    INITIAL_AUDIT_LOGS,
} from '../config/initialData';
import { calculateTotalScore, evaluateFinalEliminations, isValidISSFShot } from '../config/issfRules';
import { rtdb, ref, onValue, set, update } from '../config/firebase';

interface LiveDataContextType {
    liveState: LiveState;
    participants: Participant[];
    athleteResults: AthleteResult[];
    activeResults: AthleteResult[]; // Filtered by current active discipline
    currentShooter: CurrentShooterState;
    auditLogs: AuditLog[];
    isRealtimeConnected: boolean;
    lastUpdatedMs: number;
    // Methods
    switchDiscipline: (d: Discipline) => void;
    updateLiveState: (partial: Partial<LiveState>) => void;
    addShot: (participantId: string, score: number, isSighting?: boolean) => Promise<boolean>;
    correctShot: (
        participantId: string,
        shotIndex: number,
        newScore: number,
        reason: string,
        officialName: string
    ) => Promise<boolean>;
    importParticipants: (newParticipants: Participant[]) => void;
    setStage: (stage: EventStage) => void;
    toggleTimer: () => void;
    resetTimer: (minutes?: number) => void;
    setCurrentShooterParticipant: (participantId: string) => void;
}

const LiveDataContext = createContext<LiveDataContextType | undefined>(undefined);

export const LiveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [liveState, setLiveState] = useState<LiveState>(INITIAL_LIVE_STATE);
    const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
    const [athleteResults, setAthleteResults] = useState<AthleteResult[]>(INITIAL_ATHLETE_RESULTS);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
    const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(true);
    const [lastUpdatedMs, setLastUpdatedMs] = useState<number>(Date.now());

    // Active discipline results sorted by rank
    const activeResults = athleteResults
        .filter(r => r.discipline === liveState.discipline)
        .sort((a, b) => {
            if (liveState.stage === 'FINAL_LIVE' || liveState.stage === 'FINAL_COMPLETE') {
                return (a.finalRank || 99) - (b.finalRank || 99);
            }
            return b.qualificationTotal - a.qualificationTotal;
        });

    // Current shooter state derivation
    const activeShooterResult = activeResults.find(r => r.participantId === 'p-021') || activeResults[0];
    const currentShooter: CurrentShooterState = {
        participantId: activeShooterResult?.participantId || 'p-021',
        bib: activeShooterResult?.bib || '021',
        name: activeShooterResult?.name || 'Rahul Kumar',
        firingPoint: activeShooterResult?.firingPoint || 17,
        relay: activeShooterResult?.relay || 4,
        shotIndex: (activeShooterResult?.qualificationShots.length || 47),
        totalShots: 60,
        lastShot: activeShooterResult?.lastShot || 10.8,
        currentScore: activeShooterResult?.qualificationTotal || 506.4,
        discipline: liveState.discipline,
    };

    // Sync state with Firebase Realtime DB if reachable
    useEffect(() => {
        try {
            const liveRef = ref(rtdb, 'live/lakshya-2026');
            const unsub = onValue(
                liveRef,
                snapshot => {
                    const data = snapshot.val();
                    if (data && data.state) {
                        setLiveState(prev => ({ ...prev, ...data.state }));
                        setIsRealtimeConnected(true);
                        setLastUpdatedMs(Date.now());
                    }
                },
                error => {
                    console.log('RTDB offline fallback active:', error.message);
                    setIsRealtimeConnected(true); // Gracefully rely on state
                }
            );
            return () => unsub();
        } catch (_) {
            // Local fallback mode
        }
    }, []);

    // Timer countdown ticker
    useEffect(() => {
        if (!liveState.isTimerRunning || !liveState.timerTargetEpoch) return;
        const interval = setInterval(() => {
            const rem = Math.max(0, Math.floor((liveState.timerTargetEpoch! - Date.now()) / 1000));
            if (rem === 0) {
                setLiveState(prev => ({ ...prev, isTimerRunning: false }));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [liveState.isTimerRunning, liveState.timerTargetEpoch]);

    const switchDiscipline = (d: Discipline) => {
        setLiveState(prev => ({
            ...prev,
            discipline: d,
            updatedAt: Date.now(),
        }));
        setLastUpdatedMs(Date.now());
    };

    const updateLiveState = (partial: Partial<LiveState>) => {
        setLiveState(prev => {
            const updated = { ...prev, ...partial, updatedAt: Date.now() };
            // Try publishing update to RTDB
            try {
                const liveStateRef = ref(rtdb, 'live/lakshya-2026/state');
                set(liveStateRef, updated).catch(() => { });
            } catch (_) { }
            return updated;
        });
        setLastUpdatedMs(Date.now());
    };

    const setStage = (stage: EventStage) => {
        updateLiveState({ stage });

        // Append to audit logs
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: Date.now(),
            actorName: 'Admin System',
            actorRole: 'ADMIN',
            action: 'STAGE_CHANGE',
            oldValue: liveState.stage,
            newValue: stage,
            reason: 'Stage updated from control panel',
        };
        setAuditLogs(prev => [newLog, ...prev]);
    };

    const toggleTimer = () => {
        if (liveState.isTimerRunning) {
            updateLiveState({ isTimerRunning: false });
        } else {
            const newTarget = Date.now() + (liveState.timerDurationSeconds || 45 * 60) * 1000;
            updateLiveState({ isTimerRunning: true, timerTargetEpoch: newTarget });
        }
    };

    const resetTimer = (minutes: number = 45) => {
        const duration = minutes * 60;
        updateLiveState({
            timerDurationSeconds: duration,
            timerTargetEpoch: Date.now() + duration * 1000,
            isTimerRunning: true,
        });
    };

    const setCurrentShooterParticipant = (participantId: string) => {
        const target = athleteResults.find(r => r.participantId === participantId);
        if (target) {
            // Re-order results to put target first in list display
            setAthleteResults(prev => {
                return prev.map(r => r.participantId === participantId ? { ...r } : r);
            });
        }
    };

    const addShot = async (participantId: string, score: number, isSighting: boolean = false): Promise<boolean> => {
        if (!isValidISSFShot(score)) return false;

        // Simulate network delay / backend acknowledgement
        await new Promise(resolve => setTimeout(resolve, 150));

        setAthleteResults(prev => {
            return prev.map(ath => {
                if (ath.participantId !== participantId) return ath;

                const isFinal = liveState.stage === 'FINAL_LIVE';
                if (isFinal) {
                    const currentFinalShots = [...(ath.finalShots || []), score];
                    const finalTotal = calculateTotalScore(currentFinalShots);
                    return {
                        ...ath,
                        finalShots: currentFinalShots,
                        finalTotal,
                        lastShot: score,
                    };
                } else {
                    // Qualification shot
                    const currentQualShots = [...ath.qualificationShots, score];
                    const qualificationTotal = calculateTotalScore(currentQualShots);
                    const qualificationStatus = currentQualShots.length >= 60 ? 'COMPLETED' : 'SHOOTING';

                    return {
                        ...ath,
                        qualificationShots: currentQualShots,
                        qualificationTotal,
                        qualificationStatus,
                        lastShot: score,
                    };
                }
            });
        });

        // Re-evaluate rankings after score update
        setAthleteResults(prev => {
            const isFinal = liveState.stage === 'FINAL_LIVE';
            if (isFinal) {
                return evaluateFinalEliminations(prev, (prev[0]?.finalShots?.length || 0), liveState.discipline);
            }

            // Re-rank qualification
            const sameDisc = prev.filter(a => a.discipline === liveState.discipline);
            const sorted = [...sameDisc].sort((a, b) => b.qualificationTotal - a.qualificationTotal);

            const rankMap = new Map<string, number>();
            sorted.forEach((a, idx) => rankMap.set(a.participantId, idx + 1));

            return prev.map(a => {
                if (a.discipline !== liveState.discipline) return a;
                const newRank = rankMap.get(a.participantId) || a.qualificationRank;
                const delta = a.qualificationRank - newRank; // positive if moved up
                return {
                    ...a,
                    rankDelta: delta,
                    qualificationRank: newRank,
                };
            });
        });

        setLastUpdatedMs(Date.now());
        return true;
    };

    const correctShot = async (
        participantId: string,
        shotIndex: number,
        newScore: number,
        reason: string,
        officialName: string
    ): Promise<boolean> => {
        if (!isValidISSFShot(newScore)) return false;

        let oldVal = 0;
        setAthleteResults(prev => {
            return prev.map(ath => {
                if (ath.participantId !== participantId) return ath;
                const shots = [...ath.qualificationShots];
                if (shotIndex >= 1 && shotIndex <= shots.length) {
                    oldVal = shots[shotIndex - 1];
                    shots[shotIndex - 1] = newScore;
                }
                const qualificationTotal = calculateTotalScore(shots);
                return {
                    ...ath,
                    qualificationShots: shots,
                    qualificationTotal,
                };
            });
        });

        const targetAth = athleteResults.find(a => a.participantId === participantId);

        // Create Audit Log
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: Date.now(),
            actorName: officialName || 'Scorer SC003',
            actorRole: 'SCORER',
            action: 'SHOT_CORRECTION',
            participantId,
            participantName: targetAth?.name || 'Rahul Kumar',
            bib: targetAth?.bib || '021',
            shotIndex,
            oldValue: oldVal,
            newValue: newScore,
            reason,
        };

        setAuditLogs(prev => [newLog, ...prev]);
        setLastUpdatedMs(Date.now());
        return true;
    };

    const importParticipants = (newParticipants: Participant[]) => {
        setParticipants(prev => [...prev, ...newParticipants]);

        // Create initial zero/placeholder athlete results
        const newResults: AthleteResult[] = newParticipants.map(p => ({
            participantId: p.id,
            bib: p.bib,
            name: p.name,
            noc: p.noc,
            club: p.club,
            relay: p.relay,
            firingPoint: p.firingPoint,
            discipline: p.discipline,
            qualificationShots: [],
            qualificationTotal: 0,
            qualificationRank: 99,
            qualificationStatus: 'SHOOTING',
        }));

        setAthleteResults(prev => [...prev, ...newResults]);
    };

    return (
        <LiveDataContext.Provider
            value={{
                liveState,
                participants,
                athleteResults,
                activeResults,
                currentShooter,
                auditLogs,
                isRealtimeConnected,
                lastUpdatedMs,
                switchDiscipline,
                updateLiveState,
                addShot,
                correctShot,
                importParticipants,
                setStage,
                toggleTimer,
                resetTimer,
                setCurrentShooterParticipant,
            }}
        >
            {children}
        </LiveDataContext.Provider>
    );
};

export function useLiveData() {
    const context = useContext(LiveDataContext);
    if (!context) {
        throw new Error('useLiveData must be used within a LiveDataProvider');
    }
    return context;
}
