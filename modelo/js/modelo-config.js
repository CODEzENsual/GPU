export const MODELO_CONFIG = {
  viewer: {
    autoRotate: true,
    rotationSpeed: 0.5,
    exposure: 1.2,
    shadowIntensity: 1.2,
    shadowSoftness: 0.8,
    environmentImage: 'neutral',
    interactionPrompt: 'auto',
    toneMapping: 'aces'
  },

  webgpu: {
    preferHighPerformance: true,
    fallbackToWebGL: true
  },
  
  timing: {
    interactionDelay: 800,
    loadTimeout: 20000,
    retryDelay: 1000
  },
  
  camera: {
    defaultOrbit: '0deg 75deg 2.5m',
    defaultTarget: '0m 0m 0m'
  }
};

export const MODELO_ELEMENTS = {
  viewer: null,
  loader: null,
  loaderText: null,
  progressBar: null,
  retryBtn: null,
  rotateToggle: null,
  resetCam: null,
  fullscreenToggle: null,
  menu: null
};

export function initializeModeloElements() {
  MODELO_ELEMENTS.viewer = document.getElementById('viewer');
  MODELO_ELEMENTS.loader = document.getElementById('loader');
  MODELO_ELEMENTS.loaderText = document.getElementById('loaderText');
  MODELO_ELEMENTS.progressBar = document.getElementById('progressBar');
  MODELO_ELEMENTS.retryBtn = document.getElementById('retryBtn');
  MODELO_ELEMENTS.rotateToggle = document.getElementById('rotateToggle');
  MODELO_ELEMENTS.resetCam = document.getElementById('resetCam');
  MODELO_ELEMENTS.fullscreenToggle = document.getElementById('fullscreenToggle');
  MODELO_ELEMENTS.menu = document.getElementById('menu');
}