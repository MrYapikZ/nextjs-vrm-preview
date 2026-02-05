import type * as THREE from 'three';
import type { VRM } from '@pixiv/three-vrm';

export interface LightConfig {
  intensity: number;
  color: string;
  x?: number;
  y?: number;
  z?: number;
  on: boolean;
}

export interface LightsState {
  key: LightConfig;
  fill: LightConfig;
  rim: LightConfig;
  back: LightConfig;
  ambient: LightConfig;
}

export interface ViewerState {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  controls: any;
  currentVrm: VRM | null;
}

export interface AnimationState {
  mixer: THREE.AnimationMixer | null;
  currentAction: THREE.AnimationAction | null;
  isPlaying: boolean;
  animTime: number;
  animDuration: number;
  playbackSpeed: number;
  animationName: string;
}

export interface EnvironmentState {
  showGrid: boolean;
  bgColor: string;
  environmentPreset: string;
}

export const DEFAULT_CAMERA_POS: [number, number, number] = [0.0, 1.4, 3.0];
export const DEFAULT_TARGET_POS: [number, number, number] = [0.0, 0.8, 0.0];

export const DEFAULT_LIGHTS: LightsState = {
  key: { intensity: 1.5, color: '#ffffff', x: 3, y: 3, z: 3, on: true },
  fill: { intensity: 0.6, color: '#88ccff', x: -3, y: 2, z: 2, on: true },
  rim: { intensity: 1.2, color: '#ffaa44', x: 0, y: 2, z: -3, on: true },
  back: { intensity: 0.4, color: '#4488ff', x: 0, y: 1, z: -4, on: true },
  ambient: { intensity: 0.25, color: '#ffffff', on: true },
};

export const LIGHT_PRESETS = {
  studio: {
    name: 'Studio',
    lights: {
      key: { intensity: 1.5, color: '#ffffff', x: 3, y: 3, z: 3, on: true },
      fill: { intensity: 0.6, color: '#88ccff', x: -3, y: 2, z: 2, on: true },
      rim: { intensity: 1.2, color: '#ffaa44', x: 0, y: 2, z: -3, on: true },
      back: { intensity: 0.4, color: '#4488ff', x: 0, y: 1, z: -4, on: true },
      ambient: { intensity: 0.25, color: '#ffffff', on: true },
    },
  },
  dramatic: {
    name: 'Dramatic',
    lights: {
      key: { intensity: 2.0, color: '#ff8844', x: 4, y: 4, z: 2, on: true },
      fill: { intensity: 0.3, color: '#4466aa', x: -4, y: 1, z: 2, on: true },
      rim: { intensity: 1.8, color: '#ff4400', x: 0, y: 3, z: -4, on: true },
      back: { intensity: 0.2, color: '#220044', x: 0, y: 0, z: -3, on: true },
      ambient: { intensity: 0.1, color: '#221133', on: true },
    },
  },
  soft: {
    name: 'Soft Portrait',
    lights: {
      key: { intensity: 1.0, color: '#fff5e6', x: 2, y: 3, z: 4, on: true },
      fill: { intensity: 0.8, color: '#e6f0ff', x: -3, y: 2, z: 3, on: true },
      rim: { intensity: 0.6, color: '#ffe0cc', x: 0, y: 2, z: -2, on: true },
      back: { intensity: 0.3, color: '#ccddff', x: 0, y: 1, z: -3, on: true },
      ambient: { intensity: 0.4, color: '#f5f5f5', on: true },
    },
  },
  cyberpunk: {
    name: 'Cyberpunk',
    lights: {
      key: { intensity: 1.8, color: '#ff00ff', x: 3, y: 2, z: 3, on: true },
      fill: { intensity: 1.2, color: '#00ffff', x: -3, y: 2, z: 2, on: true },
      rim: { intensity: 2.0, color: '#ff0088', x: 0, y: 3, z: -3, on: true },
      back: { intensity: 0.8, color: '#0088ff', x: 0, y: 1, z: -4, on: true },
      ambient: { intensity: 0.15, color: '#110022', on: true },
    },
  },
  natural: {
    name: 'Natural Daylight',
    lights: {
      key: { intensity: 1.3, color: '#fffbe6', x: 5, y: 8, z: 3, on: true },
      fill: { intensity: 0.5, color: '#e6f3ff', x: -2, y: 4, z: 4, on: true },
      rim: { intensity: 0.4, color: '#fff0d6', x: 1, y: 3, z: -2, on: true },
      back: { intensity: 0.2, color: '#d6e8ff', x: 0, y: 2, z: -3, on: true },
      ambient: { intensity: 0.5, color: '#f0f5ff', on: true },
    },
  },
};
