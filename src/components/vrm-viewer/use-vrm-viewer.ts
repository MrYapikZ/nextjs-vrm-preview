'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, VRM } from '@pixiv/three-vrm';
import { VRMAnimationLoaderPlugin, VRMAnimation, createVRMAnimationClip } from '@pixiv/three-vrm-animation';
import {
  DEFAULT_CAMERA_POS,
  DEFAULT_TARGET_POS,
  DEFAULT_LIGHTS,
  type LightsState,
  type AnimationState,
} from './types';

export function useVrmViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentVrmRef = useRef<VRM | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const animationFrameRef = useRef<number | null>(null);

  // Light refs
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const backLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Animation refs
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Initializing Engine...');
  const [lights, setLights] = useState<LightsState>(DEFAULT_LIGHTS);
  const [showGrid, setShowGrid] = useState(true);
  const [bgColor, setBgColor] = useState('#1a1a2e');
  const [hasVrm, setHasVrm] = useState(false);

  const [animationState, setAnimationState] = useState<AnimationState>({
    mixer: null,
    currentAction: null,
    isPlaying: true,
    animTime: 0,
    animDuration: 0,
    playbackSpeed: 1.0,
    animationName: '',
  });

  const gridRef = useRef<THREE.GridHelper | null>(null);

  // Initialize scene
  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      35,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(...DEFAULT_CAMERA_POS);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...DEFAULT_TARGET_POS);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.update();
    controlsRef.current = controls;

    // Setup lights
    setupLights(scene);

    // Grid
    const grid = new THREE.GridHelper(10, 20, 0x444444, 0x333333);
    scene.add(grid);
    gridRef.current = grid;

    // Ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    setIsLoading(false);
    setLoadingText('');

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();

      // Update VRM
      if (currentVrmRef.current) {
        currentVrmRef.current.update(delta);
      }

      // Update mixer
      if (mixerRef.current) {
        mixerRef.current.update(delta);
        const action = currentActionRef.current;
        if (action) {
          setAnimationState((prev) => ({
            ...prev,
            animTime: action.time,
          }));
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const setupLights = (scene: THREE.Scene) => {
    // Key Light (main light)
    const keyLight = new THREE.DirectionalLight(
      lights.key.color,
      lights.key.intensity
    );
    keyLight.position.set(lights.key.x!, lights.key.y!, lights.key.z!);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // Fill Light
    const fillLight = new THREE.DirectionalLight(
      lights.fill.color,
      lights.fill.intensity
    );
    fillLight.position.set(lights.fill.x!, lights.fill.y!, lights.fill.z!);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Rim Light (backlight)
    const rimLight = new THREE.DirectionalLight(
      lights.rim.color,
      lights.rim.intensity
    );
    rimLight.position.set(lights.rim.x!, lights.rim.y!, lights.rim.z!);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Back Light
    const backLight = new THREE.DirectionalLight(
      lights.back.color,
      lights.back.intensity
    );
    backLight.position.set(lights.back.x!, lights.back.y!, lights.back.z!);
    scene.add(backLight);
    backLightRef.current = backLight;

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(
      lights.ambient.color,
      lights.ambient.intensity
    );
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;
  };

  // Update lights
  const updateLights = useCallback((newLights: LightsState) => {
    setLights(newLights);

    if (keyLightRef.current) {
      keyLightRef.current.intensity = newLights.key.on ? newLights.key.intensity : 0;
      keyLightRef.current.color.set(newLights.key.color);
      keyLightRef.current.position.set(newLights.key.x!, newLights.key.y!, newLights.key.z!);
    }

    if (fillLightRef.current) {
      fillLightRef.current.intensity = newLights.fill.on ? newLights.fill.intensity : 0;
      fillLightRef.current.color.set(newLights.fill.color);
      fillLightRef.current.position.set(newLights.fill.x!, newLights.fill.y!, newLights.fill.z!);
    }

    if (rimLightRef.current) {
      rimLightRef.current.intensity = newLights.rim.on ? newLights.rim.intensity : 0;
      rimLightRef.current.color.set(newLights.rim.color);
      rimLightRef.current.position.set(newLights.rim.x!, newLights.rim.y!, newLights.rim.z!);
    }

    if (backLightRef.current) {
      backLightRef.current.intensity = newLights.back.on ? newLights.back.intensity : 0;
      backLightRef.current.color.set(newLights.back.color);
      backLightRef.current.position.set(newLights.back.x!, newLights.back.y!, newLights.back.z!);
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = newLights.ambient.on ? newLights.ambient.intensity : 0;
      ambientLightRef.current.color.set(newLights.ambient.color);
    }
  }, []);

  // Load VRM
  const loadVrm = useCallback(async (file: File) => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    setLoadingText('Loading VRM model...');

    // Remove existing VRM
    if (currentVrmRef.current) {
      sceneRef.current.remove(currentVrmRef.current.scene);
      VRMUtils.deepDispose(currentVrmRef.current.scene);
      currentVrmRef.current = null;
    }

    // Reset animation
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      mixerRef.current = null;
    }
    currentActionRef.current = null;
    setAnimationState({
      mixer: null,
      currentAction: null,
      isPlaying: true,
      animTime: 0,
      animDuration: 0,
      playbackSpeed: 1.0,
      animationName: '',
    });

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    try {
      const url = URL.createObjectURL(file);
      const gltf = await loader.loadAsync(url);
      URL.revokeObjectURL(url);

      const vrm = gltf.userData.vrm as VRM;
      if (!vrm) {
        throw new Error('No VRM data found in file');
      }

      VRMUtils.removeUnnecessaryVertices(vrm.scene);
      VRMUtils.removeUnnecessaryJoints(vrm.scene);
      VRMUtils.rotateVRM0(vrm);

      // Enable shadows
      vrm.scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });

      sceneRef.current.add(vrm.scene);
      currentVrmRef.current = vrm;
      setHasVrm(true);

      // Reset camera
      if (controlsRef.current && cameraRef.current) {
        cameraRef.current.position.set(...DEFAULT_CAMERA_POS);
        controlsRef.current.target.set(...DEFAULT_TARGET_POS);
        controlsRef.current.update();
      }

      setIsLoading(false);
      setLoadingText('');
    } catch (error) {
      console.error('Error loading VRM:', error);
      setIsLoading(false);
      setLoadingText('Error loading VRM');
    }
  }, []);

  // Load VRMA Animation
  const loadVrma = useCallback(async (file: File) => {
    if (!currentVrmRef.current) {
      console.error('No VRM loaded');
      return;
    }

    setIsLoading(true);
    setLoadingText('Loading animation...');

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMAnimationLoaderPlugin(parser));

    try {
      const url = URL.createObjectURL(file);
      const gltf = await loader.loadAsync(url);
      URL.revokeObjectURL(url);

      const vrmAnimation = gltf.userData.vrmAnimations?.[0] as VRMAnimation;
      if (!vrmAnimation) {
        throw new Error('No VRM animation found in file');
      }

      // Create mixer if not exists
      if (!mixerRef.current) {
        mixerRef.current = new THREE.AnimationMixer(currentVrmRef.current.scene);
      }

      // Stop current animation
      if (currentActionRef.current) {
        currentActionRef.current.stop();
      }

      // Create and play new animation
      const clip = createVRMAnimationClip(vrmAnimation, currentVrmRef.current);
      const action = mixerRef.current.clipAction(clip);
      action.play();
      currentActionRef.current = action;

      setAnimationState((prev) => ({
        ...prev,
        mixer: mixerRef.current,
        currentAction: action,
        isPlaying: true,
        animDuration: clip.duration,
        animationName: file.name.replace('.vrma', ''),
      }));

      setIsLoading(false);
      setLoadingText('');
    } catch (error) {
      console.error('Error loading VRMA:', error);
      setIsLoading(false);
      setLoadingText('Error loading animation');
    }
  }, []);

  // Animation controls
  const togglePlayPause = useCallback(() => {
    const action = currentActionRef.current;
    if (!action) return;

    if (animationState.isPlaying) {
      action.paused = true;
    } else {
      action.paused = false;
    }

    setAnimationState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, [animationState.isPlaying]);

  const setPlaybackSpeed = useCallback((speed: number) => {
    const action = currentActionRef.current;
    if (action) {
      action.timeScale = speed;
    }
    setAnimationState((prev) => ({
      ...prev,
      playbackSpeed: speed,
    }));
  }, []);

  const seekAnimation = useCallback((time: number) => {
    const action = currentActionRef.current;
    if (action) {
      action.time = time;
    }
    setAnimationState((prev) => ({
      ...prev,
      animTime: time,
    }));
  }, []);

  const resetAnimation = useCallback(() => {
    const action = currentActionRef.current;
    if (action) {
      action.time = 0;
      action.paused = false;
    }
    setAnimationState((prev) => ({
      ...prev,
      animTime: 0,
      isPlaying: true,
    }));
  }, []);

  // Grid toggle
  const toggleGrid = useCallback((show: boolean) => {
    setShowGrid(show);
    if (gridRef.current) {
      gridRef.current.visible = show;
    }
  }, []);

  // Background color
  const updateBgColor = useCallback((color: string) => {
    setBgColor(color);
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(color);
    }
  }, []);

  // Reset camera
  const resetCamera = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(...DEFAULT_CAMERA_POS);
      controlsRef.current.target.set(...DEFAULT_TARGET_POS);
      controlsRef.current.update();
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    const cleanup = initScene();
    return () => {
      cleanup?.();
    };
  }, [initScene]);

  return {
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
  };
}
