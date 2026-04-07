/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './components/ThemeProvider';
import { TimerManager } from './components/TimerManager';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ticktick-theme">
      <TooltipProvider>
        <Auth>
          <TimerManager />
          <Layout />
        </Auth>
      </TooltipProvider>
    </ThemeProvider>
  );
}

