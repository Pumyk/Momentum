import { create } from 'zustand';

export interface Task {
  id: string;
  title: string;
  description?: string;
  listId: string;
  dueDate?: Date | null;
  priority: number;
  status: 'todo' | 'in-progress' | 'completed';
  tags?: string[];
  subtasks?: { title: string; isCompleted: boolean }[];
  createdAt: Date;
  completedAt?: Date | null;
}

export interface List {
  id: string;
  name: string;
  color: string;
  folderId: string | null;
  isShared: boolean;
}

export interface Folder {
  id: string;
  name: string;
  order: number;
}

interface AppState {
  tasks: Task[];
  lists: List[];
  folders: Folder[];
  selectedListId: string;
  selectedTaskId: string | null;
  isSidebarOpen: boolean;
  isRightPaneOpen: boolean;
  setTasks: (tasks: Task[]) => void;
  setLists: (lists: List[]) => void;
  setFolders: (folders: Folder[]) => void;
  setSelectedListId: (id: string) => void;
  setSelectedTaskId: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleRightPane: () => void;
  closeSidebar: () => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  // Pomodoro Timer State
  pomodoroTimeLeft: number;
  pomodoroIsRunning: boolean;
  pomodoroMode: 'focus' | 'shortBreak' | 'longBreak';
  setPomodoroTimeLeft: (time: number) => void;
  setPomodoroIsRunning: (isRunning: boolean) => void;
  setPomodoroMode: (mode: 'focus' | 'shortBreak' | 'longBreak') => void;
  tickPomodoro: () => void;
}

export const useStore = create<AppState>((set) => ({
  tasks: [],
  lists: [],
  folders: [],
  selectedListId: 'inbox',
  selectedTaskId: null,
  isSidebarOpen: false,
  isRightPaneOpen: false,
  setTasks: (tasks) => set({ tasks }),
  setLists: (lists) => set({ lists }),
  setFolders: (folders) => set({ folders }),
  setSelectedListId: (id) => set({ selectedListId: id }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id, isRightPaneOpen: !!id }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleRightPane: () => set((state) => ({ isRightPaneOpen: !state.isRightPaneOpen })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
    selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
    isRightPaneOpen: state.selectedTaskId === id ? false : state.isRightPaneOpen
  })),
  
  // Pomodoro Initial State
  pomodoroTimeLeft: 25 * 60,
  pomodoroIsRunning: false,
  pomodoroMode: 'focus',
  setPomodoroTimeLeft: (time) => set({ pomodoroTimeLeft: time }),
  setPomodoroIsRunning: (isRunning) => set({ pomodoroIsRunning: isRunning }),
  setPomodoroMode: (mode) => set({ pomodoroMode: mode }),
  tickPomodoro: () => set((state) => ({ 
    pomodoroTimeLeft: state.pomodoroTimeLeft > 0 ? state.pomodoroTimeLeft - 1 : 0,
    pomodoroIsRunning: state.pomodoroTimeLeft > 0 ? state.pomodoroIsRunning : false
  })),
}));
