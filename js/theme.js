import { CONFIG } from './config.js';

export class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
  }

  loadTheme() {
    const saved = localStorage.getItem(CONFIG.storage.themeKey);
    if (saved) return saved;
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    return 'dark';
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(CONFIG.storage.themeKey, theme);
    this.currentTheme = theme;
  }

  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }
}

export function initializeTheme(btnTheme) {
  const themeManager = new ThemeManager();
  
  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      themeManager.toggle();
    });
  }
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const newTheme = e.matches ? 'dark' : 'light';
    themeManager.applyTheme(newTheme);
  });
  
  return themeManager;
}