import { useState } from 'react';
import { User, Shield, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Speaker, KnownSpeaker } from '@/types';

interface SpeakerEditorProps {
  speakers: Speaker[];
  knownSpeakers: KnownSpeaker[];
  onAssign: (speakerId: string, identity: string, role: string, isSecurityForce?: boolean, professionalCode?: string) => void;
  onPlaySegment: (start: number) => void;
}

export function SpeakerEditor({
  speakers,
  knownSpeakers,
  onAssign,
  onPlaySegment,
}: SpeakerEditorProps) {
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
  const [isSecurityForce, setIsSecurityForce] = useState(false);
  const [professionalCode, setProfessionalCode] = useState('');

  const unidentified = speakers.filter(s => !s.identity);
  const identified = speakers.filter(s => s.identity);

  const handleAssign = (speakerId: string, knownSpeakerId: string) => {
    const known = knownSpeakers.find(ks => ks.id === knownSpeakerId);
    if (known) {
      onAssign(speakerId, known.name, known.role);
    }
  };

  const handleSetUnknown = (speakerId: string) => {
    onAssign(speakerId, 'Desconegut', '');
  };

  const handleSetSecurityForce = (speakerId: string) => {
    if (professionalCode) {
      onAssign(speakerId, `Agent ${professionalCode}`, 'Forces de seguretat', true, professionalCode);
      setProfessionalCode('');
      setIsSecurityForce(false);
      setSelectedSpeaker(null);
    }
  };

  // Calcula estadístiques de temps per parlant
  const totalDuration = speakers.reduce((acc, s) => 
    acc + s.segments.reduce((segAcc, seg) => segAcc + (seg.end - seg.start), 0), 0
  );

  return (
    <div className="h-full flex flex-col">
      <div className="panel-header">
        <h2 className="panel-title">Identificació de parlants</h2>
        <span className="text-xs text-muted-foreground">
          {identified.length}/{speakers.length} identificats
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Timeline visual simplificada */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Timeline</div>
          <div className="h-12 bg-muted rounded-md overflow-hidden relative flex">
            {speakers.map((speaker, index) => {
              const speakerDuration = speaker.segments.reduce((acc, seg) => acc + (seg.end - seg.start), 0);
              const widthPercent = totalDuration > 0 ? (speakerDuration / totalDuration) * 100 : 0;
              const colors = [
                'bg-primary',
                'bg-status-ok',
                'bg-status-warning',
                'bg-pii-medium',
                'bg-pii-low',
                'bg-pii-high',
              ];
              
              return (
                <div
                  key={speaker.id}
                  className={cn(
                    "h-full cursor-pointer hover:opacity-80 transition-opacity",
                    colors[index % colors.length],
                    !speaker.identity && "opacity-50 pattern-stripes"
                  )}
                  style={{ width: `${widthPercent}%` }}
                  onClick={() => speaker.segments[0] && onPlaySegment(speaker.segments[0].start)}
                  title={speaker.identity || speaker.speakerId}
                />
              );
            })}
          </div>
        </div>

        {/* Llista de parlants */}
        <div className="space-y-2">
          {/* Pendents primer */}
          {unidentified.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-status-warning flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Pendents d'identificar
              </div>
              {unidentified.map((speaker) => (
                <div
                  key={speaker.id}
                  className={cn(
                    "entity-card p-3",
                    selectedSpeaker === speaker.id && "selected"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-status-warning-subtle flex items-center justify-center">
                        <User className="h-4 w-4 text-status-warning" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{speaker.speakerId}</div>
                        {speaker.confidenceScore !== undefined && speaker.confidenceScore < 0.6 && (
                          <div className="text-xs text-muted-foreground">
                            Confiança baixa: {Math.round(speaker.confidenceScore * 100)}%
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedSpeaker === speaker.id && isSecurityForce ? (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Codi professional"
                          value={professionalCode}
                          onChange={(e) => setProfessionalCode(e.target.value)}
                          className="w-32 h-8 text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSetSecurityForce(speaker.id)}
                          disabled={!professionalCode}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setIsSecurityForce(false);
                            setSelectedSpeaker(null);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Select
                          onValueChange={(value) => {
                            if (value === 'security') {
                              setSelectedSpeaker(speaker.id);
                              setIsSecurityForce(true);
                            } else if (value === 'unknown') {
                              handleSetUnknown(speaker.id);
                            } else {
                              handleAssign(speaker.id, value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-[180px] h-8">
                            <SelectValue placeholder="Assignar identitat" />
                          </SelectTrigger>
                          <SelectContent>
                            {knownSpeakers.map((ks) => (
                              <SelectItem key={ks.id} value={ks.id}>
                                {ks.name} ({ks.role})
                              </SelectItem>
                            ))}
                            <SelectItem value="security">
                              <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Forces de seguretat
                              </span>
                            </SelectItem>
                            <SelectItem value="unknown">Desconegut</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speaker.segments[0] && onPlaySegment(speaker.segments[0].start)}
                        >
                          ▶
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Mostra un fragment de text */}
                  {speaker.segments[0] && (
                    <div 
                      className="mt-2 text-xs text-muted-foreground italic cursor-pointer hover:text-foreground"
                      onClick={() => onPlaySegment(speaker.segments[0].start)}
                    >
                      "{speaker.segments[0].text.slice(0, 100)}..."
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Ja identificats */}
          {identified.length > 0 && (
            <div className="space-y-2 mt-4">
              <div className="text-xs font-medium text-status-ok flex items-center gap-1">
                <Check className="h-3 w-3" />
                Identificats
              </div>
              {identified.map((speaker) => (
                <div
                  key={speaker.id}
                  className="entity-card p-3 opacity-70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-status-ok-subtle flex items-center justify-center">
                        {speaker.isSecurityForce ? (
                          <Shield className="h-4 w-4 text-status-ok" />
                        ) : (
                          <User className="h-4 w-4 text-status-ok" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{speaker.identity}</div>
                        <div className="text-xs text-muted-foreground">{speaker.role}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {speaker.speakerId}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
