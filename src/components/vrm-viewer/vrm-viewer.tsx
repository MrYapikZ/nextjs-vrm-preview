'use client';

import { useRef } from 'react';
import { Upload, User, Sun, Play, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useVrmViewer } from './use-vrm-viewer';
import { LightingPanel } from './lighting-panel';
import { AnimationPanel } from './animation-panel';
import { EnvironmentPanel } from './environment-panel';

export function VrmViewer() {
  const {
    mountRef,
    isLoading,
    loadingText,
    lights,
    updateLights,
    showGrid,
    toggleGrid,
    bgColor,
    updateBgColor,
    hasVrm,
    loadVrm,
    loadVrma,
    animationState,
    togglePlayPause,
    setPlaybackSpeed,
    seekAnimation,
    resetAnimation,
    resetCamera,
  } = useVrmViewer();

  const vrmInputRef = useRef<HTMLInputElement>(null);

  const handleVrmUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadVrm(file);
    }
  };

  return (
    <TooltipProvider>
      <div className="relative flex h-screen w-full overflow-hidden bg-background">
        {/* Main Viewer Area */}
        <div className="relative flex-1">
          {/* 3D Canvas Container */}
          <div ref={mountRef} className="h-full w-full" />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{loadingText}</p>
              </div>
            </div>
          )}

          {/* Top Toolbar */}
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <h3 className="text-secondary mix-blend-difference">
                <span className="text-lg font-semibold">VRM Viewer <span className="text-xs font-light">by yapi</span> </span>
            </h3>
            <input
              ref={vrmInputRef}
              type="file"
              accept=".vrm"
              className="hidden"
              onChange={handleVrmUpload}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 shadow-lg"
                  onClick={() => vrmInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Load VRM
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload a VRM model file</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Empty State */}
          {!hasVrm && !isLoading && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Card className="pointer-events-auto flex flex-col items-center gap-4 border-dashed bg-card/80 p-8 backdrop-blur-sm">
                <div className="rounded-full bg-muted p-4">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">No VRM Model Loaded</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click "Load VRM" to get started
                  </p>
                </div>
                <Button
                  variant="default"
                  size="lg"
                  className="gap-2"
                  onClick={() => vrmInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Select VRM File
                </Button>
              </Card>
            </div>
          )}

          {/* Animation Status Bar */}
          {hasVrm && animationState.animDuration > 0 && (
            <div className="absolute bottom-4 left-4 right-80 flex items-center gap-3 rounded-lg bg-card/90 p-3 shadow-lg backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={togglePlayPause}
              >
                {animationState.isPlaying ? (
                  <span className="h-3 w-3 rounded-sm bg-foreground" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div className="flex-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(animationState.animTime / animationState.animDuration) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <span className="min-w-16 text-xs text-muted-foreground">
                {formatTime(animationState.animTime)} /{' '}
                {formatTime(animationState.animDuration)}
              </span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs">
                {animationState.playbackSpeed}x
              </span>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <Card className="w-80 rounded-none border-y-0 border-r-0 shadow-xl overflow-scroll">
          <Tabs defaultValue="lighting" className="flex h-full flex-col">
            <TabsList className="mx-4 mt-4 grid w-auto grid-cols-3">
              <TabsTrigger value="lighting" className="gap-2">
                <Sun className="h-4 w-4" />
                <span className="hidden sm:inline">Lights</span>
              </TabsTrigger>
              <TabsTrigger value="animation" className="gap-2">
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Anim</span>
              </TabsTrigger>
              <TabsTrigger value="environment" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Env</span>
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 p-4">
              <TabsContent value="lighting" className="mt-0">
                <LightingPanel lights={lights} onLightsChange={updateLights} />
              </TabsContent>

              <TabsContent value="animation" className="mt-0">
                <AnimationPanel
                  animationState={animationState}
                  hasVrm={hasVrm}
                  onTogglePlayPause={togglePlayPause}
                  onSetPlaybackSpeed={setPlaybackSpeed}
                  onSeek={seekAnimation}
                  onReset={resetAnimation}
                  onLoadAnimation={loadVrma}
                />
              </TabsContent>

              <TabsContent value="environment" className="mt-0">
                <EnvironmentPanel
                  showGrid={showGrid}
                  bgColor={bgColor}
                  onToggleGrid={toggleGrid}
                  onBgColorChange={updateBgColor}
                  onResetCamera={resetCamera}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </Card>
      </div>
    </TooltipProvider>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
