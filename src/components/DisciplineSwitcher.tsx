import React from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { Crosshair, Target } from 'lucide-react';
import type { Discipline } from '../types/shooting';

export default function DisciplineSwitcher() {
    const { liveState, switchDiscipline } = useLiveData();

    return (
        <div className="flex items-center gap-2 bg-[#12131A] p-1.5 rounded-lg border border-[#282B3A]">
            <button
                onClick={() => switchDiscipline('10m_rifle')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-mono text-xs font-bold tracking-wider transition-all ${liveState.discipline === '10m_rifle'
                        ? 'bg-[#DC2626] text-[#F8FAFC] shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                        : 'text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1A1C26]'
                    }`}
            >
                <Crosshair className="w-4 h-4" />
                <span>10M AIR RIFLE</span>
            </button>

            <button
                onClick={() => switchDiscipline('10m_pistol')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-mono text-xs font-bold tracking-wider transition-all ${liveState.discipline === '10m_pistol'
                        ? 'bg-[#DC2626] text-[#F8FAFC] shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                        : 'text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1A1C26]'
                    }`}
            >
                <Target className="w-4 h-4" />
                <span>10M AIR PISTOL</span>
            </button>
        </div>
    );
}
