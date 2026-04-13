import React, { useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Zap, AlertCircle, Loader2, Cookie } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function Auth({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showCookieDialog, setShowCookieDialog] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Error signing in:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Sign-in failed. Your browser might be blocking third-party cookies.");
        setShowCookieDialog(true);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="flex w-full max-w-md flex-col items-center space-y-6 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900 sm:p-10">
          <div className="flex items-center space-x-2 text-blue-500">
            <Zap size={40} className="fill-current" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Momentum</h1>
          </div>
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            Sign in to manage your tasks, habits, and calendar.
          </p>
          
          {error && (
            <div className="flex w-full items-center space-x-2 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle size={16} className="shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}

          <Button 
            onClick={handleSignIn} 
            size="lg" 
            className="w-full"
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in with Google"
            )}
          </Button>

          {error && (
            <Button variant="link" onClick={() => setShowCookieDialog(true)} className="text-zinc-500">
              How to fix sign-in issues?
            </Button>
          )}
        </div>

        <Dialog open={showCookieDialog} onOpenChange={setShowCookieDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-blue-500" />
                Allow Cookies to Sign In
              </DialogTitle>
              <DialogDescription>
                Google Sign-In requires third-party cookies to securely authenticate you. If you are using Safari, Brave, or Incognito mode, they might be blocked.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Safari (iOS/Mac)</h4>
                <ol className="list-inside list-decimal space-y-1">
                  <li>Open <strong>Settings</strong> &gt; <strong>Safari</strong></li>
                  <li>Scroll to <strong>Privacy & Security</strong></li>
                  <li>Turn <strong>OFF</strong> "Prevent Cross-Site Tracking"</li>
                  <li>Turn <strong>OFF</strong> "Block All Cookies"</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Chrome (Mobile)</h4>
                <ol className="list-inside list-decimal space-y-1">
                  <li>Tap the <strong>3 dots</strong> menu &gt; <strong>Settings</strong></li>
                  <li>Go to <strong>Site Settings</strong> &gt; <strong>Cookies</strong></li>
                  <li>Select <strong>Allow cookies</strong></li>
                </ol>
              </div>
            </div>

            <DialogFooter className="sm:justify-end">
              <Button type="button" onClick={() => setShowCookieDialog(false)}>
                I understand, let me try again
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return <>{children}</>;
}
