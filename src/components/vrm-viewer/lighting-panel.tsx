'use client';

import { Sun, Lightbulb, Sparkles, Moon, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { type LightsState, LIGHT_PRESETS } from './types';

interface LightingPanelProps {
  lights: LightsState;
  onLightsChange: (lights: LightsState) => void;
}

export function LightingPanel({ lights, onLightsChange }: LightingPanelProps) {
  const updateLight = (
    lightKey: keyof LightsState,
    property: string,
    value: number | string | boolean
  ) => {
    onLightsChange({
      ...lights,
      [lightKey]: {
        ...lights[lightKey],
        [property]: value,
      },
    });
  };

  const applyPreset = (presetKey: keyof typeof LIGHT_PRESETS) => {
    onLightsChange(LIGHT_PRESETS[presetKey].lights);
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-1">
        {/* Presets */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Palette className="h-4 w-4" />
              Lighting Presets
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {Object.entries(LIGHT_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className="justify-start text-xs"
                onClick={() => applyPreset(key as keyof typeof LIGHT_PRESETS)}
              >
                {preset.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Key Light */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                Key Light
              </span>
              <Switch
                checked={lights.key.on}
                onCheckedChange={(checked) => updateLight('key', 'on', checked)}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Intensity: {lights.key.intensity.toFixed(2)}
              </Label>
              <Slider
                value={[lights.key.intensity]}
                onValueChange={([val]) => updateLight('key', 'intensity', val)}
                min={0}
                max={5}
                step={0.05}
                disabled={!lights.key.on}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <input
                type="color"
                value={lights.key.color}
                onChange={(e) => updateLight('key', 'color', e.target.value)}
                className="h-8 w-full cursor-pointer rounded border border-input bg-transparent"
                disabled={!lights.key.on}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">X: {lights.key.x}</Label>
                <Slider
                  value={[lights.key.x!]}
                  onValueChange={([val]) => updateLight('key', 'x', val)}
                  min={-10}
                  max={10}
                  step={0.5}
                  disabled={!lights.key.on}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Y: {lights.key.y}</Label>
                <Slider
                  value={[lights.key.y!]}
                  onValueChange={([val]) => updateLight('key', 'y', val)}
                  min={-10}
                  max={10}
                  step={0.5}
                  disabled={!lights.key.on}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Z: {lights.key.z}</Label>
                <Slider
                  value={[lights.key.z!]}
                  onValueChange={([val]) => updateLight('key', 'z', val)}
                  min={-10}
                  max={10}
                  step={0.5}
                  disabled={!lights.key.on}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fill Light */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-400" />
                Fill Light
              </span>
              <Switch
                checked={lights.fill.on}
                onCheckedChange={(checked) => updateLight('fill', 'on', checked)}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Intensity: {lights.fill.intensity.toFixed(2)}
              </Label>
              <Slider
                value={[lights.fill.intensity]}
                onValueChange={([val]) => updateLight('fill', 'intensity', val)}
                min={0}
                max={3}
                step={0.05}
                disabled={!lights.fill.on}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <input
                type="color"
                value={lights.fill.color}
                onChange={(e) => updateLight('fill', 'color', e.target.value)}
                className="h-8 w-full cursor-pointer rounded border border-input bg-transparent"
                disabled={!lights.fill.on}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">X: {lights.fill.x}</Label>
                <Slider
                  value={[lights.fill.x!]}
                  onValueChange={([val]) => updateLight('fill', 'x', val)}
                  min={-10}
                  max={10}
                  step={0.5}
                  disabled={!lights.fill.on}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Y: {lights.fill.y}</Label>
                <Slider
                  value={[lights.fill.y!]}
                  onValueChange={([val]) => updateLight('fill', 'y', val)}
                  min={-10}
                  max={10}
                  step={0.5}
                  disabled={!lights.fill.on}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Z: {lights.fill.z}</Label>
                <Slider
                  value={[lights.fill.z!]}
                  onValueChange={([val]) => updateLight('fill', 'z', val)}
                  min={-10}
                  max={10}
                  step={0.5}
                  disabled={!lights.fill.on}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rim Light */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-400" />
                Rim Light
              </span>
              <Switch
                checked={lights.rim.on}
                onCheckedChange={(checked) => updateLight('rim', 'on', checked)}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Intensity: {lights.rim.intensity.toFixed(2)}
              </Label>
              <Slider
                value={[lights.rim.intensity]}
                onValueChange={([val]) => updateLight('rim', 'intensity', val)}
                min={0}
                max={5}
                step={0.05}
                disabled={!lights.rim.on}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <input
                type="color"
                value={lights.rim.color}
                onChange={(e) => updateLight('rim', 'color', e.target.value)}
                className="h-8 w-full cursor-pointer rounded border border-input bg-transparent"
                disabled={!lights.rim.on}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">X: {lights.rim.x}</Label>
                <Slider
                  value={[lights.rim.x!]}
                  onValueChange={([val]) => updateLight('rim', 'x', val)}
                  min={-10}
                  max={10}
                  step={0.5}
                  disabled={!lights.rim.on}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Y: {lights.rim.y}</Label>
                <Slider
                  value={[lights.rim.y!]}
                  onValueChange={([val]) => updateLight('rim', 'y', val)}
                  min={-10}
                  max={10}
                  step={0.5}
                  disabled={!lights.rim.on}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Z: {lights.rim.z}</Label>
                <Slider
                  value={[lights.rim.z!]}
                  onValueChange={([val]) => updateLight('rim', 'z', val)}
                  min={-10}
                  max={10}
                  step={0.5}
                  disabled={!lights.rim.on}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Light */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-400" />
                Back Light
              </span>
              <Switch
                checked={lights.back.on}
                onCheckedChange={(checked) => updateLight('back', 'on', checked)}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Intensity: {lights.back.intensity.toFixed(2)}
              </Label>
              <Slider
                value={[lights.back.intensity]}
                onValueChange={([val]) => updateLight('back', 'intensity', val)}
                min={0}
                max={3}
                step={0.05}
                disabled={!lights.back.on}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <input
                type="color"
                value={lights.back.color}
                onChange={(e) => updateLight('back', 'color', e.target.value)}
                className="h-8 w-full cursor-pointer rounded border border-input bg-transparent"
                disabled={!lights.back.on}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">X: {lights.back.x}</Label>
                <Slider
                  value={[lights.back.x!]}
                  onValueChange={([val]) => updateLight('back', 'x', val)}
                  min={-10}
                  max={10}
                  step={0.5}
                  disabled={!lights.back.on}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Y: {lights.back.y}</Label>
                <Slider
                  value={[lights.back.y!]}
                  onValueChange={([val]) => updateLight('back', 'y', val)}
                  min={-10}
                  max={10}
                  step={0.5}
                  disabled={!lights.back.on}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Z: {lights.back.z}</Label>
                <Slider
                  value={[lights.back.z!]}
                  onValueChange={([val]) => updateLight('back', 'z', val)}
                  min={-10}
                  max={10}
                  step={0.5}
                  disabled={!lights.back.on}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Ambient Light */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-gray-400" />
                Ambient Light
              </span>
              <Switch
                checked={lights.ambient.on}
                onCheckedChange={(checked) => updateLight('ambient', 'on', checked)}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Intensity: {lights.ambient.intensity.toFixed(2)}
              </Label>
              <Slider
                value={[lights.ambient.intensity]}
                onValueChange={([val]) => updateLight('ambient', 'intensity', val)}
                min={0}
                max={2}
                step={0.05}
                disabled={!lights.ambient.on}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <input
                type="color"
                value={lights.ambient.color}
                onChange={(e) => updateLight('ambient', 'color', e.target.value)}
                className="h-8 w-full cursor-pointer rounded border border-input bg-transparent"
                disabled={!lights.ambient.on}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
