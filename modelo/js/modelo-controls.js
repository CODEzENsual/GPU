import { MODELO_ELEMENTS } from './modelo-config.js';

export class ModeloControlsManager {
  constructor(viewerManager) {
    this.viewerManager = viewerManager;
    this.isRotating = true;
    this.setupControls();
  }

  setupControls() {
    if (MODELO_ELEMENTS.rotateToggle) {
      MODELO_ELEMENTS.rotateToggle.addEventListener('click', () => this.handleRotateToggle());
    }

    if (MODELO_ELEMENTS.resetCam) {
      MODELO_ELEMENTS.resetCam.addEventListener('click', () => this.handleResetCamera());
    }

    if (MODELO_ELEMENTS.fullscreenToggle) {
      MODELO_ELEMENTS.fullscreenToggle.addEventListener('click', () => this.handleFullscreen());
      document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
    }

    window.addEventListener('resize', () => this.handleResize());
  }

  handleRotateToggle() {
    if (!MODELO_ELEMENTS.viewer) return;
    
    this.isRotating = !this.isRotating;
    MODELO_ELEMENTS.viewer.autoRotate = this.isRotating;
    
    if (this.isRotating) {
      MODELO_ELEMENTS.viewer.setAttribute('auto-rotate', '');
    } else {
      MODELO_ELEMENTS.viewer.removeAttribute('auto-rotate');
    }
    
    this.updateRotateButton();
  }

  updateRotateButton() {
    if (!MODELO_ELEMENTS.rotateToggle) return;
    
    const span = MODELO_ELEMENTS.rotateToggle.querySelector('span');
    if (span) {
      span.textContent = this.isRotating ? 'Detener rotación' : 'Iniciar rotación';
    }
    
    MODELO_ELEMENTS.rotateToggle.setAttribute('aria-pressed', String(this.isRotating));
  }

  handleResetCamera() {
    this.viewerManager.resetCamera();
  }

  async handleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        if (MODELO_ELEMENTS.viewer.requestFullscreen) {
          await MODELO_ELEMENTS.viewer.requestFullscreen();
        } else if (MODELO_ELEMENTS.viewer.webkitRequestFullscreen) {
          await MODELO_ELEMENTS.viewer.webkitRequestFullscreen();
        } else if (MODELO_ELEMENTS.viewer.mozRequestFullScreen) {
          await MODELO_ELEMENTS.viewer.mozRequestFullScreen();
        } else if (MODELO_ELEMENTS.viewer.msRequestFullscreen) {
          await MODELO_ELEMENTS.viewer.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Pantalla completa no disponible');
    }
  }

  updateFullscreenButton() {
    if (!MODELO_ELEMENTS.fullscreenToggle) return;
    
    const isFullscreen = !!document.fullscreenElement;
    const span = MODELO_ELEMENTS.fullscreenToggle.querySelector('span');
    
    if (span) {
      span.textContent = isFullscreen ? 'Salir pantalla' : 'Pantalla completa';
    }
    
    MODELO_ELEMENTS.fullscreenToggle.setAttribute(
      'aria-label',
      isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'
    );
  }

  handleResize() {
    if (!MODELO_ELEMENTS.viewer) return;
    MODELO_ELEMENTS.viewer.style.width = '100vw';
    MODELO_ELEMENTS.viewer.style.height = '100vh';
  }
}