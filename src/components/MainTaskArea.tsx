import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Menu, Plus, Calendar as CalendarIcon, Flag, Check, Circle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, doc, updateDoc } from 'firebase/firestore';
import { parseTaskInput } from '../lib/nlp';
import { format } from 'date-fns';
import { PomodoroTimer } from './PomodoroTimer';
import { HabitTracker } from './HabitTracker';
import { CalendarView } from './CalendarView';

export function MainTaskArea() {
  const { selectedListId, toggleSidebar, isSidebarOpen, tasks, setTasks, setSelectedTaskId, selectedTaskId, updateTask } = useStore();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    if (selectedListId === 'focus' || selectedListId === 'habits') return;

    let q;
    const tasksRef = collection(db, 'users', auth.currentUser.uid, 'tasks');

    if (selectedListId === 'calendar') {
      q = query(tasksRef, orderBy('createdAt', 'desc'));
    } else if (selectedListId === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      q = query(
        tasksRef,
        where('dueDate', '>=', today),
        where('dueDate', '<', tomorrow),
        orderBy('dueDate', 'asc')
      );
    } else if (selectedListId === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);
      
      q = query(
        tasksRef,
        where('dueDate', '>=', tomorrow),
        where('dueDate', '<', nextDay),
        orderBy('dueDate', 'asc')
      );
    } else if (selectedListId === 'inbox') {
      q = query(tasksRef, where('listId', '==', 'inbox'), orderBy('createdAt', 'desc'));
    } else {
      q = query(tasksRef, where('listId', '==', selectedListId), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as any[];
      setTasks(fetchedTasks);
    }, (error) => {
      console.error("Error fetching tasks:", error);
    });

    return () => unsubscribe();
  }, [selectedListId, setTasks]);

  const handleAddTask = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && auth.currentUser) {
      const { title, dueDate, priority } = parseTaskInput(inputValue);
      
      try {
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'tasks'), {
          title,
          listId: selectedListId === 'today' || selectedListId === 'tomorrow' ? 'inbox' : selectedListId,
          dueDate: dueDate,
          priority,
          status: 'todo',
          createdAt: serverTimestamp(),
        });
        setInputValue('');
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const handleToggleTask = async (e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    if (!auth.currentUser) return;

    const newStatus: 'todo' | 'completed' = task.status === 'completed' ? 'todo' : 'completed';
    const updates = { 
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date() : null 
    };

    // Optimistic update
    updateTask(task.id, updates);

    try {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', task.id);
      await updateDoc(taskRef, updates);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-500';
      case 2: return 'text-yellow-500';
      case 3: return 'text-blue-500';
      default: return 'text-zinc-400';
    }
  };

  if (selectedListId === 'focus') {
    return <PomodoroTimer />;
  }

  if (selectedListId === 'habits') {
    return <HabitTracker />;
  }

  if (selectedListId === 'calendar') {
    return <CalendarView />;
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      <header className="flex items-center border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        {!isSidebarOpen && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
            <Menu size={18} />
          </Button>
        )}
        <h2 className="text-xl font-bold capitalize">{selectedListId}</h2>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className={`group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                selectedTaskId === task.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <button 
                  onClick={(e) => handleToggleTask(e, task)}
                  className="flex h-5 w-5 items-center justify-center transition-colors"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 size={20} className="text-blue-500" />
                  ) : (
                    <Circle size={20} className="text-zinc-300 hover:text-blue-500 dark:text-zinc-600" />
                  )}
                </button>
                <span className={`text-sm font-medium ${task.status === 'completed' ? 'text-zinc-400 line-through' : ''}`}>
                  {task.title}
                </span>
              </div>
              <div className="flex items-center space-x-3 opacity-0 transition-opacity group-hover:opacity-100">
                {task.dueDate && (
                  <div className="flex items-center space-x-1 text-xs text-zinc-500">
                    <CalendarIcon size={14} />
                    <span>{format(task.dueDate, 'MMM d')}</span>
                  </div>
                )}
                <Flag size={16} className={getPriorityColor(task.priority)} />
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <img src="https://picsum.photos/seed/empty/200/200" alt="Empty" className="mb-4 h-32 w-32 opacity-50 grayscale" referrerPolicy="no-referrer" />
              <p>No tasks here. Add one below!</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="relative flex items-center">
          <Plus size={18} className="absolute left-3 text-zinc-400" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleAddTask}
            placeholder={`Add a task to "${selectedListId}", press Enter to save`}
            className="pl-10 shadow-sm"
          />
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          Tip: Type "Buy milk tomorrow at 9am !1" to auto-set date and high priority.
        </div>
      </div>
    </div>
  );
}
