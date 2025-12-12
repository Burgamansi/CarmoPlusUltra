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
import { auth } from "../services/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithGoogle: () => Promise<UserCredential>;
    loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
    registerWithEmail: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    loginWithGoogle: async () => { throw new Error("Not implemented"); },
    loginWithEmail: async () => { throw new Error("Not implemented"); },
    registerWithEmail: async () => { throw new Error("Not implemented"); },
    logout: async () => { throw new Error("Not implemented"); },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
    };

    const loginWithEmail = async (email: string, password: string) => {
        return await signInWithEmailAndPassword(auth, email, password);
    };

    const registerWithEmail = async (email: string, password: string) => {
        return await createUserWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        return await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithGoogle,
            loginWithEmail,
            registerWithEmail,
            logout
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
