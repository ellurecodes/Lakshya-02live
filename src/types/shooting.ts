export type Discipline = '10m_rifle' | '10m_pistol';

export type EventStage =
    | 'UPCOMING'
    | 'PREPARATION'
    | 'SIGHTING'
    | 'QUALIFICATION_LIVE'
    | 'QUALIFICATION_PAUSED'
    | 'QUALIFICATION_COMPLETE'
    | 'FINAL_PREPARATION'
    | 'FINAL_LIVE'
    | 'FINAL_COMPLETE'
    | 'RESULTS_APPROVED'
    | 'RESULTS_LOCKED';

export type UserRole = 'ADMIN' | 'SCORER' | 'OFFICIAL' | 'JURY' | 'PUBLIC';

export interface Participant {
    id: string;
    bib: string;
    name: string;
    gender: 'M' | 'F';
    category: 'Youth' | 'Junior' | 'Senior' | 'Master';
    club: string;
    college?: string;
    noc: string;
    relay: number;
    firingPoint: number;
    discipline: Discipline;
}

export interface ShotRecord {
    shotIndex: number; // 1 to 60
    score: number; // 0.0 to 10.9
    isSighting?: boolean;
    timestamp: number;
    scorerId?: string;
}

export interface AthleteResult {
    participantId: string;
    bib: string;
    name: string;
    noc: string;
    club: string;
    relay: number;
    firingPoint: number;
    discipline: Discipline;
    qualificationShots: number[];
    qualificationTotal: number;
    qualificationRank: number;
    qualificationStatus: 'SHOOTING' | 'COMPLETED' | 'DNS' | 'DSQ';
    finalShots?: number[];
    finalTotal?: number;
    finalRank?: number;
    finalStatus?: 'LIVE' | 'ELIMINATED' | 'GOLD' | 'SILVER' | 'BRONZE';
    eliminatedAtShot?: number;
    rankDelta?: number; // +2, -1, 0 for animations
    lastShot?: number;
}

export interface CurrentShooterState {
    participantId: string;
    bib: string;
    name: string;
    firingPoint: number;
    relay: number;
    shotIndex: number;
    totalShots: number;
    lastShot: number;
    currentScore: number;
    discipline: Discipline;
}

export interface LiveState {
    eventId: string;
    eventName: string;
    discipline: Discipline;
    stage: EventStage;
    relay: number;
    youtubeVideoId: string;
    streamTitle: string;
    streamStatus: string;
    cameraName: string;
    timerTargetEpoch: number | null;
    timerDurationSeconds: number;
    isTimerRunning: boolean;
    updatedAt: number;
}

export interface AuditLog {
    id: string;
    timestamp: number;
    actorName: string;
    actorRole: UserRole;
    action: string;
    participantId?: string;
    participantName?: string;
    bib?: string;
    shotIndex?: number;
    oldValue?: number | string;
    newValue?: number | string;
    reason?: string;
}

export interface DisciplineConfig {
    id: Discipline;
    name: string;
    qualificationShots: number;
    qualificationMaxScore: number;
    finalistCount: number;
    finalSeriesStructure: {
        stage1Series: number[]; // e.g. [5, 5]
        singleShotStart: number; // e.g. 11
        singleShotEnd: number; // e.g. 24
        eliminationIntervalShots: number; // e.g. 2
        eliminationSchedule: { shotIndex: number; eliminateRank: number }[];
    };
}
