import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type Role = 'individual' | 'corporate' | 'farmer';

interface AuthContextType {
  isLoggedIn: boolean;
  role: Role;
  user: FirebaseUser | null;
  loading: boolean;
  login: (role: Role) => void; // This will trigger provider-based login in a real app, but here we set role for simplicity if we use Google
  logout: () => Promise<void>;
  updateRole: (newRole: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<Role>('individual');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch role from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setRole(userDoc.data().role as Role);
        } else {
          // If first time login, default to individual or wait for selection
          // For this specific app flow, we'll allow selection in LoginScreen then update
          setRole('individual');
        }
      } else {
        setUser(null);
        setRole('individual');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (selectedRole: Role) => {
    // In a production app, we would use signInWithPopup(auth, provider)
    // For this context, assuming LoginScreen handles the auth trigger 
    // and we update the role in Firestore here.
    if (auth.currentUser) {
       await updateRole(selectedRole);
    }
  };

  const updateRole = async (newRole: Role) => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, {
        role: newRole,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        updatedAt: new Date()
      }, { merge: true });
      setRole(newRole);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn: !!user, 
      role, 
      user, 
      loading, 
      login, 
      logout,
      updateRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
