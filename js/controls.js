export class ControlsManager {
  constructor(viewerManager, elements) {
    this.viewerManager = viewerManager;
    this.elements = elements;
    this.setupControls();
    this.setupKeyboardControls();
  }

  setupControls() {
    const { btnRotate, btnReset, speed, btnFullscreen, viewerWrap, btnUpload, fileInput, btnShare, btnAI, btnVR } = this.elements;

    if (btnRotate) {
      btnRotate.addEventListener('click', () => this.handleRotateToggle());
      this.updateRotateButton();
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => this.viewerManager.resetCamera());
    }

    if (speed) {
      speed.addEventListener('change', () => this.viewerManager.setRotationSpeed(speed.value));
    }

    if (btnFullscreen && viewerWrap) {
      btnFullscreen.addEventListener('click', () => this.handleFullscreen());
      document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
    }

    if (btnUpload && fileInput) {
      btnUpload.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    if (btnShare) {
      btnShare.addEventListener('click', () => this.handleShare());
    }

    if (btnAI) {
      btnAI.addEventListener('click', () => this.handleAIAnalysis());
    }

    if (btnVR) {
      this.checkVRSupport();
      btnVR.addEventListener('click', () => this.handleVR());
    }
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      switch(e.key.toLowerCase()) {
        case 'r': this.handleRotateToggle(); break;
        case 'f': this.handleFullscreen(); break;
        case ' ': this.handleRotateToggle(); break; // Space to toggle rotation
      }
    });
  }

  handleRotateToggle() {
    const isRotating = this.viewerManager.toggleRotation();
    this.updateRotateButton(isRotating);
  }

  updateRotateButton(isRotating = this.viewerManager.rotating) {
    if (!this.elements.btnRotate) return;
    const span = this.elements.btnRotate.querySelector('span');
    if (span) span.textContent = isRotating ? 'Detener' : 'Rotar';
    this.elements.btnRotate.setAttribute('aria-pressed', String(isRotating));
  }

  async handleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await this.elements.viewerWrap.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen not supported or denied');
    }
  }

  updateFullscreenButton() {
    if (!this.elements.btnFullscreen) return;
    const isFullscreen = !!document.fullscreenElement;
    this.elements.btnFullscreen.setAttribute('aria-label', isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa');
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Security: Validate MIME type and extension
    const validTypes = ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'];
    const validExts = ['.glb', '.gltf'];
    const fileName = file.name.toLowerCase();
    
    if (!validTypes.includes(file.type) && !validExts.some(ext => fileName.endsWith(ext))) {
      alert('Formato de archivo no válido. Por favor usa .glb o .gltf');
      return;
    }

    const url = URL.createObjectURL(file);
    this.viewerManager.loadModel(url);
  }

  async handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'V3D Interactivo',
          text: 'Mira este modelo 3D increíble',
          url: window.location.href
        });
      } catch (err) {
        console.log('Error al compartir:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Enlace copiado al portapapeles');
      } catch (err) {
        console.error('No se pudo copiar el enlace');
      }
    }
  }

  async handleVR() {
    const viewer = this.viewerManager.viewer;
    if (viewer.canActivateAR) {
      viewer.activateAR();
    } else {
      alert('Tu dispositivo no soporta AR/VR en este navegador.');
    }
  }

// AI

  async handleAIAnalysis() {
    const viewer = this.viewerManager.viewer;
    const modelSrc = viewer.src;
    const modelName = modelSrc.split('/').pop() || 'modelo desconocido';

    // Simulación básica: analizar metadatos del modelo
    const analysis = await this.analyzeModelWithAI(modelName);
    alert(`Análisis IA del modelo "${modelName}":\n${analysis}`);
  }

  async analyzeModelWithAI(modelName) {
    try {
      // +3DanAI (requiere API key)
      const response = await fetch('https://api.*.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer TU_API_KEY_AQUI' // API key 
        },
        body: JSON.stringify({
          model: '3DanaI',
          messages: [{
            role: 'user',
            content: `Analiza este modelo 3D llamado "${modelName}". Describe qué tipo de objeto podría ser, sus características geométricas y posibles usos.`
          }],
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error('Error en la API de IA');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error al analizar con IA:', error);
      return 'Error al conectar con la API de IA. Verifica tu conexión y API key.';
    }
  }

  async checkVRSupport() {
    if ('xr' in navigator) {
      const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
      if (isSupported && this.elements.btnVR) {
        this.elements.btnVR.classList.add('visible');
      }
    }
  }
}