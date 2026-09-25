import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth } from '../context/AuthContext';
import {
    Crosshair,
    Search,
    CheckCircle2,
    AlertTriangle,
    History,
    Send,
    ShieldCheck,
    Check
} from 'lucide-react';

export default function ScorerPanel() {
    const { activeResults, addShot, correctShot, auditLogs, liveState } = useLiveData();
    const { userName } = useAuth();

    const [selectedBib, setSelectedBib] = useState<string>('021');
    const [bibSearchQuery, setBibSearchQuery] = useState<string>('');
    const [submittingScore, setSubmittingScore] = useState<number | null>(null);
    const [lastAckScore, setLastAckScore] = useState<number | null>(null);
    const [manualInput, setManualInput] = useState<string>('');

    // Score Correction Modal state
    const [correctionModalOpen, setCorrectionModalOpen] = useState<boolean>(false);
    const [correctionShotIndex, setCorrectionShotIndex] = useState<number>(47);
    const [correctionOldValue, setCorrectionOldValue] = useState<number>(10.6);
    const [correctionNewValue, setCorrectionNewValue] = useState<number>(10.8);
    const [correctionReason, setCorrectionReason] = useState<string>('Target verification');

    // Selected athlete derived from activeResults
    const activeAthlete = activeResults.find(a => a.bib === selectedBib) || activeResults[0];

    const quickScores = [
        10.9, 10.8, 10.7, 10.6,
        10.5, 10.4, 10.3, 10.2,
        10.1, 10.0, 9.9, 9.8,
        9.7, 9.6, 9.5, 9.0,
        8.5, 8.0, 7.0, 0.0
    ];

    const handleShotClick = async (val: number) => {
        if (!activeAthlete) return;
        setSubmittingScore(val);
        const success = await addShot(activeAthlete.participantId, val);
        if (success) {
            setLastAckScore(val);
            setTimeout(() => setLastAckScore(null), 2500);
        }
        setSubmittingScore(null);
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(manualInput);
        if (!isNaN(val) && val >= 0.0 && val <= 10.9) {
            await handleShotClick(val);
            setManualInput('');
        }
    };

    const handleCorrectionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeAthlete) return;
        await correctShot(
            activeAthlete.participantId,
            correctionShotIndex,
            correctionNewValue,
            correctionReason,
            userName
        );
        setCorrectionModalOpen(false);
    };

    const filteredAthletes = activeResults.filter(a =>
        a.bib.includes(bibSearchQuery) || a.name.toLowerCase().includes(bibSearchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

            {/* Header Info */}
            <div className="bg-[#12131A] p-4 rounded-xl border border-[#282B3A] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#DC2626]/20 border border-[#DC2626] flex items-center justify-center shrink-0">
                        <Crosshair className="w-5 h-5 text-[#DC2626]" />
                    </div>
                    <div>
                        <span className="font-mono text-xs text-[#DC2626] font-bold tracking-widest uppercase">
                            TABLET SCORING INTERFACE
                        </span>
                        <h1 className="font-headline-sm text-2xl text-[#F8FAFC] tracking-wider uppercase">
                            LIVE RANGE SCORER PANEL — RELAY 0{liveState.relay}
                        </h1>
                    </div>
                </div>

                {/* Current Scorer Info */}
                <div className="flex items-center gap-3 bg-[#0B0C10] px-3.5 py-1.5 rounded-lg border border-[#282B3A] font-mono text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                    <span>AUTHENTICATED SCORER: <strong className="text-[#F8FAFC]">{userName}</strong></span>
                </div>
            </div>

            {/* Main Grid: Left Athlete Selection & Keypad / Right Live Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Col: Direct Athlete Selector & Score Keypad (8 cols) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Athlete Selector Bar */}
                    <div className="bg-[#12131A] p-4 rounded-xl border border-[#282B3A] space-y-3">
                        <label className="font-mono text-xs text-[#64748B] uppercase font-bold tracking-wider block">
                            SELECT SHOOTER BY BIB OR FIRING POINT
                        </label>

                        {/* Quick Search Input */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Type Bib # or Name (e.g. 021, Rahul)..."
                                value={bibSearchQuery}
                                onChange={e => setBibSearchQuery(e.target.value)}
                                className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-lg pl-9 pr-4 py-2 text-sm font-mono text-[#F8FAFC] focus:outline-none"
                            />
                        </div>

                        {/* Quick Shooter Button Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 max-h-36 overflow-y-auto">
                            {filteredAthletes.map(ath => (
                                <button
                                    key={ath.participantId}
                                    onClick={() => setSelectedBib(ath.bib)}
                                    className={`p-2 rounded-lg border text-left font-mono transition-all ${selectedBib === ath.bib
                                            ? 'bg-[#DC2626]/20 border-[#DC2626] text-[#F8FAFC] font-bold shadow-[0_0_10px_rgba(220,38,38,0.3)]'
                                            : 'bg-[#0B0C10] border-[#282B3A] text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1A1C26]'
                                        }`}
                                >
                                    <div className="text-[10px] text-[#F59E0B]">BIB {ath.bib} • FP {ath.firingPoint}</div>
                                    <div className="text-xs truncate font-bold text-[#F8FAFC]">{ath.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Shooter Scoring Card */}
                    {activeAthlete && (
                        <div className="bg-[#12131A] p-5 rounded-xl border border-[#282B3A] space-y-6">

                            {/* Shooter Summary Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#282B3A] gap-4">
                                <div>
                                    <div className="font-mono text-xs text-[#F59E0B] font-bold">
                                        BIB {activeAthlete.bib} • FIRING POINT {activeAthlete.firingPoint}
                                    </div>
                                    <h2 className="font-headline-sm text-2xl text-[#F8FAFC] uppercase tracking-wider">
                                        {activeAthlete.name}
                                    </h2>
                                    <span className="font-mono text-xs text-[#64748B]">{activeAthlete.club}</span>
                                </div>

                                {/* Score Summary Telemetry */}
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#0B0C10] px-4 py-2 rounded-lg border border-[#282B3A] text-right">
                                        <div className="font-mono text-[9px] text-[#64748B] uppercase">PROGRESS</div>
                                        <div className="font-mono text-lg font-bold text-[#F8FAFC]">
                                            SHOT {activeAthlete.qualificationShots.length} / 60
                                        </div>
                                    </div>
                                    <div className="bg-[#0B0C10] px-4 py-2 rounded-lg border border-[#DC2626]/60 text-right">
                                        <div className="font-mono text-[9px] text-[#DC2626] font-bold uppercase">TOTAL SCORE</div>
                                        <div className="font-mono text-xl font-bold text-[#F8FAFC]">
                                            {activeAthlete.qualificationTotal.toFixed(1)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Server Acknowledgement Indicator */}
                            {lastAckScore !== null && (
                                <div className="p-3 bg-[#22C55E]/15 border border-[#22C55E] rounded-lg text-[#22C55E] font-mono text-xs flex items-center justify-between animate-fade-in">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>BACKEND ACKNOWLEDGED: SHOT ENTRY <strong>{lastAckScore.toFixed(1)}</strong> PERMANENTLY SAVED</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold">VERIFIED</span>
                                </div>
                            )}

                            {/* Touch Keypad */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="font-mono text-xs text-[#F8FAFC] uppercase font-bold tracking-wider">
                                        DECIMAL SCORING KEYPAD (0.0 — 10.9)
                                    </label>
                                    <button
                                        onClick={() => setCorrectionModalOpen(true)}
                                        className="font-mono text-xs text-[#F59E0B] hover:underline flex items-center gap-1"
                                    >
                                        <History className="w-3.5 h-3.5" /> Correct Previous Shot
                                    </button>
                                </div>

                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                                    {quickScores.map(score => (
                                        <button
                                            key={score}
                                            onClick={() => handleShotClick(score)}
                                            disabled={submittingScore !== null}
                                            className={`py-3 sm:py-4 rounded-xl font-mono text-base sm:text-lg font-bold transition-all border shadow-md active:scale-95 ${submittingScore === score
                                                    ? 'bg-[#F59E0B] text-[#0B0C10] border-[#F59E0B] animate-pulse'
                                                    : score >= 10.0
                                                        ? 'bg-[#1A1C26] hover:bg-[#DC2626] border-[#282B3A] hover:border-[#DC2626] text-[#F8FAFC]'
                                                        : 'bg-[#0B0C10] hover:bg-[#1A1C26] border-[#282B3A] text-[#94A3B8]'
                                                }`}
                                        >
                                            {score.toFixed(1)}
                                        </button>
                                    ))}
                                </div>

                                {/* Manual Decimal Entry Form */}
                                <form onSubmit={handleManualSubmit} className="flex items-center gap-3 pt-2">
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10.9"
                                        placeholder="Manual decimal score (e.g. 10.8)..."
                                        value={manualInput}
                                        onChange={e => setManualInput(e.target.value)}
                                        className="flex-1 bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-lg px-4 py-2.5 font-mono text-sm text-[#F8FAFC] focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#E51A1A] text-[#F8FAFC] font-mono text-xs font-bold uppercase rounded-lg shadow-lg flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" /> Submit
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Col: Shot History Breakdown & Correction Audit Trail (4 cols) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Recent Shots Breakdown */}
                    {activeAthlete && (
                        <div className="bg-[#12131A] p-4 rounded-xl border border-[#282B3A] space-y-3">
                            <h3 className="font-headline-sm text-sm text-[#F8FAFC] tracking-wider uppercase flex items-center justify-between border-b border-[#282B3A] pb-2">
                                <span>QUALIFICATION SHOTS (1–60)</span>
                                <span className="font-mono text-[10px] text-[#64748B]">
                                    {activeAthlete.qualificationShots.length} RECORDED
                                </span>
                            </h3>

                            <div className="grid grid-cols-5 gap-1.5 max-h-60 overflow-y-auto pr-1 font-mono text-xs">
                                {activeAthlete.qualificationShots.map((s, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-1.5 rounded text-center border ${s >= 10.4
                                                ? 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]'
                                                : s >= 10.0
                                                    ? 'bg-[#1A1C26] border-[#282B3A] text-[#F8FAFC]'
                                                    : 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
                                            }`}
                                    >
                                        <div className="text-[9px] text-[#64748B]">#{idx + 1}</div>
                                        <div className="font-bold">{s.toFixed(1)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Audit Trail Log */}
                    <div className="bg-[#12131A] p-4 rounded-xl border border-[#282B3A] space-y-3">
                        <h3 className="font-headline-sm text-sm text-[#F8FAFC] tracking-wider uppercase border-b border-[#282B3A] pb-2">
                            AUDIT TRAIL & CORRECTIONS
                        </h3>

                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1 font-mono text-[11px]">
                            {auditLogs.map(log => (
                                <div key={log.id} className="p-2.5 bg-[#0B0C10] border border-[#282B3A] rounded-lg space-y-1">
                                    <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        <span className="text-[#F59E0B] font-bold">{log.actorName}</span>
                                    </div>
                                    <div className="text-[#F8FAFC]">
                                        <strong>{log.participantName || log.bib}</strong>: Shot #{log.shotIndex}{' '}
                                        <span className="text-[#EF4444] line-through">{log.oldValue}</span> →{' '}
                                        <span className="text-[#22C55E] font-bold">{log.newValue}</span>
                                    </div>
                                    {log.reason && (
                                        <div className="text-[10px] text-[#64748B] italic">Reason: {log.reason}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Score Correction Modal */}
            {correctionModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#12131A] border border-[#DC2626] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-fade-in">
                        <div className="flex items-center justify-between border-b border-[#282B3A] pb-3">
                            <h3 className="font-headline-sm text-lg text-[#F8FAFC] tracking-wider uppercase flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                                AUTHORIZE SCORE CORRECTION
                            </h3>
                            <button
                                onClick={() => setCorrectionModalOpen(false)}
                                className="text-[#64748B] hover:text-[#F8FAFC]"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCorrectionSubmit} className="space-y-4 font-mono text-xs">
                            <div>
                                <label className="text-[#64748B] uppercase block mb-1">Target Shot Number (1-60)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={correctionShotIndex}
                                    onChange={e => setCorrectionShotIndex(parseInt(e.target.value) || 1)}
                                    className="w-full bg-[#0B0C10] border border-[#282B3A] rounded px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#DC2626]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[#64748B] uppercase block mb-1">Old Score</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={correctionOldValue}
                                        onChange={e => setCorrectionOldValue(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-[#0B0C10] border border-[#282B3A] rounded px-3 py-2 text-[#EF4444] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#64748B] uppercase block mb-1">New Score</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={correctionNewValue}
                                        onChange={e => setCorrectionNewValue(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-[#0B0C10] border border-[#282B3A] rounded px-3 py-2 text-[#22C55E] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[#64748B] uppercase block mb-1">Mandatory Correction Reason</label>
                                <select
                                    value={correctionReason}
                                    onChange={e => setCorrectionReason(e.target.value)}
                                    className="w-full bg-[#0B0C10] border border-[#282B3A] rounded px-3 py-2 text-[#F8FAFC] focus:outline-none"
                                >
                                    <option value="Target verification">Target verification</option>
                                    <option value="Crossfire penalty adjustment">Crossfire penalty adjustment</option>
                                    <option value="EST sensor calibration recalculation">EST sensor calibration recalculation</option>
                                    <option value="Jury decision override">Jury decision override</option>
                                </select>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCorrectionModalOpen(false)}
                                    className="px-4 py-2 bg-[#1A1C26] text-[#64748B] hover:text-[#F8FAFC] rounded uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-[#DC2626] hover:bg-[#E51A1A] text-[#F8FAFC] font-bold rounded uppercase flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Confirm Correction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
