import { MODELO_CONFIG, MODELO_ELEMENTS, initializeModeloElements } from './modelo-config.js';
import { ModeloViewerManager } from './modelo-viewer.js';
import { ModeloControlsManager } from './modelo-controls.js';
import { initializeModeloWebGPU } from './modelo-webgpu.js';

class ModeloApp {
  constructor() {
    this.gpuCapabilities = null;
    this.init();
  }

  async init() {
    initializeModeloElements();
    
    if (!MODELO_ELEMENTS.viewer) {
      console.error('Viewer element not found');
      if (MODELO_ELEMENTS.loader) {
        MODELO_ELEMENTS.loader.classList.add('hidden');
      }
      return;
    }

    this.gpuCapabilities = await initializeModeloWebGPU(MODELO_ELEMENTS.viewer);

    this.viewerManager = new ModeloViewerManager();
    this.controlsManager = new ModeloControlsManager(this.viewerManager);
    this.setupAccessibility();
    this.setupInteractions();
  }

  setupAccessibility() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMotionPreference = (e) => {
      if (e.matches && MODELO_ELEMENTS.viewer) {
        MODELO_ELEMENTS.viewer.autoRotate = false;
        MODELO_ELEMENTS.viewer.removeAttribute('auto-rotate');
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    };

    handleMotionPreference(mediaQuery);
    mediaQuery.addEventListener('change', handleMotionPreference);
  }

  setupInteractions() {
    if (!MODELO_ELEMENTS.viewer) return;

    let interactionTimeout = null;
    let isUserInteracting = false;

    const handleInteractionStart = () => {
      isUserInteracting = true;
      MODELO_ELEMENTS.viewer.autoRotate = false;
      
      if (interactionTimeout) {
        clearTimeout(interactionTimeout);
        interactionTimeout = null;
      }
    };

    const handleInteractionEnd = () => {
      isUserInteracting = false;
      
      if (interactionTimeout) {
        clearTimeout(interactionTimeout);
      }
      
      interactionTimeout = setTimeout(() => {
        if (this.controlsManager.isRotating && !isUserInteracting) {
          MODELO_ELEMENTS.viewer.autoRotate = true;
          if (!MODELO_ELEMENTS.viewer.hasAttribute('auto-rotate')) {
            MODELO_ELEMENTS.viewer.setAttribute('auto-rotate', '');
          }
        }
      }, MODELO_CONFIG.timing.interactionDelay);
    };

    MODELO_ELEMENTS.viewer.addEventListener('pointerdown', handleInteractionStart);
    MODELO_ELEMENTS.viewer.addEventListener('pointerup', handleInteractionEnd);
    MODELO_ELEMENTS.viewer.addEventListener('pointercancel', handleInteractionEnd);
    MODELO_ELEMENTS.viewer.addEventListener('touchstart', handleInteractionStart, { passive: true });
    MODELO_ELEMENTS.viewer.addEventListener('touchend', handleInteractionEnd);
    MODELO_ELEMENTS.viewer.addEventListener('wheel', handleInteractionStart, { passive: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ModeloApp());
} else {
  new ModeloApp();
}