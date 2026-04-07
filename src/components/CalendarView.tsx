import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Menu, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CalendarView() {
  const { tasks, setSelectedTaskId, toggleSidebar, isSidebarOpen } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), day));
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-blue-500';
      default: return 'bg-zinc-400';
    }
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center">
          {!isSidebarOpen && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
              <Menu size={18} />
            </Button>
          )}
          <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight size={20} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Weekdays header */}
        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 overflow-auto">
          {calendarDays.map((day, idx) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            
            return (
              <div 
                key={idx} 
                className={`min-h-[100px] border-b border-r border-zinc-200 p-2 transition-colors dark:border-zinc-800 ${
                  !isCurrentMonth ? 'bg-zinc-50/50 dark:bg-zinc-900/20' : ''
                } ${isToday(day) ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${
                    isToday(day) 
                      ? 'flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white' 
                      : isCurrentMonth ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 4).map(task => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`flex w-full items-center space-x-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:opacity-80 ${
                        task.status === 'completed' 
                          ? 'bg-zinc-100 text-zinc-400 line-through dark:bg-zinc-800' 
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}
                    >
                      <div className={`h-1.5 w-1.5 rounded-full ${getPriorityColor(task.priority)}`} />
                      <span className="truncate">{task.title}</span>
                    </button>
                  ))}
                  {dayTasks.length > 4 && (
                    <div className="px-1.5 text-[10px] text-zinc-500">
                      + {dayTasks.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
