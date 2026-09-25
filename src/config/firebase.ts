import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    type DocumentData
} from 'firebase/firestore';
import {
    getDatabase,
    ref,
    onValue,
    set,
    update,
    type Database
} from 'firebase/database';

// Empty/placeholder Firebase configuration (Add your real credentials in .env or update here when ready)
const firebaseConfig = {
    apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "",
    authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "",
    databaseURL: (import.meta as any).env?.VITE_FIREBASE_DATABASE_URL || ""
};

// Dummy app initialization fallback if credentials are empty
const dummyConfig = { apiKey: "demo-api-key", projectId: "demo-project" };

export const app = getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig.apiKey ? firebaseConfig : dummyConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb: Database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    type User,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    ref,
    onValue,
    set,
    update,
    type DocumentData
};
