import { useStore } from '../store/useStore';
import { Sidebar } from './Sidebar';
import { MainTaskArea } from './MainTaskArea';
import { RightPane } from './RightPane';
import { FloatingTimer } from './FloatingTimer';

export function Layout() {
  const { isSidebarOpen, isRightPaneOpen } = useStore();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64 border-r border-zinc-200 dark:border-zinc-800' : 'w-0 overflow-hidden'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <MainTaskArea />
        <FloatingTimer />
      </div>

      {/* Right Pane (Task Details) */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isRightPaneOpen 
            ? 'fixed inset-0 z-50 bg-white dark:bg-zinc-950 md:relative md:inset-auto md:z-0 md:w-80 md:border-l md:border-zinc-200 md:dark:border-zinc-800' 
            : 'w-0 overflow-hidden'
        }`}
      >
        <RightPane />
      </div>
    </div>
  );
}
