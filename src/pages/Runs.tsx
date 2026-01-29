import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/Header';
import { SessionCard } from '@/components/runs/SessionCard';
import { mockSessions } from '@/data/mockData';
import type { Session } from '@/types';

type FilterStatus = 'all' | 'pending' | 'ready' | 'published';

export default function Runs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const filteredSessions = mockSessions.filter((session) => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'pending' && ['conflicts_pending', 'pii_pending', 'acta_pending'].includes(session.status)) ||
      (filterStatus === 'ready' && session.status === 'ready') ||
      (filterStatus === 'published' && session.status === 'published');
    return matchesSearch && matchesFilter;
  });

  const handleReview = (sessionId: string) => {
    navigate(`/workspace/${sessionId}`);
  };

  const stats = {
    total: mockSessions.length,
    pending: mockSessions.filter(s => ['conflicts_pending', 'pii_pending', 'acta_pending'].includes(s.status)).length,
    ready: mockSessions.filter(s => s.status === 'ready').length,
    published: mockSessions.filter(s => s.status === 'published').length,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="TranscriPle" />

      <main className="flex-1 container mx-auto py-6 px-4 max-w-5xl">
        {/* Capçalera de la pàgina */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground mb-1">Sessions de Plens</h1>
          <p className="text-muted-foreground">
            Gestió i revisió de transcripcions de plens municipals
          </p>
        </div>

        {/* Estadístiques ràpides */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setFilterStatus('all')}
            className={`p-4 rounded-lg border transition-colors ${
              filterStatus === 'all' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total sessions</div>
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`p-4 rounded-lg border transition-colors ${
              filterStatus === 'pending' 
                ? 'border-status-warning bg-status-warning-subtle' 
                : 'border-border hover:border-status-warning/50'
            }`}
          >
            <div className="text-2xl font-bold text-status-warning">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pendents</div>
          </button>
          <button
            onClick={() => setFilterStatus('ready')}
            className={`p-4 rounded-lg border transition-colors ${
              filterStatus === 'ready' 
                ? 'border-status-ok bg-status-ok-subtle' 
                : 'border-border hover:border-status-ok/50'
            }`}
          >
            <div className="text-2xl font-bold text-status-ok">{stats.ready}</div>
            <div className="text-sm text-muted-foreground">Per publicar</div>
          </button>
          <button
            onClick={() => setFilterStatus('published')}
            className={`p-4 rounded-lg border transition-colors ${
              filterStatus === 'published' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="text-2xl font-bold text-foreground">{stats.published}</div>
            <div className="text-sm text-muted-foreground">Publicats</div>
          </button>
        </div>

        {/* Cerca i accions */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova sessió
          </Button>
        </div>

        {/* Llista de sessions */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <FileAudio className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'No s\'han trobat sessions amb aquesta cerca'
                  : 'No hi ha sessions en aquesta categoria'}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <SessionCard 
                key={session.id} 
                session={session} 
                onReview={handleReview}
              />
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          TranscriPle · Eina de revisió de transcripcions municipals
        </div>
      </footer>
    </div>
  );
}
