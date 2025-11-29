'use client';

import { useEffect, useRef, useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { fuzzySearch } from '@/lib/fuzzySearch';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Actions' | 'Pages' | 'Records' | 'Reports';
  tag?: string;
  icon?: string;
  href?: string;
  action?: string;
  keystroke?: string;
}

export interface CommandPaletteProps {
  items?: CommandItem[];
  onExecute?: (item: CommandItem) => void;
  onNavigate?: (href: string) => void;
}

const categoryOrder = ['Actions', 'Pages', 'Records', 'Reports'];

export function CommandPalette({ items = [], onExecute, onNavigate }: CommandPaletteProps) {
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState<CommandItem[]>(items);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load commands from API
  useEffect(() => {
    async function loadCommands() {
      try {
        const res = await fetch('/api/commands');
        const data = await res.json();
        setFilteredItems(data);
      } catch (err) {
        console.error('Failed to load commands:', err);
        setFilteredItems(items);
      }
    }
    loadCommands();
  }, [items]);

  // Focus input when palette opens
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [commandPaletteOpen]);

  // Filter items on query change
  useEffect(() => {
    if (!query) {
      setFilteredItems(items.length > 0 ? items : filteredItems);
      setSelectedIndex(0);
      return;
    }

    const results = fuzzySearch(
      items.length > 0 ? items : filteredItems,
      query,
      (item) => `${item.title} ${item.subtitle || ''}`
    );
    setFilteredItems(results);
    setSelectedIndex(0);
  }, [query, items, filteredItems]);

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const { commandPaletteOpen, openCommandPalette } = useUIStore.getState();
        if (!commandPaletteOpen) {
          openCommandPalette();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle keyboard navigation within palette
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Escape':
        closeCommandPalette();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleExecute(filteredItems[selectedIndex]);
        }
        break;
    }
  };

  const handleExecute = async (item: CommandItem) => {
    if (item.action && onExecute) {
      onExecute(item);
      try {
        const res = await fetch('/api/commands/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: item.action }),
        });
        const result = await res.json();
        console.log('Action executed:', result);
      } catch (err) {
        console.error('Failed to execute action:', err);
      }
    }

    if (item.href && onNavigate) {
      onNavigate(item.href);
    }

    closeCommandPalette();
  };

  if (!commandPaletteOpen) return null;

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const displayGroups = categoryOrder.filter((cat) => groupedItems[cat]);
  const totalItems = filteredItems.length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={closeCommandPalette}
        data-testid="command-palette-backdrop"
        aria-hidden="true"
        role="presentation"
      />

      {/* Palette */}
      <div
        className="fixed top-0 left-0 right-0 z-50 pt-20 px-4 pointer-events-none"
        data-testid="command-palette"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
      >
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" aria-hidden="true" />
              <input
                ref={inputRef}
                id="command-palette-title"
                type="text"
                placeholder="Search actions, pages, records..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
                data-testid="command-input"
                aria-label="Command palette search input"
              />
              <button
                onClick={closeCommandPalette}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
                aria-label="Close command palette"
              >
                <XMarkIcon className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto" role="listbox" aria-label="Command results">
              {totalItems === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  No results found
                </div>
              ) : (
                displayGroups.map((category) => (
                  <div key={category} role="group" aria-labelledby={`group-${category}`}>
                    <div id={`group-${category}`} className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide" role="heading" aria-level={3}>
                      {category}
                    </div>
                    {groupedItems[category]?.map((item) => {
                      const globalIndex = filteredItems.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleExecute(item)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 ${
                            isSelected
                              ? 'bg-blue-500 dark:bg-blue-600 text-white'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                          }`}
                          data-testid={`command-item-${item.id}`}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {item.icon && <span className="text-lg flex-shrink-0" aria-hidden="true">{item.icon}</span>}
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate flex items-center gap-2">
                                {item.title}
                                {item.tag && (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-md whitespace-nowrap ${
                                      isSelected
                                        ? 'bg-white/20'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    {item.tag}
                                  </span>
                                )}
                              </div>
                              {item.subtitle && (
                                <div
                                  className={`text-sm truncate ${
                                    isSelected ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          </div>
                          {item.keystroke && (
                            <span
                              className={`text-xs ml-2 flex-shrink-0 ${
                                isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-500'
                              }`}
                              aria-hidden="true"
                            >
                              {item.keystroke}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {totalItems > 0 && (
              <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between" aria-live="polite">
                <span>{selectedIndex + 1} of {totalItems}</span>
                <span aria-hidden="true">↑↓ navigate • ⏎ select • esc close</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
