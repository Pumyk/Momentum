import React, { useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export function Auth({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center space-y-6 rounded-2xl bg-white p-10 shadow-xl dark:bg-zinc-900">
          <div className="flex items-center space-x-2 text-blue-500">
            <Zap size={40} className="fill-current" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Momentum</h1>
          </div>
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            Sign in to manage your tasks, habits, and calendar.
          </p>
          <Button onClick={handleSignIn} size="lg" className="w-full">
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
