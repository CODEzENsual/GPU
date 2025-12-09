import { CONFIG, ELEMENTS } from './config.js';

export class ViewerManager {
  constructor(viewer, loader, progressBar, progressText) {
    this.viewer = viewer;
    this.loader = loader;
    this.progressBar = progressBar;
    this.progressText = progressText;
    this.rotating = false;
    this.initialOrbit = null;
    this.rotationSpeed = Number.isFinite(CONFIG.viewer.rotationSpeed) ? CONFIG.viewer.rotationSpeed : 0.5;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.viewer.addEventListener('load', () => this.onLoad());
    this.viewer.addEventListener('progress', (e) => this.onProgress(e));
    this.viewer.addEventListener('error', () => this.onError());
  }

  onLoad() {
    this.initialOrbit = this.viewer.cameraOrbit || '0deg 75deg 2.5m';
    this.hideLoader();
    this.rotating = this.viewer.autoRotate || false;
    this.applyRotationSpeed();
  }

  onProgress(e) {
    const progress = Math.min(1, e.detail?.totalProgress || 0);
    const percentage = Math.round(progress * 100);
    
    if (this.progressBar) {
      this.progressBar.style.width = `${percentage}%`;
    }
    
    if (this.progressText) {
      if (percentage === 0) {
        this.progressText.textContent = 'Inicializando sistema...';
      } else if (percentage < 50) {
        this.progressText.textContent = `Cargando geometría ${percentage}%`;
      } else if (percentage < 100) {
        this.progressText.textContent = `Aplicando texturas ${percentage}%`;
      } else {
        this.progressText.textContent = 'Finalizando carga...';
      }
    }
  }

  onError() {
    if (this.progressText) {
      this.progressText.textContent = 'Error al cargar el modelo';
    }
    if (this.progressBar) {
      this.progressBar.style.width = '100%';
      this.progressBar.style.background = 'var(--color-accent-tertiary)';
    }
  }

  hideLoader() {
    if (this.loader) {
      this.loader.classList.add('hidden');
    }
  }

  resetCamera() {
    if (typeof this.viewer.resetTurntableRotation === 'function') {
      this.viewer.resetTurntableRotation();
    }
    if (this.initialOrbit) {
      this.viewer.cameraOrbit = this.initialOrbit;
    }
  }

  setRotationSpeed(speed) {
    const value = parseFloat(speed);
    if (!Number.isNaN(value)) {
      this.rotationSpeed = value;
      this.applyRotationSpeed();
    }
  }

  toggleRotation() {
    this.rotating = !this.rotating;
    this.viewer.autoRotate = this.rotating;
    
    if (this.rotating) {
      this.viewer.setAttribute('auto-rotate', '');
      this.applyRotationSpeed();
    } else {
      this.viewer.removeAttribute('auto-rotate');
    }
    
    return this.rotating;
  }

  applyRotationSpeed() {
    if (!this.viewer) return;
    const value = Number.isFinite(this.rotationSpeed) ? this.rotationSpeed : CONFIG.viewer.rotationSpeed;
    this.viewer.rotationPerSecond = value;
    this.viewer.setAttribute('rotation-per-second', String(value));
  }

  loadModel(url) {
    if (!url) return;
    this.loader.classList.remove('hidden');
    if (this.progressText) this.progressText.textContent = 'Cargando nuevo modelo...';
    this.viewer.src = url;
  }
}