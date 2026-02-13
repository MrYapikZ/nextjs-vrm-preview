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
  const [focalLength, setFocalLengthState] = useState(35);
  const [cameraPosition, setCameraPositionState] = useState({ x: DEFAULT_CAMERA_POS[0], y: DEFAULT_CAMERA_POS[1], z: DEFAULT_CAMERA_POS[2] });
  const [cameraTarget, setCameraTargetState] = useState({ x: DEFAULT_TARGET_POS[0], y: DEFAULT_TARGET_POS[1], z: DEFAULT_TARGET_POS[2] });

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
    keyLight.shadow.mapSize.width = 4096;
    keyLight.shadow.mapSize.height = 4096;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    // Increased bias to prevent shadow acne on curved surfaces
    keyLight.shadow.bias = -0.002;
    keyLight.shadow.normalBias = 0.02;
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

      // Enable shadows and fix UV channel issues for depth materials
      vrm.scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Fix for shader errors with custom UV channels (uv2, uv3, uv4, uv5, etc.)
          // VRM models may use multiple UV sets that Three.js depth materials don't support
          // The MeshDepthMaterial shader tries to use MAP_UV which may reference uv5
          // We create custom depth/distance materials without any texture maps
          const material = mesh.material as THREE.Material;
          
          // Create a basic depth material that doesn't use any texture UV transforms
          const customDepthMaterial = new THREE.MeshDepthMaterial({
            depthPacking: THREE.RGBADepthPacking,
          });
          
          // Handle alpha testing if the original material uses it
          if ('alphaTest' in material && (material as THREE.MeshStandardMaterial).alphaTest > 0) {
            const stdMat = material as THREE.MeshStandardMaterial;
            customDepthMaterial.alphaTest = stdMat.alphaTest;
            // Only copy the alpha map if using standard uv (uv attribute)
            if (stdMat.alphaMap && mesh.geometry.attributes.uv) {
              customDepthMaterial.alphaMap = stdMat.alphaMap;
            }
          }
          
          // Override the onBeforeCompile to remove any UV channel references beyond uv
          customDepthMaterial.onBeforeCompile = (shader) => {
            // Replace any MAP_UV, ALPHAMAP_UV etc. that might reference uv2-uv5 with just uv
            shader.vertexShader = shader.vertexShader
              .replace(/MAP_UV/g, 'uv')
              .replace(/ALPHAMAP_UV/g, 'uv')
              .replace(/LIGHTMAP_UV/g, 'uv')
              .replace(/AOMAP_UV/g, 'uv')
              .replace(/EMISSIVEMAP_UV/g, 'uv')
              .replace(/BUMPMAP_UV/g, 'uv')
              .replace(/NORMALMAP_UV/g, 'uv')
              .replace(/DISPLACEMENTMAP_UV/g, 'uv')
              .replace(/ROUGHNESSMAP_UV/g, 'uv')
              .replace(/METALNESSMAP_UV/g, 'uv')
              .replace(/SPECULARMAP_UV/g, 'uv');
          };
          
          mesh.customDepthMaterial = customDepthMaterial;
          
          // Also set custom distance material for point light shadows
          const customDistanceMaterial = new THREE.MeshDistanceMaterial();
          customDistanceMaterial.onBeforeCompile = (shader) => {
            shader.vertexShader = shader.vertexShader
              .replace(/MAP_UV/g, 'uv')
              .replace(/ALPHAMAP_UV/g, 'uv');
          };
          mesh.customDistanceMaterial = customDistanceMaterial;
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
      
      // Update state to match reset values
      setCameraPositionState({ x: DEFAULT_CAMERA_POS[0], y: DEFAULT_CAMERA_POS[1], z: DEFAULT_CAMERA_POS[2] });
      setCameraTargetState({ x: DEFAULT_TARGET_POS[0], y: DEFAULT_TARGET_POS[1], z: DEFAULT_TARGET_POS[2] });
      setFocalLengthState(35);
      
      // Reset FOV to default (35mm focal length)
      const sensorHeight = 24;
      const fov = 2 * Math.atan(sensorHeight / (2 * 35)) * (180 / Math.PI);
      cameraRef.current.fov = fov;
      cameraRef.current.updateProjectionMatrix();
    }
  }, []);

  // Set camera focal length
  const setFocalLength = useCallback((focal: number) => {
    setFocalLengthState(focal);
    if (cameraRef.current) {
      // Convert focal length to FOV: FOV = 2 * atan(sensorHeight / (2 * focalLength))
      // Using 35mm full-frame sensor height (24mm)
      const sensorHeight = 24;
      const fov = 2 * Math.atan(sensorHeight / (2 * focal)) * (180 / Math.PI);
      cameraRef.current.fov = fov;
      cameraRef.current.updateProjectionMatrix();
    }
  }, []);

  // Set camera position
  const setCameraPosition = useCallback((axis: 'x' | 'y' | 'z', value: number) => {
    setCameraPositionState((prev) => {
      const newPos = { ...prev, [axis]: value };
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(newPos.x, newPos.y, newPos.z);
        controlsRef.current.update();
      }
      return newPos;
    });
  }, []);

  // Set camera target (orbit controls target / look-at point)
  const setCameraTarget = useCallback((axis: 'x' | 'y' | 'z', value: number) => {
    setCameraTargetState((prev) => {
      const newTarget = { ...prev, [axis]: value };
      if (controlsRef.current) {
        controlsRef.current.target.set(newTarget.x, newTarget.y, newTarget.z);
        controlsRef.current.update();
      }
      return newTarget;
    });
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
    focalLength,
    setFocalLength,
    cameraPosition,
    setCameraPosition,
    cameraTarget,
    setCameraTarget,
  };
}
