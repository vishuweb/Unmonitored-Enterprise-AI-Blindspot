import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description?: string;
}

interface KeyboardShortcutsConfig {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Custom hook for managing keyboard shortcuts across the app
 * Supports Ctrl/Cmd key combinations
 * 
 * Usage:
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 'k',
 *       ctrl: true,
 *       handler: () => console.log('Ctrl+K pressed'),
 *       description: 'Open search'
 *     }
 *   ]
 * });
 */
export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  const { shortcuts, enabled = true } = config;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.key === '?' || event.shiftKey === (shortcut.shift ?? false);
        const altMatches = event.altKey === (shortcut.alt ?? false);
        const metaMatches = shortcut.meta ? event.metaKey : true;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          // Don't trigger if the user is typing in an input or textarea
          const target = event.target as HTMLElement;
          if (
            target.tagName === 'INPUT' &&
            (target as HTMLInputElement).type !== 'checkbox' &&
            (target as HTMLInputElement).type !== 'radio'
          ) {
            // Allow Ctrl+A in inputs for select all
            if (!(shortcut.key === 'a' && shortcut.ctrl)) {
              continue;
            }
          }
          if (target.tagName === 'TEXTAREA') {
            continue;
          }

          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

/**
 * Global shortcuts configuration for ControlPlane.ai
 * These can be imported and used throughout the app
 */
export const getGlobalShortcuts = (handlers: {
  onOpenSearch?: () => void;
  onNewPolicy?: () => void;
  onApproveAll?: () => void;
  onExport?: () => void;
  onHelp?: () => void;
  onNavigateSandbox?: () => void;
  onNavigateGovernance?: () => void;
}): KeyboardShortcut[] => {
  return [
    {
      key: 'k',
      ctrl: true,
      handler: handlers.onOpenSearch || (() => {}),
      description: 'Open quick search (⌘K)',
    },
    {
      key: 'a',
      ctrl: true,
      shift: true,
      handler: handlers.onApproveAll || (() => {}),
      description: 'Approve all low-risk items (⌘⇧A)',
    },
    {
      key: '?',
      handler: handlers.onHelp || (() => {}),
      description: 'Show keyboard shortcuts help (?)',
    },
    {
      key: 's',
      ctrl: true,
      handler: handlers.onNavigateSandbox || (() => {}),
      description: 'Navigate to Sandbox (⌘S)',
    },
    {
      key: 'g',
      ctrl: true,
      handler: handlers.onNavigateGovernance || (() => {}),
      description: 'Navigate to Governance (⌘G)',
    },
  ];
};

/**
 * Utility function to format keyboard shortcut for display
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push('Ctrl');
  }
  if (shortcut.meta) {
    parts.push('Cmd');
  }
  if (shortcut.shift) {
    parts.push('Shift');
  }
  if (shortcut.alt) {
    parts.push('Alt');
  }

  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
};

/**
 * Utility to get platform-specific key display (Cmd vs Ctrl)
 */
export const getPlatformModifier = (): string => {
  return typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? '⌘' : 'Ctrl';
};

