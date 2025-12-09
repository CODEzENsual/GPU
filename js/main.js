import { CONFIG, ELEMENTS, initializeElements } from './config.js';
import { initializeTheme } from './theme.js';
import { ViewerManager } from './viewer.js';
import { ControlsManager } from './controls.js';
import { InteractionManager } from './interactions.js';
import { WebGPUManager, initializeWebGPU } from './webgpu.js';

class App {
  constructor() {
    this.gpuCapabilities = null;
    this.init();
  }

  async init() {
    initializeElements();
    
    if (!ELEMENTS.viewer) {
      console.error('Viewer element not found');
      return;
    }

    this.gpuCapabilities = await initializeWebGPU();
    console.info(`GPU Status: ${this.gpuCapabilities.status}`, this.gpuCapabilities.gpuInfo);

    this.themeManager = initializeTheme(ELEMENTS.btnTheme);
    
    this.viewerManager = new ViewerManager(
      ELEMENTS.viewer,
      ELEMENTS.loader,
      ELEMENTS.progressBar,
      ELEMENTS.progressText
    );

    await WebGPUManager.applyOptimalSettings(ELEMENTS.viewer, this.gpuCapabilities);

    this.controlsManager = new ControlsManager(
      this.viewerManager,
      ELEMENTS
    );

    this.interactionManager = new InteractionManager(
      ELEMENTS.viewer,
      this.viewerManager
    );

    this.setupAccessibility();
    this.registerServiceWorker();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
          console.info('ServiceWorker registered');
        }, err => {
          console.warn('ServiceWorker failed:', err);
        });
      });
    }
  }

  setupAccessibility() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMotionPreference = (e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduce-motion');
        if (ELEMENTS.viewer) {
          ELEMENTS.viewer.autoRotate = false;
        }
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    };

    handleMotionPreference(mediaQuery);
    mediaQuery.addEventListener('change', handleMotionPreference);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}