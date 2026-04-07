import { useStore } from '../store/useStore';
import { Inbox, Calendar as CalendarIcon, CalendarDays, LogOut, Menu, Timer, Activity, Moon, Sun, Zap, User } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTheme } from './ThemeProvider';

export function Sidebar() {
  const { selectedListId, setSelectedListId, toggleSidebar, closeSidebar } = useStore();
  const { theme, setTheme } = useTheme();

  const handleSignOut = () => {
    signOut(auth);
  };

  const navItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, color: 'text-blue-500' },
    { id: 'today', label: 'Today', icon: CalendarIcon, color: 'text-green-500' },
    { id: 'tomorrow', label: 'Tomorrow', icon: CalendarIcon, color: 'text-orange-500' },
    { id: 'next7days', label: 'Next 7 Days', icon: CalendarDays, color: 'text-purple-500' },
  ];

  const appItems = [
    { id: 'focus', label: 'Focus', icon: Timer, color: 'text-red-500' },
    { id: 'habits', label: 'Habits', icon: Activity, color: 'text-orange-500' },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays, color: 'text-blue-500' },
  ];

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2 font-semibold">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500 text-white">
            <Zap size={16} className="fill-current" />
          </div>
          <span>Momentum</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu size={18} />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedListId(item.id);
                closeSidebar();
              }}
              className={`flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                selectedListId === item.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              <item.icon size={18} className={item.color} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <Separator className="my-2" />

        <div className="space-y-1 py-2">
          {appItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedListId(item.id);
                closeSidebar();
              }}
              className={`flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                selectedListId === item.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              <item.icon size={18} className={item.color} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <Separator className="my-2" />
      </ScrollArea>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-zinc-500" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
        <div className="flex items-center space-x-2">
          {auth.currentUser?.photoURL ? (
            <img 
              src={auth.currentUser.photoURL} 
              alt="Profile" 
              className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <User size={16} />
            </div>
          )}
          <Button variant="ghost" className="flex-1 justify-start text-zinc-500 px-2" onClick={handleSignOut}>
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
