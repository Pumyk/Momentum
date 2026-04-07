import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X, Calendar, Flag, Tag, Trash2, Circle, CheckCircle2, Plus, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db, auth } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

const PRIORITIES = [
  { value: 1, label: 'High Priority', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  { value: 2, label: 'Medium Priority', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { value: 3, label: 'Low Priority', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { value: 4, label: 'No Priority', color: 'text-zinc-400', bg: 'bg-zinc-50 dark:bg-zinc-900/20' },
];

export function RightPane() {
  const { tasks, selectedTaskId, setSelectedTaskId, updateTask, deleteTask } = useStore();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const priorityRef = useRef<HTMLDivElement>(null);

  const task = tasks.find((t) => t.id === selectedTaskId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setIsPriorityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!task) {
    return null;
  }

  const handleUpdate = async (updates: any) => {
    if (!selectedTaskId || !auth.currentUser) return;
    
    // Optimistic update
    updateTask(selectedTaskId, updates);

    try {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', selectedTaskId);
      await updateDoc(taskRef, updates);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedTaskId || !auth.currentUser) return;

    // Optimistic delete
    deleteTask(selectedTaskId);

    try {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', selectedTaskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleAddSubtask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSubtaskTitle.trim()) {
      const newSubtasks = [...(task.subtasks || []), { title: newSubtaskTitle.trim(), isCompleted: false }];
      handleUpdate({ subtasks: newSubtasks });
      setNewSubtaskTitle('');
    }
  };

  const toggleSubtask = (index: number) => {
    const newSubtasks = [...(task.subtasks || [])];
    newSubtasks[index] = { ...newSubtasks[index], isCompleted: !newSubtasks[index].isCompleted };
    handleUpdate({ subtasks: newSubtasks });
  };

  const deleteSubtask = (index: number) => {
    const newSubtasks = [...(task.subtasks || [])];
    newSubtasks.splice(index, 1);
    handleUpdate({ subtasks: newSubtasks });
  };

  const currentPriority = PRIORITIES.find(p => p.value === task.priority) || PRIORITIES[3];

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-zinc-900/50">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => {
              const newStatus: 'todo' | 'completed' = task.status === 'completed' ? 'todo' : 'completed';
              handleUpdate({ 
                status: newStatus,
                completedAt: newStatus === 'completed' ? new Date() : null
              });
            }}
          >
            {task.status === 'completed' ? (
              <CheckCircle2 size={18} className="text-blue-500" />
            ) : (
              <Circle size={18} className="text-zinc-400" />
            )}
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            className="h-8 w-8 text-zinc-500 hover:text-red-500"
          >
            <Trash2 size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSelectedTaskId(null)} className="h-8 w-8">
            <X size={16} />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <input
          type="text"
          placeholder="Task Title"
          className="w-full bg-transparent text-xl font-semibold outline-none placeholder:text-zinc-400"
          value={task.title}
          onChange={(e) => handleUpdate({ title: e.target.value })}
        />
        
        <textarea
          placeholder="Description"
          className="mt-4 w-full resize-none bg-transparent outline-none placeholder:text-zinc-400"
          rows={4}
          value={task.description || ''}
          onChange={(e) => handleUpdate({ description: e.target.value })}
        />

        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-3 text-sm text-zinc-600 dark:text-zinc-400">
            <Calendar size={16} />
            <input
              type="date"
              className="bg-transparent outline-none"
              value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => handleUpdate({ dueDate: e.target.value ? new Date(e.target.value) : null })}
            />
          </div>
          
          <div className="relative" ref={priorityRef}>
            <button 
              onClick={() => setIsPriorityOpen(!isPriorityOpen)}
              className="flex w-full items-center space-x-3 rounded-lg p-1 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <Flag size={16} className={currentPriority.color} />
              <span className="flex-1 text-left">{currentPriority.label}</span>
              <ChevronDown size={14} className={`transition-transform ${isPriorityOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isPriorityOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        handleUpdate({ priority: p.value });
                        setIsPriorityOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <div className="flex items-center space-x-3">
                        <Flag size={14} className={p.color} />
                        <span>{p.label}</span>
                      </div>
                      {task.priority === p.value && <Check size={14} className="text-blue-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center space-x-3 text-sm text-zinc-600 dark:text-zinc-400">
            <Tag size={16} />
            <input
              type="text"
              placeholder="Add tags (comma separated)"
              className="bg-transparent outline-none placeholder:text-zinc-400"
              value={task.tags?.join(', ') || ''}
              onChange={(e) => handleUpdate({ tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
            />
          </div>
        </div>

        {/* Subtasks Section */}
        <div className="mt-8">
          <h3 className="mb-4 text-sm font-semibold text-zinc-500 uppercase tracking-wider">Subtasks</h3>
          <div className="space-y-2">
            {task.subtasks?.map((subtask, index) => (
              <div key={index} className="group flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => toggleSubtask(index)}
                    className="flex h-4 w-4 items-center justify-center transition-colors"
                  >
                    {subtask.isCompleted ? (
                      <CheckCircle2 size={16} className="text-blue-500" />
                    ) : (
                      <Circle size={16} className="text-zinc-300 hover:text-blue-500 dark:text-zinc-600" />
                    )}
                  </button>
                  <span className={`text-sm ${subtask.isCompleted ? 'text-zinc-400 line-through' : ''}`}>
                    {subtask.title}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => deleteSubtask(index)}
                >
                  <X size={12} />
                </Button>
              </div>
            ))}
            <div className="relative flex items-center">
              <Plus size={14} className="absolute left-2 text-zinc-400" />
              <input
                type="text"
                placeholder="Add subtask"
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-4 text-sm outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={handleAddSubtask}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
