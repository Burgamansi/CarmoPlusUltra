import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    UserCredential
} from "firebase/auth";
import { auth, firebaseError } from "../services/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    loginWithGoogle: () => Promise<UserCredential>;
    loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
    registerWithEmail: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    error: null,
    loginWithGoogle: async () => { throw new Error("Not implemented"); },
    loginWithEmail: async () => { throw new Error("Not implemented"); },
    registerWithEmail: async () => { throw new Error("Not implemented"); },
    logout: async () => { throw new Error("Not implemented"); },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(firebaseError);

    useEffect(() => {
        console.log("[AuthProvider] Initializing auth state listener");
        
        if (firebaseError) {
            console.warn("[AuthProvider] Firebase initialization failed, skipping auth check");
            setError(firebaseError);
            setLoading(false);
            return;
        }

        try {
            const unsub = onAuthStateChanged(auth, (currentUser) => {
                console.log("[AuthProvider] Auth state changed:", currentUser?.email || "anonymous");
                setUser(currentUser);
                setLoading(false);
            }, (err) => {
                console.error("[AuthProvider] Auth state listener error:", err);
                setError(err.message);
                setLoading(false);
            });

            return () => unsub();
        } catch (err: any) {
            console.error("[AuthProvider] Exception in auth setup:", err);
            setError(err.message);
            setLoading(false);
        }
    }, []);

    const loginWithGoogle = async () => {
        if (!auth) throw new Error("Firebase not initialized");
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
    };

    const loginWithEmail = async (email: string, password: string) => {
        if (!auth) throw new Error("Firebase not initialized");
        return await signInWithEmailAndPassword(auth, email, password);
    };

    const registerWithEmail = async (email: string, password: string) => {
        if (!auth) throw new Error("Firebase not initialized");
        return await createUserWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        if (!auth) throw new Error("Firebase not initialized");
        return await signOut(auth);
    };

    console.log("[AuthProvider] Rendering with loading:", loading, "error:", error);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            loginWithGoogle,
            loginWithEmail,
            registerWithEmail,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
