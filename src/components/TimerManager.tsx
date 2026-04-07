import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function TimerManager() {
  const { pomodoroIsRunning, tickPomodoro } = useStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pomodoroIsRunning) {
      interval = setInterval(() => {
        tickPomodoro();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomodoroIsRunning, tickPomodoro]);

  return null;
}
