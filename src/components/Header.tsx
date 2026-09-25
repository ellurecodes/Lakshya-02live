import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Shield,
    LogOut,
    X,
    Lock,
    Menu,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

interface HeaderProps {
    currentView: string;
    setView: (v: string) => void;
}

export default function Header({ currentView, setView }: HeaderProps) {
    const { role, userName, validateAdminPasscode, logout, isAdmin, isScorer } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [adminModalOpen, setAdminModalOpen] = useState(false);
    const [adminPasscode, setAdminPasscode] = useState('');
    const [passcodeError, setPasscodeError] = useState(false);

    const handleAdminLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = validateAdminPasscode(adminPasscode);
        if (success) {
            setAdminModalOpen(false);
            setAdminPasscode('');
            setPasscodeError(false);
            setView('admin'); // Navigate to Admin Dashboard upon login
        } else {
            setPasscodeError(true);
        }
    };

    const handleNavClick = (viewId: string) => {
        setView(viewId);
        setMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 left-0 w-full z-50 bg-[#0B0C10]/95 border-b border-[#282B3A]/80 shadow-[0_4px_25px_rgba(0,0,0,0.85)] backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-20 flex items-center justify-between gap-3 relative">

                    {/* LEFT GROUP: RVCE Logo + Text + Red Vertical Line */}
                    <div className="flex items-center gap-4 shrink-0">
                        <button
                            onClick={() => handleNavClick('live')}
                            className="flex items-center gap-3 text-left shrink-0 group focus:outline-none"
                        >
                            <img
                                src="/assets/logos/RVCE Logo.webp"
                                alt="RV College of Engineering"
                                className="h-10 sm:h-12 w-auto object-contain brightness-110"
                            />
                            <div className="flex flex-col">
                                <span className="font-mono text-xs sm:text-sm font-bold text-[#F8FAFC] tracking-wide uppercase">
                                    RV College of
                                </span>
                                <span className="font-mono text-[10px] text-[#94A3B8] tracking-wider uppercase">
                                    Engineering®
                                </span>
                            </div>
                        </button>

                        {/* Vertical Red Divider */}
                        <div className="h-8 w-[1px] bg-[#DC2626] shadow-[0_0_8px_rgba(220,38,38,0.6)] ml-1 shrink-0" />
                    </div>

                    {/* CENTER GROUP: Nav Links & Centered GARE Logo */}
                    <div className="hidden md:flex items-center justify-center flex-1 gap-6 lg:gap-10">

                        {/* Nav Item: Leaderboard */}
                        <button
                            onClick={() => handleNavClick('live')}
                            className={`font-mono text-xs uppercase tracking-widest transition-colors ${currentView === 'live'
                                    ? 'text-[#F8FAFC] font-bold border-b-2 border-[#DC2626] pb-1'
                                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                                }`}
                        >
                            LEADERBOARD
                        </button>

                        {/* Nav Item: Score Cards */}
                        <button
                            onClick={() => handleNavClick('search')}
                            className={`font-mono text-xs uppercase tracking-widest transition-colors ${currentView === 'search'
                                    ? 'text-[#F8FAFC] font-bold border-b-2 border-[#DC2626] pb-1'
                                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                                }`}
                        >
                            SCORE CARDS
                        </button>

                        {/* Exact Center GARE Crest Logo */}
                        <div className="flex items-center justify-center px-2 shrink-0">
                            <img
                                src="/assets/logos/GARE Logo.webp"
                                alt="GARE"
                                className="h-8 sm:h-9 w-auto object-contain brightness-110 opacity-90"
                            />
                        </div>

                        {/* Scorer Panel Link (Only visible if Admin or Scorer authenticated) */}
                        {isScorer && (
                            <button
                                onClick={() => handleNavClick('scorer')}
                                className={`font-mono text-xs uppercase tracking-widest transition-colors ${currentView === 'scorer'
                                        ? 'text-[#F59E0B] font-bold border-b-2 border-[#F59E0B] pb-1'
                                        : 'text-[#94A3B8] hover:text-[#F59E0B]'
                                    }`}
                            >
                                SCORER PANEL
                            </button>
                        )}

                        {/* Admin Control Center Link (Only visible if Admin authenticated) */}
                        {isAdmin && (
                            <button
                                onClick={() => handleNavClick('admin')}
                                className={`font-mono text-xs uppercase tracking-widest transition-colors ${currentView === 'admin'
                                        ? 'text-[#DC2626] font-bold border-b-2 border-[#DC2626] pb-1'
                                        : 'text-[#94A3B8] hover:text-[#DC2626]'
                                    }`}
                            >
                                CONTROL CENTER
                            </button>
                        )}
                    </div>

                    {/* RIGHT GROUP: ADMIN Button + Red Divider + NCC Logo + User Circle */}
                    <div className="flex items-center gap-3 shrink-0">

                        {/* ADMIN Login / Dashboard Button (Styled matching reference image) */}
                        {!isAdmin ? (
                            <button
                                onClick={() => setAdminModalOpen(true)}
                                className="px-3.5 py-1.5 rounded-md bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B] text-[#F59E0B] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            >
                                <Shield className="w-3.5 h-3.5 text-[#F59E0B]" />
                                <span>ADMIN</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => handleNavClick('admin')}
                                className="px-3.5 py-1.5 rounded-md bg-[#DC2626]/20 border border-[#DC2626] text-[#F8FAFC] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(220,38,38,0.4)]"
                            >
                                <Shield className="w-3.5 h-3.5 text-[#DC2626]" />
                                <span>CONTROL PANEL</span>
                            </button>
                        )}

                        {/* Vertical Red Divider */}
                        <div className="h-8 w-[1px] bg-[#DC2626] shadow-[0_0_8px_rgba(220,38,38,0.6)] hidden sm:block shrink-0" />

                        {/* NCC Logo */}
                        <div className="hidden sm:flex items-center shrink-0">
                            <img
                                src="/assets/logos/NCC Logo.webp"
                                alt="NCC"
                                className="h-10 w-auto object-contain brightness-110"
                            />
                        </div>

                        {/* Active User Circle Avatar */}
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-full border border-[#DC2626] bg-[#12131A] text-[#F8FAFC] font-mono text-xs font-bold flex items-center justify-center shadow-md"
                                title={`Role: ${role} (${userName})`}
                            >
                                {userName.charAt(0).toUpperCase() || 'V'}
                            </div>

                            {/* Logout button if authenticated */}
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        logout();
                                        setView('live');
                                    }}
                                    className="p-1.5 text-[#64748B] hover:text-[#EF4444] transition-colors"
                                    title="Logout Admin Session"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Mobile Hamburger Menu Toggle */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#1A1C26] rounded transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#0E0F15] border-b border-[#282B3A] px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-fade-in font-mono text-xs">
                    <button
                        onClick={() => handleNavClick('live')}
                        className={`w-full text-left px-3 py-2 rounded font-bold uppercase ${currentView === 'live' ? 'bg-[#DC2626]/20 border border-[#DC2626] text-[#F8FAFC]' : 'text-[#94A3B8]'
                            }`}
                    >
                        LEADERBOARD & LIVE STREAM
                    </button>

                    <button
                        onClick={() => handleNavClick('search')}
                        className={`w-full text-left px-3 py-2 rounded font-bold uppercase ${currentView === 'search' ? 'bg-[#DC2626]/20 border border-[#DC2626] text-[#F8FAFC]' : 'text-[#94A3B8]'
                            }`}
                    >
                        PARTICIPANT SCORE CARDS
                    </button>

                    {isScorer && (
                        <button
                            onClick={() => handleNavClick('scorer')}
                            className="w-full text-left px-3 py-2 rounded font-bold uppercase text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/40"
                        >
                            RANGE SCORER PANEL
                        </button>
                    )}

                    {isAdmin && (
                        <button
                            onClick={() => handleNavClick('admin')}
                            className="w-full text-left px-3 py-2 rounded font-bold uppercase text-[#DC2626] bg-[#DC2626]/10 border border-[#DC2626]/40"
                        >
                            CONTROL CENTER
                        </button>
                    )}

                    {!isAdmin && (
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                setAdminModalOpen(true);
                            }}
                            className="w-full py-2.5 mt-2 rounded bg-[#F59E0B]/20 border border-[#F59E0B] text-[#F59E0B] font-bold uppercase flex items-center justify-center gap-2"
                        >
                            <Shield className="w-4 h-4" /> ADMIN LOGIN
                        </button>
                    )}
                </div>
            )}

            {/* ADMIN PASSCODE AUTHENTICATION MODAL */}
            {adminModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#12131A] border border-[#F59E0B] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-fade-in font-mono">
                        <div className="flex items-center justify-between border-b border-[#282B3A] pb-3">
                            <h3 className="font-headline-sm text-lg text-[#F8FAFC] tracking-wider uppercase flex items-center gap-2">
                                <Lock className="w-5 h-5 text-[#F59E0B]" />
                                ADMIN COMMAND ACCESS
                            </h3>
                            <button
                                onClick={() => {
                                    setAdminModalOpen(false);
                                    setPasscodeError(false);
                                }}
                                className="text-[#64748B] hover:text-[#F8FAFC]"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
                            <p className="text-[#94A3B8]">
                                Enter Administrator Security PIN to unlock live scoring panel, stream settings, and event lifecycle controls.
                            </p>

                            <div>
                                <label className="text-[#64748B] uppercase block mb-1 font-bold">Admin Security PIN</label>
                                <input
                                    type="password"
                                    placeholder="Enter PIN (e.g. 2026 or admin)..."
                                    value={adminPasscode}
                                    onChange={e => {
                                        setAdminPasscode(e.target.value);
                                        setPasscodeError(false);
                                    }}
                                    autoFocus
                                    className="w-full bg-[#0B0C10] border border-[#282B3A] focus:border-[#F59E0B] rounded-lg px-4 py-2.5 text-[#F8FAFC] font-bold text-base focus:outline-none"
                                />
                            </div>

                            {passcodeError && (
                                <div className="p-2.5 bg-[#EF4444]/20 border border-[#EF4444] rounded text-[#EF4444] text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>Invalid PIN. Default PIN is <strong>2026</strong> or <strong>admin</strong>.</span>
                                </div>
                            )}

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAdminModalOpen(false)}
                                    className="px-4 py-2 bg-[#1A1C26] text-[#64748B] hover:text-[#F8FAFC] rounded uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0C10] font-bold rounded uppercase flex items-center gap-2 shadow-lg"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Authenticate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </header>
    );
}
