import React from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { Clock } from 'lucide-react';

export default function ServerTimer() {
    const { liveState } = useLiveData();

    const secondsRemaining = liveState.timerTargetEpoch
        ? Math.max(0, Math.floor((liveState.timerTargetEpoch - Date.now()) / 1000))
        : 0;

    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0C10] border border-[#282B3A] font-mono text-xs text-[#F8FAFC]">
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-[#64748B] uppercase tracking-wider text-[10px]">
                {liveState.stage.replace('_LIVE', '')}
            </span>
            <span className="font-bold text-sm text-[#F59E0B]">
                {formattedTime}
            </span>
        </div>
    );
}
