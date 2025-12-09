# Visor 3D Interactivo


---

Proyecto: Visor 3D basado en `model-viewer`(https://modelviewer.dev/) con UI moderna, loader con progreso, controles de rotación y una página exclusiva para ver el modelo (`modelo.html` dentro de la carpeta `/modelo`). El `index.html` conserva su CSS y JS principales sin cambios; desde su barra superior se enlaza a `modelo.html`.

---

## Estructura de carpetas (actual)
- visor3d/
  - index.html
  - style.css
  - script.js
  - assets/
    - blue_miyu.glb (o tu `.glb` preferido)
  - modelo/
    - modelo.html
    - modelo.css
    - modelo.js

Notas
- No es necesario agregar `textures/*` si tu `.glb` ya incorpora (embed) las texturas o si usas un `.glb` que no requiere texturas externas.
- Si tu `.glb` referencia texturas externas y quieres usarlas, coloca la carpeta `textures/` dentro de `assets/` y asegúrate de que las rutas dentro del glTF coincidan.

---
