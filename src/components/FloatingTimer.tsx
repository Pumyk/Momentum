import React from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Pause, Play, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingTimer() {
  const { 
    pomodoroIsRunning, 
    pomodoroTimeLeft, 
    pomodoroMode, 
    selectedListId, 
    setSelectedListId,
    setPomodoroIsRunning,
    setPomodoroTimeLeft
  } = useStore();

  // Only show if running AND not on the focus page
  const isVisible = pomodoroIsRunning && selectedListId !== 'focus';

  if (!isVisible) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getModeColor = () => {
    switch (pomodoroMode) {
      case 'focus': return 'bg-red-500';
      case 'shortBreak': return 'bg-green-500';
      case 'longBreak': return 'bg-blue-500';
      default: return 'bg-zinc-500';
    }
  };

  const stopTimer = () => {
    setPomodoroIsRunning(false);
    if (pomodoroMode === 'focus') setPomodoroTimeLeft(25 * 60);
    if (pomodoroMode === 'shortBreak') setPomodoroTimeLeft(5 * 60);
    if (pomodoroMode === 'longBreak') setPomodoroTimeLeft(15 * 60);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
      >
        <div className="flex items-center space-x-4 rounded-full bg-white px-6 py-3 shadow-2xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div 
            onClick={() => setSelectedListId('focus')}
            className={`flex cursor-pointer items-center space-x-3 rounded-full px-3 py-1 text-white ${getModeColor()}`}
          >
            <Timer size={16} />
            <span className="text-sm font-bold tabular-nums">{formatTime(pomodoroTimeLeft)}</span>
          </div>

          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={() => setPomodoroIsRunning(!pomodoroIsRunning)}
            >
              {pomodoroIsRunning ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              onClick={stopTimer}
            >
              <Square size={14} className="fill-current" />
            </Button>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-zinc-400"
            onClick={() => setSelectedListId('focus')}
          >
            <X size={16} />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
