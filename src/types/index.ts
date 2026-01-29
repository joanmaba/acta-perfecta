// TranscriPle - Tipus principals

export type SessionStatus = 'processing' | 'transcription_ready' | 'conflicts_pending' | 'pii_pending' | 'acta_pending' | 'ready' | 'published';

export type TaskType = 'conflicts' | 'speakers' | 'pii' | 'acta';

export type PIIEntityType = 
  | 'ID_OFICIAL'
  | 'SIGNATURA_MANUSCRITA'
  | 'CERT_METADATA'
  | 'CONTACTE_PERSONAL'
  | 'TEL_PERSONAL'
  | 'EMAIL_PERSONAL'
  | 'CONTACTE_PROFESSIONAL'
  | 'TEL_PROF'
  | 'EMAIL_PROF'
  | 'ADRECA_PERSONAL'
  | 'DADES_LOCALITZACIO'
  | 'MENOR'
  | 'SALUT'
  | 'BIOMETRIC'
  | 'GENETIC'
  | 'PENAL'
  | 'INFRACCIO'
  | 'VULNERABILITAT'
  | 'ALTRES_IDENTIFICADORS';

export type PIISeverity = 'critical' | 'high' | 'medium' | 'low';

export type PIIAction = 'redact' | 'keep' | 'pseudonymize' | 'pending';

export type ConflictResolution = 'A' | 'B' | 'custom';

export interface Session {
  id: string;
  title: string;
  date: string;
  duration: number; // minuts
  status: SessionStatus;
  stats: {
    conflictsTotal: number;
    conflictsResolved: number;
    speakersTotal: number;
    speakersIdentified: number;
    piiEntities: number;
    piiResolved: number;
    actaStatus: 'pending' | 'draft' | 'validated';
  };
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conflict {
  id: string;
  sessionId: string;
  timestamp: number; // segons
  passA: string;
  passB: string;
  resolved: boolean;
  resolution?: ConflictResolution;
  finalText?: string;
  context?: {
    before: string;
    after: string;
  };
}

export interface Speaker {
  id: string;
  sessionId: string;
  speakerId: string; // SPEAKER_00, SPEAKER_01...
  identity?: string;
  role?: string;
  confidenceScore?: number;
  segments: SpeakerSegment[];
  isSecurityForce?: boolean;
  professionalCode?: string;
}

export interface SpeakerSegment {
  start: number;
  end: number;
  text: string;
}

export interface PIIEntity {
  id: string;
  sessionId: string;
  type: PIIEntityType;
  value: string;
  maskedValue: string;
  severity: PIISeverity;
  occurrences: PIIOccurrence[];
  action: PIIAction;
  pseudonym?: string;
  canKeep: boolean;
  keepReason?: string;
  blockReason?: string;
}

export interface PIIOccurrence {
  id: string;
  timestamp: number;
  contextBefore: string;
  text: string;
  contextAfter: string;
}

export interface PIIRule {
  id: string;
  name: string;
  type: 'regex' | 'context' | 'list';
  pattern?: string;
  contextKeywords?: string[];
  entityType: PIIEntityType;
  action: PIIAction;
  priority: 1 | 2 | 3 | 4; // 1=sempre suprimir, 2=protecció especial, 3=whitelist, 4=default
  enabled: boolean;
}

export interface WhitelistEntry {
  id: string;
  name: string;
  role?: string;
  isPublicOfficial: boolean;
  professionalContacts: {
    phone?: string;
    email?: string;
  };
  isSecurityForce: boolean;
  professionalCode?: string;
}

export interface KnownSpeaker {
  id: string;
  name: string;
  role: string;
  voiceProfileId?: string;
}

// Configuració de l'ajuntament
export interface MunicipalityConfig {
  id: string;
  name: string;
  whitelist: WhitelistEntry[];
  knownSpeakers: KnownSpeaker[];
  customRules: PIIRule[];
}
