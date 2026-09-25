import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import {
    Shield,
    CheckCircle2,
    Tv,
    FileSpreadsheet,
    Upload,
    Check,
    AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Participant } from '../types/shooting';

export default function AdminDashboard() {
    const { liveState, updateLiveState, participants, importParticipants } = useLiveData();

    // YouTube Live settings state
    const [ytVideoIdInput, setYtVideoIdInput] = useState<string>(liveState.youtubeVideoId);
    const [ytTitleInput, setYtTitleInput] = useState<string>(liveState.streamTitle);
    const [ytCameraInput, setYtCameraInput] = useState<string>(liveState.cameraName);
    const [ytSavedMessage, setYtSavedMessage] = useState<boolean>(false);

    // CSV/XLSX Importer State
    const [importPreview, setImportPreview] = useState<Participant[]>([]);
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
    const [importedCountMessage, setImportedCountMessage] = useState<string | null>(null);

    const handleUpdateStreamSettings = (e: React.FormEvent) => {
        e.preventDefault();
        updateLiveState({
            youtubeVideoId: ytVideoIdInput.trim(),
            streamTitle: ytTitleInput.trim(),
            cameraName: ytCameraInput.trim(),
        });
        setYtSavedMessage(true);
        setTimeout(() => setYtSavedMessage(false), 3000);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = evt => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws) as any[];

                const parsed: Participant[] = [];
                const errors: string[] = [];
                const seenBibs = new Set<string>();
                const seenIds = new Set<string>();

                // Existing bibs in DB
                participants.forEach(p => seenBibs.add(p.bib));

                data.forEach((row, idx) => {
                    const bib = String(row['Bib'] || row['Bib Number'] || row['bib'] || '').trim();
                    const name = String(row['Name'] || row['Athlete Name'] || row['name'] || '').trim();
                    const id = String(row['Participant ID'] || row['ID'] || `p-imp-${idx + 1}`).trim();
                    const gender = (row['Gender'] || 'M').toUpperCase().startsWith('F') ? 'F' : 'M';
                    const category = row['Category'] || 'Senior';
                    const club = row['Club'] || row['College'] || 'Shooting Club';
                    const noc = row['NOC'] || 'IND';
                    const relay = parseInt(row['Relay']) || 4;
                    const firingPoint = parseInt(row['Firing Point'] || row['FP']) || (idx + 1);

                    if (!bib) {
                        errors.push(`Row ${idx + 1}: Missing mandatory Bib Number`);
                    } else if (seenBibs.has(bib)) {
                        errors.push(`Row ${idx + 1}: Duplicate Bib Number "${bib}" detected`);
                    } else {
                        seenBibs.add(bib);
                    }

                    if (seenIds.has(id)) {
                        errors.push(`Row ${idx + 1}: Duplicate Participant ID "${id}" detected`);
                    } else {
                        seenIds.add(id);
                    }

                    if (bib && name) {
                        parsed.push({
                            id,
                            bib,
                            name,
                            gender,
                            category,
                            club,
                            noc,
                            relay,
                            firingPoint,
                            discipline: liveState.discipline,
                        });
                    }
                });

                setImportPreview(parsed);
                setImportErrors(errors);
                setIsImportModalOpen(true);
            } catch (err) {
                alert('Error parsing CSV/XLSX file. Please check file format.');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleConfirmImport = () => {
        if (importPreview.length > 0) {
            importParticipants(importPreview);
            setImportedCountMessage(`Successfully imported ${importPreview.length} valid participant records!`);
            setIsImportModalOpen(false);
            setImportPreview([]);
            setImportErrors([]);
            setTimeout(() => setImportedCountMessage(null), 4000);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

            {/* Header Banner */}
            <div className="bg-[#12131A] p-4 rounded-xl border border-[#282B3A] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B] flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-[#F59E0B]" />
                    </div>
                    <div>
                        <span className="font-mono text-xs text-[#F59E0B] font-bold tracking-widest uppercase">
                            COMMAND PORTAL
                        </span>
                        <h1 className="font-headline-sm text-2xl text-[#F8FAFC] tracking-wider uppercase">
                            LAKSHYA CONTROL CENTER — {liveState.eventName}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Overview Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                <div className="bg-[#12131A] p-4 rounded-xl border border-[#282B3A]">
                    <div className="text-[10px] text-[#64748B] uppercase">TOTAL REGISTERED</div>
                    <div className="text-2xl font-bold text-[#F8FAFC]">{participants.length + 712}</div>
                </div>

                <div className="bg-[#12131A] p-4 rounded-xl border border-[#282B3A]">
                    <div className="text-[10px] text-[#64748B] uppercase">COMPLETED QUALIFICATION</div>
                    <div className="text-2xl font-bold text-[#22C55E]">436</div>
                </div>

                <div className="bg-[#12131A] p-4 rounded-xl border border-[#DC2626]/60">
                    <div className="text-[10px] text-[#DC2626] font-bold uppercase">CURRENTLY SHOOTING</div>
                    <div className="text-2xl font-bold text-[#F8FAFC]">8</div>
                </div>

                <div className="bg-[#12131A] p-4 rounded-xl border border-[#282B3A]">
                    <div className="text-[10px] text-[#64748B] uppercase">WAITING RELAYS</div>
                    <div className="text-2xl font-bold text-[#F59E0B]">276</div>
                </div>
            </div>

            {/* Main Controls Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Col: CSV & XLSX Participant Importer Card (7 cols) */}
                <div className="lg:col-span-7 space-y-6">

                    <div className="bg-[#12131A] p-5 rounded-xl border border-[#282B3A] space-y-4">
                        <h2 className="font-headline-sm text-lg text-[#F8FAFC] tracking-wider uppercase border-b border-[#282B3A] pb-2 flex items-center justify-between">
                            <span>PARTICIPANT BATCH IMPORTER (CSV / XLSX)</span>
                            <FileSpreadsheet className="w-5 h-5 text-[#22C55E]" />
                        </h2>

                        {importedCountMessage && (
                            <div className="p-3 bg-[#22C55E]/20 border border-[#22C55E] rounded-lg font-mono text-xs text-[#22C55E] flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> {importedCountMessage}
                            </div>
                        )}

                        <div className="p-6 border-2 border-dashed border-[#282B3A] hover:border-[#DC2626] rounded-xl text-center bg-[#0B0C10] transition-colors space-y-3">
                            <Upload className="w-8 h-8 text-[#DC2626] mx-auto" />
                            <div className="font-mono text-xs text-[#CBD5E1]">
                                Upload CSV or XLSX file containing Bib, Athlete Name, Club, Gender, Category, Relay, and Firing Point
                            </div>

                            <input
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="participant-file-input"
                            />
                            <label
                                htmlFor="participant-file-input"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#DC2626] hover:bg-[#E51A1A] text-[#F8FAFC] font-mono text-xs font-bold uppercase rounded-lg cursor-pointer shadow-lg"
                            >
                                <FileSpreadsheet className="w-4 h-4" /> Select CSV / XLSX File
                            </label>
                        </div>
                    </div>

                </div>

                {/* Right Col: YouTube Live Broadcast Config (5 cols) */}
                <div className="lg:col-span-5 space-y-6">

                    <div className="bg-[#12131A] p-5 rounded-xl border border-[#282B3A] space-y-4">
                        <h2 className="font-headline-sm text-lg text-[#F8FAFC] tracking-wider uppercase border-b border-[#282B3A] pb-2 flex items-center justify-between">
                            <span>YOUTUBE LIVE STREAM CONFIGURATION</span>
                            <Tv className="w-5 h-5 text-[#DC2626]" />
                        </h2>

                        {ytSavedMessage && (
                            <div className="p-3 bg-[#22C55E]/20 border border-[#22C55E] rounded-lg font-mono text-xs text-[#22C55E] flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> YOUTUBE LIVE STREAM UPDATED! PUBLIC UI IS SYNCED.
                            </div>
                        )}

                        <form onSubmit={handleUpdateStreamSettings} className="space-y-4 font-mono text-xs">
                            <div>
                                <label className="text-[#64748B] uppercase block mb-1">YouTube Live Video ID</label>
                                <input
                                    type="text"
                                    placeholder="e.g. jfKfPfyJRdk"
                                    value={ytVideoIdInput}
                                    onChange={e => setYtVideoIdInput(e.target.value)}
                                    className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-lg px-3 py-2 text-[#F59E0B] font-bold focus:outline-none"
                                />
                                <span className="text-[10px] text-[#64748B] mt-1 block">
                                    Example YouTube ID extracted from video URL: <code>youtube.com/watch?v=<strong>ID</strong></code>
                                </span>
                            </div>

                            <div>
                                <label className="text-[#64748B] uppercase block mb-1">Stream Broadcast Title</label>
                                <input
                                    type="text"
                                    value={ytTitleInput}
                                    onChange={e => setYtTitleInput(e.target.value)}
                                    className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-lg px-3 py-2 text-[#F8FAFC] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[#64748B] uppercase block mb-1">Camera Feed Name</label>
                                <input
                                    type="text"
                                    value={ytCameraInput}
                                    onChange={e => setYtCameraInput(e.target.value)}
                                    className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#DC2626] rounded-lg px-3 py-2 text-[#F8FAFC] focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#DC2626] hover:bg-[#E51A1A] text-[#F8FAFC] font-bold uppercase rounded-lg shadow-lg flex items-center justify-center gap-2"
                            >
                                <Tv className="w-4 h-4" /> Update Live Stream Broadcast
                            </button>
                        </form>
                    </div>

                </div>
            </div>

            {/* CSV/XLSX Import Validation & Preview Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#12131A] border border-[#282B3A] rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#282B3A] pb-3">
                            <h3 className="font-headline-sm text-lg text-[#F8FAFC] tracking-wider uppercase flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-[#22C55E]" />
                                IMPORT PREVIEW & DUPLICATE VALIDATION
                            </h3>
                            <button
                                onClick={() => setIsImportModalOpen(false)}
                                className="text-[#64748B] hover:text-[#F8FAFC]"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Error alerts if duplicates or missing fields */}
                        {importErrors.length > 0 && (
                            <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/60 rounded-lg space-y-1 font-mono text-xs text-[#EF4444]">
                                <div className="font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-4 h-4" /> Detected Validation Issues:
                                </div>
                                <ul className="list-disc list-inside max-h-24 overflow-y-auto space-y-0.5 text-[11px]">
                                    {importErrors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Valid Rows Preview Table */}
                        <div className="space-y-2 font-mono text-xs">
                            <div className="text-[#64748B] uppercase">Valid Records Ready to Import ({importPreview.length}):</div>
                            <div className="max-h-60 overflow-y-auto border border-[#282B3A] rounded-lg bg-[#0B0C10]">
                                <table className="w-full text-left">
                                    <thead className="bg-[#1A1C26] text-[#64748B] uppercase text-[10px]">
                                        <tr>
                                            <th className="p-2">Bib</th>
                                            <th className="p-2">Name</th>
                                            <th className="p-2">Club</th>
                                            <th className="p-2">Relay</th>
                                            <th className="p-2">FP</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#282B3A]/40 text-[#F8FAFC]">
                                        {importPreview.map((p, idx) => (
                                            <tr key={idx}>
                                                <td className="p-2 text-[#F59E0B] font-bold">{p.bib}</td>
                                                <td className="p-2">{p.name}</td>
                                                <td className="p-2 text-[#64748B]">{p.club}</td>
                                                <td className="p-2">R0{p.relay}</td>
                                                <td className="p-2">FP {p.firingPoint}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-3 font-mono text-xs">
                            <button
                                onClick={() => setIsImportModalOpen(false)}
                                className="px-4 py-2 bg-[#1A1C26] text-[#64748B] hover:text-[#F8FAFC] rounded uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                disabled={importPreview.length === 0}
                                className="px-5 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0C10] font-bold rounded uppercase flex items-center gap-2 shadow-lg"
                            >
                                <Check className="w-4 h-4" /> Import {importPreview.length} Records
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
