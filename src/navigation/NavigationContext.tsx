import { createContext, useContext } from 'react';

export type TabKey = 'home' | 'bhajans' | 'paath' | 'jaap' | 'settings';

export type NavigationValue = {
  tab: TabKey;
  setTab: (tab: TabKey) => void;
  playerOpen: boolean;
  openPlayer: () => void;
  closePlayer: () => void;
  /** Space reserved at the bottom of scrollable screens (floating tab bar + mini-player + safe area). */
  contentBottomInset: number;
};

export const NavigationContext = createContext<NavigationValue | null>(null);

export function useAppNavigation(): NavigationValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useAppNavigation must be used inside <AppNavigator>');
  }
  return ctx;
}
