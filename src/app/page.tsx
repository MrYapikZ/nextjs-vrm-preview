'use client';
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
// Fix: Add .js extensions for explicit module resolution
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Upload, Play, Pause, RotateCcw,
  Settings, Video, Monitor, User
} from 'lucide-react';
