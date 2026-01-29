import { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Kbd } from '@/components/ui/kbd';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AudioPanelProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  audioSource?: 'A' | 'B';
  onToggleAudioSource?: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioPanel({
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek,
  onSkipBack,
  onSkipForward,
  audioSource = 'A',
  onToggleAudioSource,
}: AudioPanelProps) {
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="panel-header">
        <h2 className="panel-title">Àudio + Context</h2>
        {onToggleAudioSource && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleAudioSource}
            className="gap-1.5 text-xs"
          >
            {audioSource === 'A' ? <ToggleLeft className="h-3.5 w-3.5" /> : <ToggleRight className="h-3.5 w-3.5" />}
            Pass {audioSource}
          </Button>
        )}
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Waveform simulat */}
        <div className="waveform-container h-24 relative">
          {/* Barra de progrés */}
          <div 
            className="absolute inset-y-0 left-0 bg-waveform-progress/20"
            style={{ width: `${progress}%` }}
          />
          
          {/* Ones simulades */}
          <div className="absolute inset-0 flex items-center justify-center px-2">
            <div className="flex items-end justify-around w-full h-16 gap-0.5">
              {Array.from({ length: 80 }).map((_, i) => {
                const height = Math.sin(i * 0.3) * 30 + Math.random() * 20 + 20;
                const isPast = (i / 80) * 100 < progress;
                return (
                  <div
                    key={i}
                    className={cn(
                      "w-1 rounded-full transition-colors",
                      isPast ? "bg-waveform-progress" : "bg-waveform-wave/40"
                    )}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Cursor */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-waveform-cursor"
            style={{ left: `${progress}%` }}
          />

          {/* Clic per buscar */}
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percent = x / rect.width;
              onSeek(percent * duration);
            }}
          />
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={([value]) => onSeek(value)}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onSkipBack}>
                <SkipBack className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              -5 segons <Kbd>J</Kbd>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="lg" 
                onClick={onPlayPause}
                className="h-12 w-12 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPlaying ? 'Pausa' : 'Reprodueix'} <Kbd>Space</Kbd>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onSkipForward}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              +5 segons <Kbd>K</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Volum */}
        <div className="flex items-center gap-2 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="shrink-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            onValueChange={([value]) => {
              setVolume(value);
              if (value > 0) setIsMuted(false);
            }}
            className="flex-1"
          />
        </div>
      </div>

      {/* Dreceres ràpides */}
      <div className="p-3 border-t border-panel-border bg-panel-header">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Kbd>Space</Kbd> Play
          </span>
          <span className="flex items-center gap-1">
            <Kbd>J</Kbd><Kbd>K</Kbd> Salt
          </span>
          <span className="flex items-center gap-1">
            <Kbd>1</Kbd><Kbd>2</Kbd> Tria A/B
          </span>
        </div>
      </div>
    </div>
  );
}
