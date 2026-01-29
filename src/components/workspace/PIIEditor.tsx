import { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, AlertTriangle, Check, Plus, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { PIIEntity, PIIAction, PIIEntityType } from '@/types';

interface PIIEditorProps {
  entities: PIIEntity[];
  onAction: (entityId: string, action: PIIAction, pseudonym?: string) => void;
  onPlayTimestamp: (timestamp: number) => void;
  onAddRule?: (entityType: PIIEntityType, pattern: string) => void;
}

const entityTypeLabels: Record<PIIEntityType, string> = {
  ID_OFICIAL: 'Document d\'identitat',
  SIGNATURA_MANUSCRITA: 'Signatura',
  CERT_METADATA: 'Metadades certificat',
  CONTACTE_PERSONAL: 'Contacte personal',
  TEL_PERSONAL: 'Telèfon personal',
  EMAIL_PERSONAL: 'Email personal',
  CONTACTE_PROFESSIONAL: 'Contacte professional',
  TEL_PROF: 'Telèfon professional',
  EMAIL_PROF: 'Email professional',
  ADRECA_PERSONAL: 'Adreça personal',
  DADES_LOCALITZACIO: 'Localització',
  MENOR: 'Menor d\'edat',
  SALUT: 'Dades de salut',
  BIOMETRIC: 'Dades biomètriques',
  GENETIC: 'Dades genètiques',
  PENAL: 'Antecedents penals',
  INFRACCIO: 'Infraccions',
  VULNERABILITAT: 'Vulnerabilitat',
  ALTRES_IDENTIFICADORS: 'Altres identificadors',
};

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

export function PIIEditor({
  entities,
  onAction,
  onPlayTimestamp,
  onAddRule,
}: PIIEditorProps) {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [pseudonymInput, setPseudonymInput] = useState('');
  const [showPseudonymFor, setShowPseudonymFor] = useState<string | null>(null);

  // Ordenar per severitat i agrupar
  const sortedEntities = [...entities].sort((a, b) => 
    severityOrder[a.severity] - severityOrder[b.severity]
  );

  const pendingEntities = sortedEntities.filter(e => e.action === 'pending');
  const resolvedEntities = sortedEntities.filter(e => e.action !== 'pending');

  const selectedEntityData = entities.find(e => e.id === selectedEntity);

  const hasBlockingIssues = pendingEntities.some(e => 
    e.type === 'ID_OFICIAL' || e.type === 'SIGNATURA_MANUSCRITA' || e.type === 'CERT_METADATA'
  );

  const handleAction = (entityId: string, action: PIIAction) => {
    if (action === 'pseudonymize') {
      setShowPseudonymFor(entityId);
    } else {
      onAction(entityId, action);
      // Selecciona la següent pendent
      const currentIndex = pendingEntities.findIndex(e => e.id === entityId);
      if (currentIndex < pendingEntities.length - 1) {
        setSelectedEntity(pendingEntities[currentIndex + 1].id);
      }
    }
  };

  const handlePseudonymSubmit = (entityId: string) => {
    if (pseudonymInput) {
      onAction(entityId, 'pseudonymize', pseudonymInput);
      setPseudonymInput('');
      setShowPseudonymFor(null);
    }
  };

  return (
    <div className="h-full flex">
      {/* Llista d'entitats */}
      <div className="w-1/2 border-r border-panel-border flex flex-col">
        <div className="panel-header">
          <h2 className="panel-title flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Entitats PII
          </h2>
          <span className="text-xs text-muted-foreground">
            {pendingEntities.length} pendents
          </span>
        </div>

        {/* Leak check */}
        {hasBlockingIssues && (
          <div className="px-4 py-2 bg-status-error-subtle border-b border-status-error/20">
            <div className="flex items-center gap-2 text-sm text-status-error">
              <Lock className="h-4 w-4" />
              <span className="font-medium">Publicació bloquejada</span>
            </div>
            <p className="text-xs text-status-error/80 mt-1">
              Hi ha entitats d'obligatòria supressió pendents de resoldre.
            </p>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {pendingEntities.map((entity) => (
              <div
                key={entity.id}
                className={cn(
                  "entity-card p-3 cursor-pointer",
                  selectedEntity === entity.id && "selected",
                  entity.severity === 'critical' && "pii-critical",
                  entity.severity === 'high' && "pii-high",
                  entity.severity === 'medium' && "pii-medium",
                  entity.severity === 'low' && "pii-low"
                )}
                onClick={() => setSelectedEntity(entity.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                      {entityTypeLabels[entity.type]}
                    </span>
                    {!entity.canKeep && (
                      <Lock className="h-3 w-3 opacity-50" />
                    )}
                  </div>
                  <span className="text-xs bg-background/50 px-1.5 py-0.5 rounded">
                    ×{entity.occurrences.length}
                  </span>
                </div>
                <div className="mt-1 font-mono text-sm truncate">
                  {entity.maskedValue}
                </div>
              </div>
            ))}

            {resolvedEntities.length > 0 && (
              <>
                <div className="text-xs font-medium text-muted-foreground px-2 pt-4 pb-2">
                  Resoltes ({resolvedEntities.length})
                </div>
                {resolvedEntities.map((entity) => (
                  <div
                    key={entity.id}
                    className={cn(
                      "entity-card p-3 cursor-pointer opacity-60",
                      selectedEntity === entity.id && "selected opacity-100",
                      "pii-safe"
                    )}
                    onClick={() => setSelectedEntity(entity.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium">
                        {entityTypeLabels[entity.type]}
                      </span>
                      <span className="text-xs flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {entity.action === 'redact' && 'Redactat'}
                        {entity.action === 'keep' && 'Conservat'}
                        {entity.action === 'pseudonymize' && entity.pseudonym}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Detall de l'entitat */}
      <div className="w-1/2 flex flex-col">
        {selectedEntityData ? (
          <>
            <div className="panel-header">
              <h3 className="panel-title">Detall</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {/* Info de l'entitat */}
              <div className={cn(
                "p-3 rounded-md",
                selectedEntityData.severity === 'critical' && "bg-pii-critical-bg",
                selectedEntityData.severity === 'high' && "bg-pii-high-bg",
                selectedEntityData.severity === 'medium' && "bg-pii-medium-bg",
                selectedEntityData.severity === 'low' && "bg-pii-low-bg"
              )}>
                <div className="text-xs font-medium uppercase tracking-wide mb-1 opacity-70">
                  {entityTypeLabels[selectedEntityData.type]}
                </div>
                <div className="font-mono text-lg">{selectedEntityData.value}</div>
              </div>

              {/* Motiu de bloqueig */}
              {selectedEntityData.blockReason && (
                <div className="p-3 bg-status-error-subtle rounded-md border border-status-error/20">
                  <div className="flex items-center gap-2 text-sm text-status-error font-medium">
                    <Lock className="h-4 w-4" />
                    No es pot conservar
                  </div>
                  <p className="text-xs text-status-error/80 mt-1">
                    {selectedEntityData.blockReason}
                  </p>
                </div>
              )}

              {selectedEntityData.keepReason && (
                <div className="p-3 bg-status-ok-subtle rounded-md border border-status-ok/20">
                  <div className="flex items-center gap-2 text-sm text-status-ok font-medium">
                    <Check className="h-4 w-4" />
                    Es pot conservar
                  </div>
                  <p className="text-xs text-status-ok/80 mt-1">
                    {selectedEntityData.keepReason}
                  </p>
                </div>
              )}

              {/* Ocurrències */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Ocurrències ({selectedEntityData.occurrences.length})
                </div>
                <div className="space-y-2">
                  {selectedEntityData.occurrences.map((occ) => (
                    <div 
                      key={occ.id}
                      className="p-2 bg-muted rounded-md text-sm cursor-pointer hover:bg-accent group"
                      onClick={() => onPlayTimestamp(occ.timestamp)}
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Play className="h-3 w-3 group-hover:text-primary" />
                        {Math.floor(occ.timestamp / 60)}:{(occ.timestamp % 60).toString().padStart(2, '0')}
                      </div>
                      <p>
                        <span className="text-muted-foreground">{occ.contextBefore} </span>
                        <span className="bg-diff-highlight px-1 rounded font-medium">{occ.text}</span>
                        <span className="text-muted-foreground"> {occ.contextAfter}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Accions */}
            <div className="p-4 border-t border-panel-border bg-panel-header space-y-3">
              {showPseudonymFor === selectedEntityData.id ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Pseudònim (p.ex. Persona A)"
                    value={pseudonymInput}
                    onChange={(e) => setPseudonymInput(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePseudonymSubmit(selectedEntityData.id);
                      } else if (e.key === 'Escape') {
                        setShowPseudonymFor(null);
                        setPseudonymInput('');
                      }
                    }}
                  />
                  <Button onClick={() => handlePseudonymSubmit(selectedEntityData.id)}>
                    Aplicar
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        onClick={() => handleAction(selectedEntityData.id, 'redact')}
                        className="gap-2"
                      >
                        <EyeOff className="h-4 w-4" />
                        Redactar
                        <Kbd>R</Kbd>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Elimina de totes les {selectedEntityData.occurrences.length} ocurrències
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => handleAction(selectedEntityData.id, 'pseudonymize')}
                        className="gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Pseudonimitzar
                        <Kbd>P</Kbd>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Substitueix per un pseudònim (p.ex. "Persona A")
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => handleAction(selectedEntityData.id, 'keep')}
                        disabled={!selectedEntityData.canKeep}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Conservar
                        <Kbd>K</Kbd>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {selectedEntityData.canKeep 
                        ? 'Manté visible a la transcripció publicada'
                        : selectedEntityData.blockReason}
                    </TooltipContent>
                  </Tooltip>

                  {onAddRule && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={() => onAddRule(selectedEntityData.type, selectedEntityData.value)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Afegir regla
                          <Kbd>A</Kbd>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Crea una regla per automatitzar en futures sessions
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Selecciona una entitat per veure'n el detall</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
