'use client';

import { Grid3X3, Palette, RotateCcw, Camera, Monitor, Focus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface EnvironmentPanelProps {
  showGrid: boolean;
  bgColor: string;
  focalLength: number;
  onToggleGrid: (show: boolean) => void;
  onBgColorChange: (color: string) => void;
  onResetCamera: () => void;
  onFocalLengthChange: (focalLength: number) => void;
}

const PRESET_COLORS = [
  { name: 'Dark Blue', color: '#1a1a2e' },
  { name: 'Charcoal', color: '#202020' },
  { name: 'Midnight', color: '#0a0a1a' },
  { name: 'Purple Dark', color: '#1a0a2e' },
  { name: 'Forest', color: '#0a1a0a' },
  { name: 'Warm Gray', color: '#2a2520' },
  { name: 'Pure Black', color: '#000000' },
  { name: 'Soft White', color: '#f5f5f5' },
];

const FOCAL_LENGTH_PRESETS = [
  { name: '24mm', value: 24 },
  { name: '35mm', value: 35 },
  { name: '50mm', value: 50 },
  { name: '85mm', value: 85 },
  { name: '135mm', value: 135 },
];

export function EnvironmentPanel({
  showGrid,
  bgColor,
  focalLength,
  onToggleGrid,
  onBgColorChange,
  onResetCamera,
  onFocalLengthChange,
}: EnvironmentPanelProps) {
  return (
    <div className="space-y-4 p-1">
      {/* Camera Controls */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Camera className="h-4 w-4" />
            Camera
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onResetCamera}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Camera
          </Button>
          <p className="text-xs text-muted-foreground">
            Use mouse to orbit, scroll to zoom, right-click to pan.
          </p>
        </CardContent>
      </Card>

      {/* Focal Length */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Focus className="h-4 w-4" />
            Focal Length
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Focal Length</Label>
              <span className="text-xs font-medium">{focalLength}mm</span>
            </div>
            <Slider
              value={[focalLength]}
              onValueChange={([value]) => onFocalLengthChange(value)}
              min={14}
              max={200}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>14mm</span>
              <span>Wide</span>
              <span>Normal</span>
              <span>Telephoto</span>
              <span>200mm</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Presets</Label>
            <div className="flex flex-wrap gap-1">
              {FOCAL_LENGTH_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`rounded px-2 py-1 text-xs transition-all ${
                    focalLength === preset.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => onFocalLengthChange(preset.value)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Toggle */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Grid3X3 className="h-4 w-4" />
            Grid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="grid-toggle" className="text-sm">
              Show Grid
            </Label>
            <Switch
              id="grid-toggle"
              checked={showGrid}
              onCheckedChange={onToggleGrid}
            />
          </div>
        </CardContent>
      </Card>

      {/* Background Color */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Palette className="h-4 w-4" />
            Background
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Custom Color</Label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => onBgColorChange(e.target.value)}
              className="h-10 w-full cursor-pointer rounded border border-input bg-transparent"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Presets</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  className={`h-8 w-full rounded border-2 transition-all ${
                    bgColor === preset.color
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-border'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  onClick={() => onBgColorChange(preset.color)}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rendering Info */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Monitor className="h-4 w-4" />
            Rendering
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• ACES Filmic Tone Mapping</p>
            <p>• PCF Soft Shadows</p>
            <p>• High Performance Mode</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
