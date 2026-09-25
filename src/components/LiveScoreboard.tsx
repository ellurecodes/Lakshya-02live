import { useLiveData } from '../context/LiveDataContext';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

interface LiveScoreboardProps {
    onSelectAthlete?: (participantId: string) => void;
}

export default function LiveScoreboard({ onSelectAthlete }: LiveScoreboardProps) {
    const { activeResults, liveState } = useLiveData();
    const isFinal = liveState.stage === 'FINAL_LIVE' || liveState.stage === 'FINAL_COMPLETE';

    return (
        <div className="flex flex-col bg-[#12131A] rounded-xl border border-[#282B3A] overflow-hidden shadow-2xl h-full">

            {/* Header bar */}
            <div className="px-4 py-3 bg-[#0E0F15] border-b border-[#282B3A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#F59E0B]" />
                    <span className="font-headline-sm text-sm text-[#F8FAFC] tracking-wider uppercase">
                        {isFinal ? 'LIVE FINAL STANDINGS' : 'LIVE QUALIFICATION LEADERBOARD'}
                    </span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1A1C26] border border-[#282B3A] text-[#64748B]">
                    {activeResults.length} ATHLETES
                </span>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-y-auto max-h-[550px] lg:max-h-[640px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#0B0C10] border-b border-[#282B3A] font-mono text-[10px] text-[#64748B] uppercase tracking-wider sticky top-0 z-10">
                            <th className="py-2.5 px-3 w-12 text-center">POS</th>
                            <th className="py-2.5 px-2 w-12">BIB</th>
                            <th className="py-2.5 px-3">ATHLETE</th>
                            <th className="py-2.5 px-2 text-center">NOC</th>
                            <th className="py-2.5 px-2 text-right">LAST</th>
                            <th className="py-2.5 px-3 text-right">SCORE</th>
                            {isFinal && <th className="py-2.5 px-3 text-center">STATUS</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#282B3A]/50 font-mono text-xs">
                        {activeResults.map((ath, idx) => {
                            const pos = idx + 1;
                            const isLead = pos === 1;
                            const isPodium = pos <= 3;
                            const isEliminated = ath.finalStatus === 'ELIMINATED';

                            return (
                                <tr
                                    key={ath.participantId}
                                    onClick={() => onSelectAthlete?.(ath.participantId)}
                                    className={`group hover:bg-[#1A1C26]/80 transition-colors cursor-pointer ${isEliminated
                                            ? 'opacity-40 bg-[#12131A] line-through'
                                            : isLead
                                                ? 'bg-[#DC2626]/10 font-bold'
                                                : 'bg-transparent'
                                        }`}
                                >
                                    {/* Position + Delta */}
                                    <td className="py-3 px-3 text-center font-bold">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${isLead ? 'bg-[#F59E0B] text-[#0B0C10]' : isPodium ? 'bg-[#282B3A] text-[#F8FAFC]' : 'text-[#64748B]'
                                                }`}>
                                                {pos}
                                            </span>
                                            {ath.rankDelta && ath.rankDelta > 0 ? (
                                                <span className="text-[10px] text-[#22C55E] flex items-center animate-bounce">
                                                    <TrendingUp className="w-3 h-3" /> +{ath.rankDelta}
                                                </span>
                                            ) : ath.rankDelta && ath.rankDelta < 0 ? (
                                                <span className="text-[10px] text-[#EF4444] flex items-center">
                                                    <TrendingDown className="w-3 h-3" /> {ath.rankDelta}
                                                </span>
                                            ) : null}
                                        </div>
                                    </td>

                                    {/* Bib */}
                                    <td className="py-3 px-2 font-mono text-[#F59E0B]">
                                        {ath.bib}
                                    </td>

                                    {/* Name & Club */}
                                    <td className="py-3 px-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#F8FAFC] group-hover:text-[#DC2626] transition-colors truncate max-w-[140px] sm:max-w-none">
                                                {ath.name}
                                            </span>
                                            <span className="text-[10px] text-[#64748B] truncate max-w-[140px] sm:max-w-none">
                                                {ath.club}
                                            </span>
                                        </div>
                                    </td>

                                    {/* NOC */}
                                    <td className="py-3 px-2 text-center text-[#64748B] text-[11px] font-bold">
                                        {ath.noc}
                                    </td>

                                    {/* Last Shot */}
                                    <td className="py-3 px-2 text-right font-mono text-[#64748B]">
                                        {ath.lastShot !== undefined ? ath.lastShot.toFixed(1) : '-'}
                                    </td>

                                    {/* Total Score */}
                                    <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#F8FAFC] animate-score-change">
                                        {isFinal
                                            ? (ath.finalTotal || 0).toFixed(1)
                                            : ath.qualificationTotal.toFixed(1)}
                                    </td>

                                    {/* Status in Final */}
                                    {isFinal && (
                                        <td className="py-3 px-3 text-center">
                                            {isEliminated ? (
                                                <span className="px-2 py-0.5 rounded bg-[#EF4444]/20 border border-[#EF4444]/60 text-[9px] text-[#EF4444] font-bold">
                                                    ELIMINATED
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded bg-[#22C55E]/20 border border-[#22C55E]/60 text-[9px] text-[#22C55E] font-bold animate-pulse">
                                                    LIVE
                                                </span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 bg-[#0E0F15] border-t border-[#282B3A] text-center font-mono text-[10px] text-[#64748B]">
                DECIMAL SCORING (MAX 654.0) · REAL-TIME SYNCED
            </div>
        </div>
    );
}
