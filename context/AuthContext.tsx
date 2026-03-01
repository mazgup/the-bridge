import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// ============================================================
// Admin emails — hardcoded for security
// ============================================================
const ADMIN_EMAILS = [
    'mazgup@gmail.com',
];

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthorized: boolean;
    isAdmin: boolean;
    accessDenied: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    devLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

    // Check if a user is allowed (exists in allowedUsers collection)
    const checkAuthorization = async (firebaseUser: User): Promise<{ authorized: boolean; admin: boolean }> => {
        const email = firebaseUser.email?.toLowerCase();
        if (!email) return { authorized: false, admin: false };

        // Check if user exists in allowedUsers
        const userDocRef = doc(db, 'allowedUsers', email);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const data = userDoc.data();
            // Update last active timestamp and UID
            await updateDoc(userDocRef, {
                lastActive: new Date().toISOString(),
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
            });
            return {
                authorized: true,
                admin: data.role === 'admin',
            };
        }

        // Not in allowedUsers — check for pending invite in sessionStorage
        const pendingInviteId = sessionStorage.getItem('pendingInviteId');
        if (pendingInviteId) {
            sessionStorage.removeItem('pendingInviteId');

            // Validate the invite
            const inviteRef = doc(db, 'invites', pendingInviteId);
            const inviteDoc = await getDoc(inviteRef);

            if (inviteDoc.exists()) {
                const inviteData = inviteDoc.data();
                const now = new Date();
                const expiresAt = inviteData.expiresAt?.toDate?.() || new Date(inviteData.expiresAt);

                if (!inviteData.used && expiresAt > now) {
                    // Valid invite! Register the user
                    const isAdminUser = ADMIN_EMAILS.includes(email);

                    await setDoc(userDocRef, {
                        email,
                        role: isAdminUser ? 'admin' : 'user',
                        uid: firebaseUser.uid,
                        displayName: firebaseUser.displayName || '',
                        photoURL: firebaseUser.photoURL || '',
                        inviteId: pendingInviteId,
                        createdAt: new Date().toISOString(),
                        lastActive: new Date().toISOString(),
                    });

                    // Mark invite as used
                    await updateDoc(inviteRef, {
                        used: true,
                        usedBy: firebaseUser.uid,
                        usedByEmail: email,
                        usedAt: new Date().toISOString(),
                    });

                    return { authorized: true, admin: isAdminUser };
                }
            }
        }

        // Admin emails are always allowed (self-register)
        if (ADMIN_EMAILS.includes(email)) {
            await setDoc(userDocRef, {
                email,
                role: 'admin',
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                inviteId: 'admin-self-register',
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
            });
            return { authorized: true, admin: true };
        }

        // Not authorized
        return { authorized: false, admin: false };
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    const { authorized, admin } = await checkAuthorization(firebaseUser);
                    setIsAuthorized(authorized);
                    setIsAdmin(admin);
                    setAccessDenied(!authorized);
                } catch (error) {
                    console.error('Authorization check failed:', error);
                    setIsAuthorized(false);
                    setIsAdmin(false);
                    setAccessDenied(true);
                }
            } else {
                setIsAuthorized(false);
                setIsAdmin(false);
                setAccessDenied(false);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setIsAuthorized(false);
            setIsAdmin(false);
            setAccessDenied(false);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    const devLogin = async () => {
        const mockUser: any = {
            uid: 'dev-user-123',
            email: 'dev@example.com',
            displayName: 'Dev User',
            photoURL: '',
            emailVerified: true,
        };
        setUser(mockUser);
        setIsAuthorized(true);
        setIsAdmin(true);
        setAccessDenied(false);
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthorized, isAdmin, accessDenied, signInWithGoogle, logout, devLogin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
