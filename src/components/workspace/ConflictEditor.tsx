import { useState } from 'react';
import { Check, Edit3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';
import type { Conflict } from '@/types';

interface ConflictEditorProps {
  conflicts: Conflict[];
  currentIndex: number;
  onResolve: (conflictId: string, resolution: 'A' | 'B' | 'custom', customText?: string) => void;
  onNavigate: (index: number) => void;
  onPlayTimestamp: (timestamp: number) => void;
}

function highlightDiff(textA: string, textB: string): { a: React.ReactNode; b: React.ReactNode } {
  const wordsA = textA.split(' ');
  const wordsB = textB.split(' ');
  
  // Algorisme simple de diff per paraules
  const aResult: React.ReactNode[] = [];
  const bResult: React.ReactNode[] = [];
  
  const maxLen = Math.max(wordsA.length, wordsB.length);
  
  for (let i = 0; i < maxLen; i++) {
    const wordA = wordsA[i] || '';
    const wordB = wordsB[i] || '';
    
    if (wordA === wordB) {
      if (wordA) aResult.push(<span key={`a${i}`}>{wordA} </span>);
      if (wordB) bResult.push(<span key={`b${i}`}>{wordB} </span>);
    } else {
      if (wordA) {
        aResult.push(
          <span key={`a${i}`} className="diff-highlight px-0.5 rounded">
            {wordA}{' '}
          </span>
        );
      }
      if (wordB) {
        bResult.push(
          <span key={`b${i}`} className="diff-highlight px-0.5 rounded">
            {wordB}{' '}
          </span>
        );
      }
    }
  }
  
  return { a: aResult, b: bResult };
}

export function ConflictEditor({
  conflicts,
  currentIndex,
  onResolve,
  onNavigate,
  onPlayTimestamp,
}: ConflictEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  
  const conflict = conflicts[currentIndex];
  const pendingConflicts = conflicts.filter(c => !c.resolved);
  
  if (!conflict) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Check className="h-12 w-12 mx-auto mb-4 text-status-ok" />
          <p className="text-lg font-medium">Tots els conflictes resolts!</p>
          <p className="text-sm mt-1">Pots passar a la següent tasca.</p>
        </div>
      </div>
    );
  }

  const diff = highlightDiff(conflict.passA, conflict.passB);

  const handleChoose = (choice: 'A' | 'B') => {
    onResolve(conflict.id, choice);
    // Auto-avança al següent no resolt
    const nextPending = conflicts.findIndex((c, i) => i > currentIndex && !c.resolved);
    if (nextPending !== -1) {
      onNavigate(nextPending);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(conflict.passA);
  };

  const handleSaveEdit = () => {
    onResolve(conflict.id, 'custom', editText);
    setIsEditing(false);
    setEditText('');
    // Auto-avança
    const nextPending = conflicts.findIndex((c, i) => i > currentIndex && !c.resolved);
    if (nextPending !== -1) {
      onNavigate(nextPending);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header amb navegació */}
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <h2 className="panel-title">Conflicte {currentIndex + 1} de {conflicts.length}</h2>
          <span className="text-xs text-muted-foreground">
            ({pendingConflicts.length} pendents)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            ← Anterior
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(Math.min(conflicts.length - 1, currentIndex + 1))}
            disabled={currentIndex === conflicts.length - 1}
          >
            Següent →
          </Button>
        </div>
      </div>

      {/* Context */}
      {conflict.context && (
        <div className="px-4 py-2 bg-muted/50 border-b border-border text-sm text-muted-foreground">
          <span className="opacity-60">[...] </span>
          {conflict.context.before}
        </div>
      )}

      {/* Comparació A/B */}
      <div className="flex-1 overflow-y-auto p-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground">Text final editat:</div>
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} className="gap-2">
                <Check className="h-4 w-4" />
                Desar i avançar
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel·lar
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Pass A */}
            <div 
              className={cn(
                "entity-card p-4 cursor-pointer transition-all",
                conflict.resolved && conflict.resolution === 'A' && "selected ring-2 ring-status-ok"
              )}
              onClick={() => handleChoose('A')}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pass A
                </span>
                <Kbd>1</Kbd>
              </div>
              <p 
                className="text-foreground leading-relaxed cursor-pointer hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayTimestamp(conflict.timestamp - 2);
                }}
              >
                {diff.a}
              </p>
            </div>

            {/* Pass B */}
            <div 
              className={cn(
                "entity-card p-4 cursor-pointer transition-all",
                conflict.resolved && conflict.resolution === 'B' && "selected ring-2 ring-status-ok"
              )}
              onClick={() => handleChoose('B')}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pass B
                </span>
                <Kbd>2</Kbd>
              </div>
              <p 
                className="text-foreground leading-relaxed cursor-pointer hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayTimestamp(conflict.timestamp - 2);
                }}
              >
                {diff.b}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Context after */}
      {conflict.context && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border text-sm text-muted-foreground">
          {conflict.context.after}
          <span className="opacity-60"> [...]</span>
        </div>
      )}

      {/* Accions */}
      {!isEditing && (
        <div className="p-4 border-t border-panel-border bg-panel-header">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleEdit} className="gap-2">
              <Edit3 className="h-4 w-4" />
              Editar text
              <Kbd>E</Kbd>
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Clic a una paraula per reproduir el fragment</span>
              <ArrowRight className="h-3 w-3" />
              <Kbd>Enter</Kbd>
              <span>Confirma i avança</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
