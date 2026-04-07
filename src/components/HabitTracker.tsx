import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { Plus, Flame, Check, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '../store/useStore';

export function HabitTracker() {
  const { toggleSidebar, isSidebarOpen } = useStore();
  const [habits, setHabits] = useState<any[]>([]);
  const [newHabitName, setNewHabitName] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'users', auth.currentUser.uid, 'habits'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAddHabit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newHabitName.trim() && auth.currentUser) {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'habits'), {
        name: newHabitName,
        icon: '🎯',
        frequency: { type: 'daily' },
        currentStreak: 0,
        longestStreak: 0,
        logs: []
      });
      setNewHabitName('');
    }
  };

  const handleCheckIn = async (habit: any) => {
    if (!auth.currentUser) return;
    
    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const hasCheckedInToday = habit.logs?.some((log: string) => log.startsWith(today));
    
    if (hasCheckedInToday) return;

    const habitRef = doc(db, 'users', auth.currentUser.uid, 'habits', habit.id);
    const newStreak = habit.currentStreak + 1;
    const newLongest = Math.max(newStreak, habit.longestStreak);
    
    await updateDoc(habitRef, {
      logs: arrayUnion(new Date().toISOString()),
      currentStreak: newStreak,
      longestStreak: newLongest
    });
  };

  const hasCheckedInToday = (habit: any) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.logs?.some((log: string) => log.startsWith(today));
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      <header className="flex items-center border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        {!isSidebarOpen && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
            <Menu size={18} />
          </Button>
        )}
        <h2 className="text-xl font-bold">Habits</h2>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map(habit => {
            const isDone = hasCheckedInToday(habit);
            return (
              <div key={habit.id} className="flex flex-col justify-between rounded-xl border border-zinc-200 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xl dark:bg-blue-900/30">
                      {habit.icon}
                    </span>
                    <h3 className="font-semibold">{habit.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1 text-orange-500">
                    <Flame size={18} className={habit.currentStreak > 0 ? 'fill-orange-500' : ''} />
                    <span className="font-bold">{habit.currentStreak}</span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
                      <span>Progress</span>
                      <span>{habit.currentStreak} day streak</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-500 ease-out"
                        style={{ width: `${Math.min((habit.currentStreak / Math.max(habit.longestStreak || 1, 7)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <Button 
                    className={`w-full ${isDone ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                    variant={isDone ? 'default' : 'outline'}
                    onClick={() => handleCheckIn(habit)}
                    disabled={isDone}
                  >
                    {isDone ? (
                      <>
                        <Check className="mr-2 h-4 w-4" /> Completed
                      </>
                    ) : (
                      'Check In'
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {habits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Flame size={48} className="mb-4 text-zinc-300 dark:text-zinc-700" />
            <p>No habits yet. Start building good routines!</p>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="relative flex items-center">
          <Plus size={18} className="absolute left-3 text-zinc-400" />
          <Input
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={handleAddHabit}
            placeholder="Add a new habit, press Enter to save"
            className="pl-10 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
