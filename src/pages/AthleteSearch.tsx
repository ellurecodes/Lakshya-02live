import { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { Search } from 'lucide-react';

export default function AthleteSearch() {
    const { athleteResults } = useLiveData();
    const [query, setQuery] = useState('');

    const filtered = athleteResults.filter(
        a => a.bib.toLowerCase().includes(query.toLowerCase()) || a.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-mono">

            {/* Search Header */}
            <div className="bg-[#12131A] p-6 rounded-xl border border-[#282B3A] space-y-4">
                <div className="flex items-center gap-3">
                    <Search className="w-6 h-6 text-[#DC2626]" />
                    <div>
                        <span className="text-xs text-[#DC2626] font-bold uppercase tracking-widest block">
                            PUBLIC ATHLETE & SCORES DATABASE
                        </span>
                        <h1 className="font-headline-sm text-2xl text-[#F8FAFC] uppercase tracking-wider">
                            SEARCH ATHLETE OR BIB NUMBER
                        </h1>
                    </div>
                </div>

                <div className="relative max-w-xl">
                    <Search className="w-5 h-5 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Type athlete name or Bib number (e.g. Rahul, 021)..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-xl pl-11 pr-4 py-3 text-sm text-[#F8FAFC] focus:outline-none"
                    />
                </div>
            </div>

            {/* Results List */}
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="bg-[#12131A] p-8 rounded-xl border border-[#282B3A] text-center text-[#64748B]">
                        No matching athletes found for "{query}". Try searching by Bib number like "021" or "014".
                    </div>
                ) : (
                    filtered.map(ath => (
                        <div key={ath.participantId} className="bg-[#12131A] p-6 rounded-xl border border-[#282B3A] space-y-4">

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#282B3A]">
                                <div>
                                    <div className="text-xs text-[#F59E0B] font-bold">
                                        BIB {ath.bib} • NOC {ath.noc} • RELAY 0{ath.relay} • FP {ath.firingPoint}
                                    </div>
                                    <h2 className="font-headline-sm text-2xl text-[#F8FAFC] uppercase tracking-wider">
                                        {ath.name}
                                    </h2>
                                    <div className="text-xs text-[#64748B]">{ath.club}</div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="bg-[#0B0C10] px-4 py-2 rounded-lg border border-[#282B3A] text-right">
                                        <div className="text-[9px] text-[#64748B] uppercase">QUALIFICATION RANK</div>
                                        <div className="text-xl font-bold text-[#F59E0B]">#{ath.qualificationRank}</div>
                                    </div>

                                    <div className="bg-[#0B0C10] px-4 py-2 rounded-lg border border-[#DC2626]/60 text-right">
                                        <div className="text-[9px] text-[#DC2626] uppercase font-bold">TOTAL SCORE</div>
                                        <div className="text-xl font-bold text-[#F8FAFC]">{ath.qualificationTotal.toFixed(1)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* 60 Shots Breakdown Grid */}
                            <div className="space-y-2">
                                <div className="text-xs text-[#64748B] uppercase font-bold">
                                    SHOT BREAKDOWN ({ath.qualificationShots.length} / 60 SHOTS):
                                </div>
                                <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-1.5 text-xs">
                                    {ath.qualificationShots.map((s, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-1.5 rounded text-center border ${s >= 10.4
                                                    ? 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]'
                                                    : s >= 10.0
                                                        ? 'bg-[#0B0C10] border-[#282B3A] text-[#F8FAFC]'
                                                        : 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
                                                }`}
                                        >
                                            <div className="text-[9px] text-[#64748B]">#{idx + 1}</div>
                                            <div className="font-bold">{s.toFixed(1)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Final Phase Details if available */}
                            {ath.finalShots && (
                                <div className="pt-3 border-t border-[#282B3A] flex items-center justify-between text-xs">
                                    <span className="text-[#F59E0B] font-bold">
                                        FINAL PHASE: RANK #{ath.finalRank} ({ath.finalStatus})
                                    </span>
                                    <span className="text-[#F8FAFC] font-bold">
                                        FINAL TOTAL: {(ath.finalTotal || 0).toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}
