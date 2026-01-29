import { Calendar, Clock, Users, AlertTriangle, Shield, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import type { Session } from '@/types';
import { cn } from '@/lib/utils';

interface SessionCardProps {
  session: Session;
  onReview: (sessionId: string) => void;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusInfo(session: Session) {
  const { status, stats } = session;
  
  switch (status) {
    case 'processing':
      return { variant: 'processing' as const, label: 'Processant...' };
    case 'transcription_ready':
      return { variant: 'pending' as const, label: 'Transcripció llesta' };
    case 'conflicts_pending':
      return { variant: 'warning' as const, label: `${stats.conflictsTotal - stats.conflictsResolved} conflictes` };
    case 'pii_pending':
      return { variant: 'error' as const, label: `${stats.piiEntities - stats.piiResolved} entitats PII` };
    case 'acta_pending':
      return { variant: 'warning' as const, label: 'Acta pendent' };
    case 'ready':
      return { variant: 'ok' as const, label: 'Llest per publicar' };
    case 'published':
      return { variant: 'ok' as const, label: 'Publicat' };
    default:
      return { variant: 'pending' as const, label: 'Desconegut' };
  }
}

function getMainAction(session: Session): string {
  switch (session.status) {
    case 'conflicts_pending':
      return 'Resoldre conflictes';
    case 'pii_pending':
      return 'Revisar PII';
    case 'acta_pending':
      return 'Validar acta';
    case 'ready':
      return 'Publicar';
    default:
      return 'Revisar';
  }
}

export function SessionCard({ session, onReview }: SessionCardProps) {
  const statusInfo = getStatusInfo(session);
  const { stats } = session;
  
  const conflictsProgress = stats.conflictsTotal > 0 
    ? (stats.conflictsResolved / stats.conflictsTotal) * 100 
    : 100;
  const speakersProgress = stats.speakersTotal > 0 
    ? (stats.speakersIdentified / stats.speakersTotal) * 100 
    : 100;
  const piiProgress = stats.piiEntities > 0 
    ? (stats.piiResolved / stats.piiEntities) * 100 
    : 100;

  const hasBlockingIssues = stats.piiEntities > stats.piiResolved;
  const isComplete = session.status === 'ready' || session.status === 'published';

  return (
    <div className={cn(
      "entity-card p-4",
      hasBlockingIssues && "border-l-4 border-l-status-error"
    )}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{session.title}</h3>
            <StatusBadge variant={statusInfo.variant}>{statusInfo.label}</StatusBadge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(session.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(session.duration)}
            </span>
          </div>
        </div>
        
        {!isComplete && (
          <Button onClick={() => onReview(session.id)} className="shrink-0 gap-2">
            {getMainAction(session)}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {session.status === 'ready' && (
          <Button onClick={() => onReview(session.id)} variant="default" className="shrink-0 gap-2 bg-status-ok hover:bg-status-ok/90">
            Publicar
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {session.status === 'published' && (
          <Button onClick={() => onReview(session.id)} variant="outline" className="shrink-0">
            Veure
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Conflictes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              Conflictes
            </span>
            <span className={cn(
              "font-medium",
              conflictsProgress === 100 ? "text-status-ok" : "text-status-warning"
            )}>
              {stats.conflictsResolved}/{stats.conflictsTotal}
            </span>
          </div>
          <Progress value={conflictsProgress} className="h-1.5" />
        </div>

        {/* Parlants */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              Parlants
            </span>
            <span className={cn(
              "font-medium",
              speakersProgress === 100 ? "text-status-ok" : "text-muted-foreground"
            )}>
              {stats.speakersIdentified}/{stats.speakersTotal}
            </span>
          </div>
          <Progress value={speakersProgress} className="h-1.5" />
        </div>

        {/* PII */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Shield className="h-3 w-3" />
              PII
            </span>
            <span className={cn(
              "font-medium",
              piiProgress === 100 ? "text-status-ok" : "text-status-error"
            )}>
              {stats.piiResolved}/{stats.piiEntities}
            </span>
          </div>
          <Progress 
            value={piiProgress} 
            className={cn(
              "h-1.5",
              piiProgress < 100 && "[&>div]:bg-status-error"
            )} 
          />
        </div>

        {/* Acta */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <FileText className="h-3 w-3" />
              Acta
            </span>
            <span className={cn(
              "font-medium",
              stats.actaStatus === 'validated' ? "text-status-ok" : 
              stats.actaStatus === 'draft' ? "text-status-warning" : "text-muted-foreground"
            )}>
              {stats.actaStatus === 'validated' ? 'Validada' : 
               stats.actaStatus === 'draft' ? 'Esborrany' : 'Pendent'}
            </span>
          </div>
          <Progress 
            value={stats.actaStatus === 'validated' ? 100 : stats.actaStatus === 'draft' ? 50 : 0} 
            className="h-1.5" 
          />
        </div>
      </div>
    </div>
  );
}
