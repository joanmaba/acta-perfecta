import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, Download, Trash2, Users, Shield, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Panel, PanelHeader, PanelTitle, PanelBody } from '@/components/ui/panel';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { WhitelistEntry, PIIRule, KnownSpeaker, PIIEntityType, PIIAction } from '@/types';

// Dades de prova
const initialWhitelist: WhitelistEntry[] = [
  {
    id: '1',
    name: 'Joan Puig i Ferrer',
    role: 'Alcalde',
    isPublicOfficial: true,
    professionalContacts: { email: 'alcaldia@ajuntament.cat', phone: '938001234' },
    isSecurityForce: false,
  },
  {
    id: '2',
    name: 'Anna Martí',
    role: 'Secretària',
    isPublicOfficial: true,
    professionalContacts: { email: 'secretaria@ajuntament.cat' },
    isSecurityForce: false,
  },
];

const initialRules: PIIRule[] = [
  {
    id: '1',
    name: 'DNI/NIE espanyol',
    type: 'regex',
    pattern: '[0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]',
    entityType: 'ID_OFICIAL',
    action: 'redact',
    priority: 1,
    enabled: true,
  },
  {
    id: '2',
    name: 'Telèfon mòbil',
    type: 'regex',
    pattern: '(\\+34)?[67][0-9]{8}',
    entityType: 'TEL_PERSONAL',
    action: 'redact',
    priority: 4,
    enabled: true,
  },
];

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

export default function Config() {
  const navigate = useNavigate();
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>(initialWhitelist);
  const [rules, setRules] = useState<PIIRule[]>(initialRules);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2 mr-4">
          <ArrowLeft className="h-4 w-4" />
          Tornar
        </Button>
        <div className="h-6 w-px bg-border mr-4" />
        <h1 className="text-lg font-semibold text-foreground">Configuració</h1>
      </header>

      <main className="container mx-auto py-6 px-4 max-w-5xl">
        <Tabs defaultValue="whitelist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="whitelist" className="gap-2">
              <Users className="h-4 w-4" />
              Whitelist
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <Shield className="h-4 w-4" />
              Regles PII
            </TabsTrigger>
            <TabsTrigger value="speakers" className="gap-2">
              <FileText className="h-4 w-4" />
              Parlants
            </TabsTrigger>
          </TabsList>

          {/* Whitelist */}
          <TabsContent value="whitelist" className="space-y-4">
            <Panel>
              <PanelHeader>
                <PanelTitle>Persones d'interès públic</PanelTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Importar CSV
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Afegir
                  </Button>
                </div>
              </PanelHeader>
              <PanelBody className="p-0">
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca persones..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-border">
                    {whitelist
                      .filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((entry) => (
                        <div key={entry.id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{entry.name}</span>
                                {entry.isSecurityForce && (
                                  <span className="text-xs px-2 py-0.5 bg-status-warning-subtle text-status-warning rounded-full">
                                    Forces de seguretat
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {entry.role}
                              </div>
                              {entry.professionalContacts.email && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  ✉ {entry.professionalContacts.email}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                Editar
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </PanelBody>
            </Panel>
          </TabsContent>

          {/* Regles PII */}
          <TabsContent value="rules" className="space-y-4">
            <Panel>
              <PanelHeader>
                <PanelTitle>Regles de detecció PII</PanelTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova regla
                </Button>
              </PanelHeader>
              <PanelBody className="p-0">
                <div className="p-4 border-b border-border bg-muted/30">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Prioritat 1:</strong> Sempre suprimir (DNI, NIE, signatures...)</p>
                    <p><strong>Prioritat 2:</strong> Protecció especial (forces seguretat → codi professional)</p>
                    <p><strong>Prioritat 3:</strong> Whitelist (càrrecs públics → mantenir)</p>
                    <p><strong>Prioritat 4:</strong> Per defecte</p>
                  </div>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-border">
                    {rules.map((rule) => (
                      <div key={rule.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Switch checked={rule.enabled} />
                              <span className="font-medium">{rule.name}</span>
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                rule.priority === 1 && "bg-pii-critical-bg text-pii-critical",
                                rule.priority === 2 && "bg-pii-high-bg text-pii-high",
                                rule.priority === 3 && "bg-pii-safe-bg text-pii-safe",
                                rule.priority === 4 && "bg-muted text-muted-foreground"
                              )}>
                                Prioritat {rule.priority}
                              </span>
                            </div>
                            <div className="mt-2 space-y-1">
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="text-xs uppercase tracking-wide">Tipus:</span>
                                {entityTypeLabels[rule.entityType]}
                              </div>
                              {rule.pattern && (
                                <div className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block">
                                  {rule.pattern}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              rule.action === 'redact' && "bg-destructive/10 text-destructive",
                              rule.action === 'keep' && "bg-status-ok-subtle text-status-ok",
                              rule.action === 'pseudonymize' && "bg-muted text-muted-foreground"
                            )}>
                              {rule.action === 'redact' && 'Redactar'}
                              {rule.action === 'keep' && 'Conservar'}
                              {rule.action === 'pseudonymize' && 'Pseudonimitzar'}
                            </span>
                            <Button variant="ghost" size="sm">
                              Editar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PanelBody>
            </Panel>
          </TabsContent>

          {/* Parlants coneguts */}
          <TabsContent value="speakers" className="space-y-4">
            <Panel>
              <PanelHeader>
                <PanelTitle>Parlants coneguts</PanelTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Afegir parlant
                </Button>
              </PanelHeader>
              <PanelBody>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Els parlants s'afegeixen automàticament quan s'identifiquen en les sessions.</p>
                  <p className="text-sm mt-2">El sistema aprèn els perfils de veu per a futures sessions.</p>
                </div>
              </PanelBody>
            </Panel>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
