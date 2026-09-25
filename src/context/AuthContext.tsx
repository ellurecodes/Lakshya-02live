import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole } from '../types/shooting';

interface AuthContextType {
    role: UserRole;
    setRole: (r: UserRole) => void;
    userName: string;
    setUserName: (n: string) => void;
    loginAsRole: (r: UserRole, name?: string) => void;
    validateAdminPasscode: (pin: string) => boolean;
    logout: () => void;
    isAdmin: boolean;
    isScorer: boolean;
    isOfficial: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [role, setRole] = useState<UserRole>(() => {
        const saved = localStorage.getItem('lakshya_user_role');
        return (saved as UserRole) || 'PUBLIC';
    });

    const [userName, setUserName] = useState<string>(() => {
        return localStorage.getItem('lakshya_user_name') || 'Guest Viewer';
    });

    useEffect(() => {
        localStorage.setItem('lakshya_user_role', role);
        localStorage.setItem('lakshya_user_name', userName);
    }, [role, userName]);

    const validateAdminPasscode = (pin: string): boolean => {
        // Default admin PIN: 2026 or admin
        if (pin.trim() === '2026' || pin.trim().toLowerCase() === 'admin') {
            loginAsRole('ADMIN', 'Chief Admin');
            return true;
        }
        return false;
    };

    const loginAsRole = (newRole: UserRole, name?: string) => {
        setRole(newRole);
        if (name) {
            setUserName(name);
        } else {
            if (newRole === 'ADMIN') setUserName('Chief Admin');
            else if (newRole === 'SCORER') setUserName('Range Scorer SC003');
            else if (newRole === 'OFFICIAL') setUserName('Chief Official OF001');
            else if (newRole === 'JURY') setUserName('ISSF Jury Member');
            else setUserName('Guest Viewer');
        }
    };

    const logout = () => {
        setRole('PUBLIC');
        setUserName('Guest Viewer');
    };

    return (
        <AuthContext.Provider
            value={{
                role,
                setRole,
                userName,
                setUserName,
                loginAsRole,
                validateAdminPasscode,
                logout,
                isAdmin: role === 'ADMIN',
                isScorer: role === 'SCORER' || role === 'ADMIN',
                isOfficial: role === 'OFFICIAL' || role === 'ADMIN' || role === 'JURY',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
