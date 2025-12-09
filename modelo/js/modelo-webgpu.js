export class ModeloWebGPUManager {
  static GPU_STATUS = {
    WEBGPU: 'webgpu',
    WEBGL2: 'webgl2',
    WEBGL: 'webgl',
    UNSUPPORTED: 'unsupported'
  };

  static async detectGPUCapabilities() {
    const capabilities = {
      webgpu: false,
      webgl2: false,
      webgl: false,
      adapter: null,
      device: null,
      gpuInfo: null,
      preferredFormat: null,
      status: this.GPU_STATUS.UNSUPPORTED
    };

    if ('gpu' in navigator) {
      try {
        const adapter = await navigator.gpu.requestAdapter({
          powerPreference: 'high-performance'
        });

        if (adapter) {
          capabilities.adapter = adapter;
          capabilities.webgpu = true;
          capabilities.gpuInfo = {
            vendor: adapter.info?.vendor || 'unknown',
            architecture: adapter.info?.architecture || 'unknown',
            device: adapter.info?.device || 'unknown',
            description: adapter.info?.description || 'WebGPU Compatible'
          };

          const device = await adapter.requestDevice();
          if (device) {
            capabilities.device = device;
            capabilities.preferredFormat = navigator.gpu.getPreferredCanvasFormat();
            capabilities.status = this.GPU_STATUS.WEBGPU;
          }
        }
      } catch (err) {
        console.warn('WebGPU not available:', err.message);
      }
    }

    if (!capabilities.webgpu) {
      const canvas = document.createElement('canvas');
      
      const gl2 = canvas.getContext('webgl2');
      if (gl2) {
        capabilities.webgl2 = true;
        capabilities.status = this.GPU_STATUS.WEBGL2;
        capabilities.gpuInfo = {
          vendor: gl2.getParameter(gl2.VENDOR) || 'unknown',
          renderer: gl2.getParameter(gl2.RENDERER) || 'unknown',
          version: gl2.getParameter(gl2.VERSION) || 'WebGL 2.0'
        };
      } else {
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          capabilities.webgl = true;
          capabilities.status = this.GPU_STATUS.WEBGL;
          capabilities.gpuInfo = {
            vendor: gl.getParameter(gl.VENDOR) || 'unknown',
            renderer: gl.getParameter(gl.RENDERER) || 'unknown',
            version: gl.getParameter(gl.VERSION) || 'WebGL 1.0'
          };
        }
      }
    }

    return capabilities;
  }

  static async applyOptimalSettings(viewer, capabilities) {
    if (!viewer) return;

    if (capabilities.status === this.GPU_STATUS.WEBGPU) {
      viewer.setAttribute('tone-mapping', 'aces');
      viewer.setAttribute('shadow-intensity', '1.5');
      viewer.setAttribute('shadow-softness', '1');
      viewer.setAttribute('exposure', '1.3');
    } else if (capabilities.status === this.GPU_STATUS.WEBGL2) {
      viewer.setAttribute('tone-mapping', 'neutral');
      viewer.setAttribute('shadow-intensity', '1.2');
      viewer.setAttribute('shadow-softness', '0.8');
      viewer.setAttribute('exposure', '1.2');
    } else {
      viewer.setAttribute('shadow-intensity', '0.8');
      viewer.setAttribute('shadow-softness', '0.5');
      viewer.setAttribute('exposure', '1');
    }
  }
}

export async function initializeModeloWebGPU(viewer) {
  const capabilities = await ModeloWebGPUManager.detectGPUCapabilities();
  console.info(`GPU Status: ${capabilities.status}`, capabilities.gpuInfo);
  
  await ModeloWebGPUManager.applyOptimalSettings(viewer, capabilities);
  
  return capabilities;
}
