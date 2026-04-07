import { Play, Pause, RotateCcw, Coffee, Brain, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '../store/useStore';
import { Menu } from 'lucide-react';

export function PomodoroTimer() {
  const { 
    toggleSidebar, 
    isSidebarOpen,
    pomodoroTimeLeft,
    pomodoroIsRunning,
    pomodoroMode,
    setPomodoroTimeLeft,
    setPomodoroIsRunning,
    setPomodoroMode
  } = useStore();

  const toggleTimer = () => setPomodoroIsRunning(!pomodoroIsRunning);
  
  const resetTimer = () => {
    setPomodoroIsRunning(false);
    if (pomodoroMode === 'focus') setPomodoroTimeLeft(25 * 60);
    if (pomodoroMode === 'shortBreak') setPomodoroTimeLeft(5 * 60);
    if (pomodoroMode === 'longBreak') setPomodoroTimeLeft(15 * 60);
  };

  const stopTimer = () => {
    setPomodoroIsRunning(false);
    resetTimer();
  };

  const switchMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setPomodoroMode(newMode);
    setPomodoroIsRunning(false);
    if (newMode === 'focus') setPomodoroTimeLeft(25 * 60);
    if (newMode === 'shortBreak') setPomodoroTimeLeft(5 * 60);
    if (newMode === 'longBreak') setPomodoroTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = pomodoroMode === 'focus' 
    ? ((25 * 60 - pomodoroTimeLeft) / (25 * 60)) * 100 
    : pomodoroMode === 'shortBreak' 
      ? ((5 * 60 - pomodoroTimeLeft) / (5 * 60)) * 100 
      : ((15 * 60 - pomodoroTimeLeft) / (15 * 60)) * 100;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      <header className="flex items-center border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        {!isSidebarOpen && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
            <Menu size={18} />
          </Button>
        )}
        <h2 className="text-xl font-bold">Focus Timer</h2>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="mb-8 flex space-x-2 rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
          <Button 
            variant={pomodoroMode === 'focus' ? 'default' : 'ghost'} 
            className="rounded-full"
            onClick={() => switchMode('focus')}
          >
            <Brain className="mr-2 h-4 w-4" /> Focus
          </Button>
          <Button 
            variant={pomodoroMode === 'shortBreak' ? 'default' : 'ghost'} 
            className="rounded-full"
            onClick={() => switchMode('shortBreak')}
          >
            <Coffee className="mr-2 h-4 w-4" /> Short Break
          </Button>
          <Button 
            variant={pomodoroMode === 'longBreak' ? 'default' : 'ghost'} 
            className="rounded-full"
            onClick={() => switchMode('longBreak')}
          >
            <Coffee className="mr-2 h-4 w-4" /> Long Break
          </Button>
        </div>

        <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-8 border-zinc-100 dark:border-zinc-900">
          <div 
            className="absolute inset-0 rounded-full border-8 border-blue-500 transition-all duration-1000 ease-linear"
            style={{ 
              clipPath: `polygon(50% 50%, 50% 0%, ${progress < 25 ? '100% 0%' : progress < 50 ? '100% 100%' : progress < 75 ? '0% 100%' : '0% 0%'}, ${progress < 12.5 ? '100% 0%' : progress < 37.5 ? '100% 100%' : progress < 62.5 ? '0% 100%' : progress < 87.5 ? '0% 0%' : '50% 0%'})`,
              transform: `rotate(${progress * 3.6}deg)`,
              opacity: progress > 0 ? 1 : 0
            }}
          />
          <span className="text-6xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100">
            {formatTime(pomodoroTimeLeft)}
          </span>
        </div>

        <div className="mt-12 flex items-center space-x-4">
          <Button 
            size="lg" 
            className="h-16 w-32 rounded-full text-lg"
            onClick={toggleTimer}
          >
            {pomodoroIsRunning ? <Pause className="mr-2 h-6 w-6" /> : <Play className="mr-2 h-6 w-6" />}
            {pomodoroIsRunning ? 'Pause' : 'Start'}
          </Button>
          
          {pomodoroIsRunning && (
            <Button 
              size="icon" 
              variant="destructive" 
              className="h-16 w-16 rounded-full"
              onClick={stopTimer}
            >
              <Square className="h-6 w-6 fill-current" />
            </Button>
          )}

          <Button 
            size="icon" 
            variant="outline" 
            className="h-16 w-16 rounded-full"
            onClick={resetTimer}
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
