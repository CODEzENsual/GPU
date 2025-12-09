import { CONFIG } from './config.js';

export class InteractionManager {
  constructor(viewer, viewerManager) {
    this.viewer = viewer;
    this.viewerManager = viewerManager;
    this.userInteracting = false;
    this.interactionTimeout = null;
    this.setupInteractionListeners();
  }

  setupInteractionListeners() {
    this.viewer.addEventListener('pointerdown', () => this.handleInteractionStart());
    this.viewer.addEventListener('pointerup', () => this.handleInteractionEnd());
    this.viewer.addEventListener('pointercancel', () => this.handleInteractionEnd());
    this.viewer.addEventListener('touchstart', () => this.handleInteractionStart(), { passive: true });
    this.viewer.addEventListener('touchend', () => this.handleInteractionEnd());
    this.viewer.addEventListener('wheel', () => this.handleInteractionStart(), { passive: true });
  }

  handleInteractionStart() {
    this.userInteracting = true;
    this.viewer.autoRotate = false;
    
    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
      this.interactionTimeout = null;
    }
  }

  handleInteractionEnd() {
    this.userInteracting = false;
    
    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
    }
    
    this.interactionTimeout = setTimeout(() => {
      if (this.viewerManager.rotating && !this.userInteracting) {
        this.viewer.autoRotate = true;
        this.viewerManager.applyRotationSpeed();
        if (!this.viewer.hasAttribute('auto-rotate')) {
          this.viewer.setAttribute('auto-rotate', '');
        }
      }
    }, CONFIG.timing.interactionDelay);
  }
}