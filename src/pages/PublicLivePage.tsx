import React from 'react';
import { useLiveData } from '../context/LiveDataContext';
import YouTubeEmbed from '../components/YouTubeEmbed';
import LiveScoreboard from '../components/LiveScoreboard';
import CurrentShooterCard from '../components/CurrentShooterCard';
import DisciplineSwitcher from '../components/DisciplineSwitcher';
import ServerTimer from '../components/ServerTimer';
import { Radio } from 'lucide-react';

export default function PublicLivePage() {
    const { liveState, setCurrentShooterParticipant } = useLiveData();
    const isFinal = liveState.stage === 'FINAL_LIVE' || liveState.stage === 'FINAL_COMPLETE';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

            {/* Broadcast Sub-Header Telemetry Bar */}
            <div className="bg-[#12131A] p-4 rounded-xl border border-[#282B3A] flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Event Title & Stage */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#DC2626]/20 border border-[#DC2626] flex items-center justify-center shrink-0">
                        <Radio className="w-5 h-5 text-[#DC2626] animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#DC2626] tracking-widest uppercase">
                                🔴 LIVE BROADCAST
                            </span>
                            <span className="text-xs text-[#282B3A]">|</span>
                            <span className="font-mono text-xs text-[#F59E0B] font-bold uppercase">
                                RELAY 0{liveState.relay}
                            </span>
                        </div>
                        <h1 className="font-headline-sm text-2xl text-[#F8FAFC] tracking-wider uppercase">
                            {liveState.discipline === '10m_rifle' ? '10M AIR RIFLE' : '10M AIR PISTOL'} — {isFinal ? 'FINAL' : 'QUALIFICATION'}
                        </h1>
                    </div>
                </div>

                {/* Right Controls: Discipline Switcher & Timer */}
                <div className="flex items-center gap-3 flex-wrap">
                    <ServerTimer />
                    <DisciplineSwitcher />
                </div>
            </div>

            {/* Main Split Layout: Left 65-70% YouTube Live Stream / Right 30-35% Live Scoreboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Column: YouTube Embed Container (Desktop 7 of 12 cols = ~60-65% or 8 cols = 66%) */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                    <YouTubeEmbed
                        videoId={liveState.youtubeVideoId}
                        streamTitle={liveState.streamTitle}
                        cameraName={liveState.cameraName}
                    />

                    {/* Current Shooter Banner on Desktop */}
                    <div className="hidden lg:block">
                        <CurrentShooterCard />
                    </div>
                </div>

                {/* Right Column: Live Leaderboard (Desktop 5 of 12 cols = ~35-40%) */}
                <div className="lg:col-span-5 xl:col-span-4 h-full">
                    <LiveScoreboard onSelectAthlete={(id) => setCurrentShooterParticipant(id)} />
                </div>

            </div>

            {/* Mobile Stacked Current Shooter Card (Appears after YouTube stream on mobile) */}
            <div className="block lg:hidden">
                <CurrentShooterCard />
            </div>

        </div>
    );
}
