import React, { useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Zap, AlertCircle, Loader2, Cookie, ExternalLink } from 'lucide-react';
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
    // Check if we just returned from a redirect sign-in
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect auth error:", err);
      // Only show error if it's not a "no result" case
      if (err.code !== 'auth/no-current-user') {
        setError("Sign-in failed. Please try again.");
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const handlePopupSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Popup sign-in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError("The sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        // User closed it, no need for error
      } else {
        setError("Sign-in failed. This often happens on mobile or Safari due to cookie settings.");
        setShowCookieDialog(true);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRedirectSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      // Note: This will fail with a 403 error inside the AI Studio preview iframe.
      // It is intended for use on the live Vercel site only.
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      console.error('Redirect sign-in error:', err);
      setError("Redirect sign-in failed: " + err.message);
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

          <div className="w-full space-y-3">
            <Button 
              onClick={handlePopupSignIn} 
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

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowCookieDialog(true)} 
              className="w-full text-xs text-zinc-400 hover:text-zinc-600"
            >
              Trouble signing in?
            </Button>
          </div>
        </div>

        <Dialog open={showCookieDialog} onOpenChange={setShowCookieDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-blue-500" />
                Sign-In Help
              </DialogTitle>
              <DialogDescription>
                If the standard sign-in isn't working, it's usually because your browser is blocking popups or third-party cookies.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                <h4 className="mb-2 font-semibold text-blue-700 dark:text-blue-400">Option 1: Try Redirect Method</h4>
                <p className="mb-3 text-xs leading-relaxed">
                  This method is more reliable on mobile and Safari. It will temporarily leave this page to sign you in.
                </p>
                <Button 
                  onClick={handleRedirectSignIn} 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-white dark:bg-zinc-900"
                  disabled={isSigningIn}
                >
                  <ExternalLink className="mr-2 h-3 w-3" />
                  Use Redirect Sign-In
                </Button>
                <p className="mt-2 text-[10px] text-zinc-400 italic">
                  Note: This will not work inside the AI Studio preview.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Option 2: Check Browser Settings</h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-xs">Safari (iOS/Mac):</p>
                    <p className="text-[11px] text-zinc-500">Settings &gt; Safari &gt; Turn OFF "Prevent Cross-Site Tracking" and "Block All Cookies".</p>
                  </div>
                  <div>
                    <p className="font-medium text-xs">Chrome (Mobile):</p>
                    <p className="text-[11px] text-zinc-500">Settings &gt; Site Settings &gt; Cookies &gt; Select "Allow cookies".</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowCookieDialog(false)} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return <>{children}</>;
}
