import { useEffect, useCallback } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: KeyHandler;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignora si estem en un input o textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Permet algunes dreceres específiques dins d'inputs
        const allowedInInputs = ['Escape', 'Enter'];
        if (!allowedInInputs.includes(event.key)) {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatch = !!shortcut.shift === event.shiftKey;
        const altMatch = !!shortcut.alt === event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.handler(event);
          return;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function useGlobalShortcuts() {
  // Dreceres globals de l'aplicació
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'k',
      ctrl: true,
      handler: () => {
        // Obre cerca global
        document.dispatchEvent(new CustomEvent('open-command-palette'));
      },
    },
    {
      key: 'z',
      ctrl: true,
      handler: () => {
        document.dispatchEvent(new CustomEvent('undo'));
      },
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      handler: () => {
        document.dispatchEvent(new CustomEvent('redo'));
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);
}
