'use client';

import {
  Play,
  Pause,
  RotateCcw,
  Rewind,
  FastForward,
  Music,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { type AnimationState } from './types';

interface AnimationPanelProps {
  animationState: AnimationState;
  hasVrm: boolean;
  onTogglePlayPause: () => void;
  onSetPlaybackSpeed: (speed: number) => void;
  onSeek: (time: number) => void;
  onReset: () => void;
  onLoadAnimation: (file: File) => void;
}

export function AnimationPanel({
  animationState,
  hasVrm,
  onTogglePlayPause,
  onSetPlaybackSpeed,
  onSeek,
  onReset,
  onLoadAnimation,
}: AnimationPanelProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadAnimation(file);
    }
  };

  const hasAnimation = animationState.animDuration > 0;

  const speedPresets = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="space-y-4 p-1">
      {/* Load Animation */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Music className="h-4 w-4" />
            Load Animation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <input
              type="file"
              id="vrma-upload"
              accept=".vrma"
              className="hidden"
              onChange={handleFileSelect}
              disabled={!hasVrm}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => document.getElementById('vrma-upload')?.click()}
              disabled={!hasVrm}
            >
              {hasVrm ? 'Select VRMA File' : 'Load VRM First'}
            </Button>
            {animationState.animationName && (
              <p className="text-xs text-muted-foreground truncate">
                Current: {animationState.animationName}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Playback Controls */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Playback Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatTime(animationState.animTime)}</span>
              <span>{formatTime(animationState.animDuration)}</span>
            </div>
            <Slider
              value={[animationState.animTime]}
              onValueChange={([val]) => onSeek(val)}
              min={0}
              max={animationState.animDuration || 1}
              step={0.01}
              disabled={!hasAnimation}
              className="cursor-pointer"
            />
          </div>

          {/* Transport Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onSeek(Math.max(0, animationState.animTime - 1))}
              disabled={!hasAnimation}
            >
              <Rewind className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={onTogglePlayPause}
              disabled={!hasAnimation}
            >
              {animationState.isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                onSeek(Math.min(animationState.animDuration, animationState.animTime + 1))
              }
              disabled={!hasAnimation}
            >
              <FastForward className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onReset}
              disabled={!hasAnimation}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Speed Control */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Playback Speed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Speed: {animationState.playbackSpeed.toFixed(2)}x
            </Label>
            <Slider
              value={[animationState.playbackSpeed]}
              onValueChange={([val]) => onSetPlaybackSpeed(val)}
              min={0.1}
              max={3}
              step={0.05}
              disabled={!hasAnimation}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {speedPresets.map((speed) => (
              <Button
                key={speed}
                variant={animationState.playbackSpeed === speed ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onSetPlaybackSpeed(speed)}
                disabled={!hasAnimation}
              >
                {speed}x
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
