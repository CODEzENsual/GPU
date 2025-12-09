document.addEventListener('DOMContentLoaded', async () => {
  const viewer = document.getElementById('viewer');
  const infoPanel = document.querySelector('#modelControlsContainer');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const loader = document.getElementById('loader');

  const container = document.createElement('div');
  container.className = 'model-controls';
  const select = document.createElement('select');
  select.id = 'modelList';
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.glb';
  fileInput.id = 'fileInput';
  container.appendChild(select);
  container.appendChild(fileInput);
  if (infoPanel) infoPanel.appendChild(container);

  async function fetchManifest() {
    try {
      const res = await fetch('modelo/assets/models.json', {cache: 'no-cache'});
      if (!res.ok) return null;
      const data = await res.json();
      if (!Array.isArray(data)) return null;
      return data;
    } catch {
      return null;
    }
  }

  function showLoader() {
    if (loader) loader.style.display = '';
    if (progressBar) progressBar.style.width = '0%';
    if (progressText) progressText.textContent = 'Cargando modelo...';
  }

  function hideLoader() {
    if (loader) loader.style.display = 'none';
    if (progressText) progressText.textContent = '';
  }

  function updateProgress(value) {
    const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
    if (progressBar) progressBar.style.width = pct + '%';
    if (progressText) progressText.textContent = 'Cargando ' + pct + '%';
  }

  function loadFromURL(url) {
    if (!viewer) return;
    showLoader();
    viewer.src = url;
  }

  const manifest = await fetchManifest();
  if (manifest && manifest.length) {
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Selecciona un modelo';
    select.appendChild(defaultOpt);
    manifest.forEach(name => {
      if (typeof name !== 'string') return;
      const opt = document.createElement('option');
      opt.value = 'modelo/assets/' + name;
      opt.textContent = name;
      select.appendChild(opt);
    });
    select.addEventListener('change', (e) => {
      const v = e.target.value;
      if (v) loadFromURL(v);
    });
  } else {
    select.style.display = 'none';
  }

  fileInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const objectURL = URL.createObjectURL(f);
    loadFromURL(objectURL);
    viewer.addEventListener('load', function onLoad() {
      URL.revokeObjectURL(objectURL);
      viewer.removeEventListener('load', onLoad);
    });
  });

  viewer.addEventListener('progress', (e) => {
    const p = e && e.detail && (e.detail.totalProgress ?? e.detail.progress) ?? 0;
    updateProgress(p);
  });

  viewer.addEventListener('load', () => {
    setTimeout(hideLoader, 300);
  });
});