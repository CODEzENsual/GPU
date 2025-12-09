import { MODELO_CONFIG, MODELO_ELEMENTS } from './modelo-config.js';

export class ModeloViewerManager {
  constructor() {
    this.loadTimer = null;
    this.originalSrc = MODELO_ELEMENTS.viewer ? MODELO_ELEMENTS.viewer.getAttribute('src') : '';
    this.isLoaded = false;
    this.setupEventListeners();
    this.showLoader();
  }

  setupEventListeners() {
    if (!MODELO_ELEMENTS.viewer) return;

    MODELO_ELEMENTS.viewer.addEventListener('load', () => this.onLoad());
    MODELO_ELEMENTS.viewer.addEventListener('progress', (e) => this.onProgress(e));
    MODELO_ELEMENTS.viewer.addEventListener('error', () => this.onError());

    if (MODELO_ELEMENTS.retryBtn) {
      MODELO_ELEMENTS.retryBtn.addEventListener('click', () => this.retry());
    }
  }

  showLoader() {
    if (!MODELO_ELEMENTS.loader) return;
    MODELO_ELEMENTS.loader.classList.remove('hidden');
    MODELO_ELEMENTS.loader.classList.remove('error');
    
    if (MODELO_ELEMENTS.loaderText) {
      MODELO_ELEMENTS.loaderText.textContent = 'Inicializando vista avanzada...';
    }
    
    if (MODELO_ELEMENTS.retryBtn) {
      MODELO_ELEMENTS.retryBtn.setAttribute('aria-hidden', 'true');
    }
    
    this.startLoadTimer();
  }

  hideLoader() {
    if (!MODELO_ELEMENTS.loader) return;
    MODELO_ELEMENTS.loader.classList.add('hidden');
    this.clearLoadTimer();
  }

  showError(text) {
    if (!MODELO_ELEMENTS.loader) return;
    MODELO_ELEMENTS.loader.classList.remove('hidden');
    MODELO_ELEMENTS.loader.classList.add('error');
    
    if (MODELO_ELEMENTS.loaderText) {
      MODELO_ELEMENTS.loaderText.textContent = text;
    }
    
    if (MODELO_ELEMENTS.retryBtn) {
      MODELO_ELEMENTS.retryBtn.setAttribute('aria-hidden', 'false');
    }
    
    this.clearLoadTimer();
  }

  startLoadTimer() {
    this.clearLoadTimer();
    this.loadTimer = setTimeout(() => {
      this.showError('Tiempo de carga excedido. Intenta reintentar.');
    }, MODELO_CONFIG.timing.loadTimeout);
  }

  clearLoadTimer() {
    if (this.loadTimer) {
      clearTimeout(this.loadTimer);
      this.loadTimer = null;
    }
  }

  onLoad() {
    this.isLoaded = true;
    this.centerModel();
    this.hideLoader();
  }

  onProgress(e) {
    const progress = Math.min(1, e.detail?.totalProgress || 0);
    const percentage = Math.round(progress * 100);
    
    if (MODELO_ELEMENTS.progressBar) {
      MODELO_ELEMENTS.progressBar.style.width = `${percentage}%`;
    }
    
    if (MODELO_ELEMENTS.loaderText) {
      if (percentage === 0) {
        MODELO_ELEMENTS.loaderText.textContent = 'Conectando al servidor...';
      } else if (percentage < 30) {
        MODELO_ELEMENTS.loaderText.textContent = `Descargando modelo ${percentage}%`;
      } else if (percentage < 70) {
        MODELO_ELEMENTS.loaderText.textContent = `Procesando geometría ${percentage}%`;
      } else if (percentage < 100) {
        MODELO_ELEMENTS.loaderText.textContent = `Aplicando materiales ${percentage}%`;
      } else {
        MODELO_ELEMENTS.loaderText.textContent = 'Finalizando carga...';
      }
    }
    
    if (progress === 1) {
      this.centerModel();
      this.hideLoader();
    }
  }

  onError() {
    this.showError('Error al cargar el modelo 3D. Verifica la conexión.');
  }

  centerModel() {
    try {
      if (!MODELO_ELEMENTS.viewer) return;
      
      const model = MODELO_ELEMENTS.viewer.model;
      if (!model) return;

      let min = null;
      let max = null;

      if (model.boundingBox && model.boundingBox.min && model.boundingBox.max) {
        min = model.boundingBox.min;
        max = model.boundingBox.max;
      } else if (typeof model.getBoundingBox === 'function') {
        const box = model.getBoundingBox();
        if (box && box.min && box.max) {
          min = box.min;
          max = box.max;
        }
      }

      if (min && max) {
        const cx = (min.x + max.x) / 2;
        const cy = (min.y + max.y) / 2;
        const cz = (min.z + max.z) / 2;
        const sx = Math.abs(max.x - min.x);
        const sy = Math.abs(max.y - min.y);
        const sz = Math.abs(max.z - min.z);
        const maxSize = Math.max(sx, sy, sz);
        const distance = Math.max(1.8, maxSize * 1.8);

        MODELO_ELEMENTS.viewer.cameraTarget = `${cx}m ${cy}m ${cz}m`;
        MODELO_ELEMENTS.viewer.cameraOrbit = `0deg 75deg ${distance}m`;

        if (typeof MODELO_ELEMENTS.viewer.jumpCameraToGoal === 'function') {
          MODELO_ELEMENTS.viewer.jumpCameraToGoal();
        }
      }
    } catch (e) {
      console.warn('No se pudo centrar el modelo');
    }
  }

  retry() {
    if (!MODELO_ELEMENTS.viewer) return;
    this.showLoader();
    const cacheBuster = Date.now();
    const freshSrc = `${this.originalSrc}?t=${cacheBuster}`;
    MODELO_ELEMENTS.viewer.setAttribute('src', freshSrc);
  }

  resetCamera() {
    if (!MODELO_ELEMENTS.viewer) return;
    MODELO_ELEMENTS.viewer.cameraOrbit = MODELO_CONFIG.camera.defaultOrbit;
    MODELO_ELEMENTS.viewer.cameraTarget = MODELO_CONFIG.camera.defaultTarget;
    
    if (typeof MODELO_ELEMENTS.viewer.jumpCameraToGoal === 'function') {
      MODELO_ELEMENTS.viewer.jumpCameraToGoal();
    }
  }
}