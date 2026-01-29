import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { TasksPanel } from '@/components/workspace/TasksPanel';
import { AudioPanel } from '@/components/workspace/AudioPanel';
import { ConflictEditor } from '@/components/workspace/ConflictEditor';
import { SpeakerEditor } from '@/components/workspace/SpeakerEditor';
import { PIIEditor } from '@/components/workspace/PIIEditor';
import { Panel } from '@/components/ui/panel';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { mockSessions, mockConflicts, mockSpeakers, mockPIIEntities, mockKnownSpeakers } from '@/data/mockData';
import type { TaskType, Conflict, Speaker, PIIEntity, PIIAction } from '@/types';

export default function Workspace() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const session = mockSessions.find(s => s.id === sessionId);
  
  // Estats locals
  const [activeTask, setActiveTask] = useState<TaskType>('conflicts');
  const [conflicts, setConflicts] = useState<Conflict[]>(mockConflicts.filter(c => c.sessionId === sessionId));
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0);
  const [speakers, setSpeakers] = useState<Speaker[]>(mockSpeakers.filter(s => s.sessionId === sessionId));
  const [piiEntities, setPiiEntities] = useState<PIIEntity[]>(mockPIIEntities.filter(e => e.sessionId === sessionId));
  
  // Àudio
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioSource, setAudioSource] = useState<'A' | 'B'>('A');
  
  // Historial per desfer/refer
  const [history, setHistory] = useState<unknown[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Calcula tasques pendents
  const tasks = [
    {
      type: 'conflicts' as TaskType,
      label: 'Conflictes A/B',
      count: conflicts.filter(c => !c.resolved).length,
      total: conflicts.length,
      icon: null,
      severity: 'warning' as const,
    },
    {
      type: 'speakers' as TaskType,
      label: 'Identificació parlants',
      count: speakers.filter(s => !s.identity).length,
      total: speakers.length,
      icon: null,
      severity: 'info' as const,
    },
    {
      type: 'pii' as TaskType,
      label: 'Revisió PII',
      count: piiEntities.filter(e => e.action === 'pending').length,
      total: piiEntities.length,
      icon: null,
      severity: 'error' as const,
    },
    {
      type: 'acta' as TaskType,
      label: 'Acta draft',
      count: session?.stats.actaStatus === 'validated' ? 0 : 1,
      total: 1,
      icon: null,
    },
  ];

  // Handlers
  const handleResolveConflict = useCallback((conflictId: string, resolution: 'A' | 'B' | 'custom', customText?: string) => {
    setConflicts(prev => prev.map(c => 
      c.id === conflictId 
        ? { 
            ...c, 
            resolved: true, 
            resolution, 
            finalText: customText || (resolution === 'A' ? c.passA : c.passB) 
          }
        : c
    ));
  }, []);

  const handleAssignSpeaker = useCallback((speakerId: string, identity: string, role: string, isSecurityForce?: boolean, professionalCode?: string) => {
    setSpeakers(prev => prev.map(s =>
      s.speakerId === speakerId
        ? { ...s, identity, role, isSecurityForce, professionalCode }
        : s
    ));
  }, []);

  const handlePIIAction = useCallback((entityId: string, action: PIIAction, pseudonym?: string) => {
    setPiiEntities(prev => prev.map(e =>
      e.id === entityId
        ? { ...e, action, pseudonym }
        : e
    ));
  }, []);

  const handlePlayTimestamp = useCallback((timestamp: number) => {
    setCurrentTime(Math.max(0, timestamp));
    setIsPlaying(true);
  }, []);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // Simulació de reproducció
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => prev + 0.1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Dreceres de teclat
  useKeyboardShortcuts([
    {
      key: ' ',
      handler: () => setIsPlaying(p => !p),
    },
    {
      key: 'j',
      handler: () => setCurrentTime(t => Math.max(0, t - 5)),
    },
    {
      key: 'k',
      handler: () => setCurrentTime(t => t + 5),
    },
    {
      key: '1',
      handler: () => {
        if (activeTask === 'conflicts' && conflicts[currentConflictIndex]) {
          handleResolveConflict(conflicts[currentConflictIndex].id, 'A');
        }
      },
    },
    {
      key: '2',
      handler: () => {
        if (activeTask === 'conflicts' && conflicts[currentConflictIndex]) {
          handleResolveConflict(conflicts[currentConflictIndex].id, 'B');
        }
      },
    },
    {
      key: 'Enter',
      handler: () => {
        // Avança al següent element pendent
        if (activeTask === 'conflicts') {
          const nextPending = conflicts.findIndex((c, i) => i > currentConflictIndex && !c.resolved);
          if (nextPending !== -1) {
            setCurrentConflictIndex(nextPending);
          }
        }
      },
    },
  ]);

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Sessió no trobada</p>
          <Button onClick={() => navigate('/')}>Tornar a l'inici</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Tornar
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-sm font-semibold text-foreground">{session.title}</h1>
            <p className="text-xs text-muted-foreground">
              {new Date(session.date).toLocaleDateString('ca-ES', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <Header 
          showActions 
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />
      </div>

      {/* Workspace principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panell esquerre: Tasques */}
        <div className="w-64 border-r border-border bg-card shrink-0">
          <TasksPanel
            tasks={tasks}
            activeTask={activeTask}
            onSelectTask={setActiveTask}
          />
        </div>

        {/* Panell central: Editor */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <Panel className="flex-1 m-4 mr-0 overflow-hidden">
            {activeTask === 'conflicts' && (
              <ConflictEditor
                conflicts={conflicts}
                currentIndex={currentConflictIndex}
                onResolve={handleResolveConflict}
                onNavigate={setCurrentConflictIndex}
                onPlayTimestamp={handlePlayTimestamp}
              />
            )}
            {activeTask === 'speakers' && (
              <SpeakerEditor
                speakers={speakers}
                knownSpeakers={mockKnownSpeakers}
                onAssign={handleAssignSpeaker}
                onPlaySegment={handlePlayTimestamp}
              />
            )}
            {activeTask === 'pii' && (
              <PIIEditor
                entities={piiEntities}
                onAction={handlePIIAction}
                onPlayTimestamp={handlePlayTimestamp}
              />
            )}
            {activeTask === 'acta' && (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium">Editor d'acta</p>
                  <p className="text-sm mt-1">Pròximament disponible</p>
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* Panell dret: Àudio */}
        <div className="w-80 border-l border-border bg-card shrink-0">
          <AudioPanel
            currentTime={currentTime}
            duration={session.duration * 60}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(p => !p)}
            onSeek={handleSeek}
            onSkipBack={() => setCurrentTime(t => Math.max(0, t - 5))}
            onSkipForward={() => setCurrentTime(t => t + 5)}
            audioSource={audioSource}
            onToggleAudioSource={() => setAudioSource(s => s === 'A' ? 'B' : 'A')}
          />
        </div>
      </div>
    </div>
  );
}
