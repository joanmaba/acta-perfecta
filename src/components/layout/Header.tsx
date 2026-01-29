import { Search, Undo2, Redo2, Download, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeaderProps {
  title?: string;
  showActions?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onExport?: () => void;
  onSearch?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function Header({
  title = 'TranscriPle',
  showActions = false,
  onUndo,
  onRedo,
  onExport,
  onSearch,
  canUndo = false,
  canRedo = false,
}: HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      {showActions && (
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
                className="gap-1.5"
              >
                <Undo2 className="h-4 w-4" />
                <span className="sr-only">Desfer</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="flex items-center gap-2">
                Desfer
                <Kbd>⌘Z</Kbd>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
                className="gap-1.5"
              >
                <Redo2 className="h-4 w-4" />
                <span className="sr-only">Refer</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="flex items-center gap-2">
                Refer
                <Kbd>⌘⇧Z</Kbd>
              </div>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-2" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSearch}
                className="gap-1.5"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline text-muted-foreground">Cerca</span>
                <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Cerca ràpida
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
                className="gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exporta</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Previsualitza i exporta
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Ajuda</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="text-xs">
                <p className="font-medium mb-1">Dreceres ràpides:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-muted-foreground">
                  <span>Space</span><span>Play/Pausa</span>
                  <span>J/K</span><span>Salt -5s/+5s</span>
                  <span>1/2</span><span>Tria A/B</span>
                  <span>Enter</span><span>Confirma</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </header>
  );
}
