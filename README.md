# 📒 Gestor de Notas

![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue)
![Vue 3](https://img.shields.io/badge/Vue-3.5.13-green)
![Vite](https://img.shields.io/badge/Vite-6.3.5-blueviolet)
![Pinia](https://img.shields.io/badge/Pinia-3.0.2-yellow)
![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen)

---

## 🚀 Descripción

**Gestor de Notas** es una SPA construida con Vue 3 y Pinia que permite a los usuarios autenticarse, gestionar notas personales y organizarlas de forma efectiva.

### Características destacadas

- 🔑 Login funcional para demo pública
- 📝 CRUD completo de notas
- ✏️ Edición inline con doble clic
- 📅 Agrupación visual por fecha (Hoy, Ayer, Esta semana)
- 🔍 Filtro de búsqueda por contenido o título
- 🔃 Ordenamiento por campos clave
- 📄 Paginación
- 🎨 Diseño responsive
- 🚀 Despliegue automático en GitHub Pages
- 🧪 Backend mock integrado para la demo pública

---

## ⚙️ Instalación y ejecución

```bash
git clone https://github.com/dienton82/Gestor-de-Notas.git
cd Gestor-de-Notas
npm install

# API real en desarrollo local
echo VITE_API_URL=https://stg.prolibu.com/v2 > .env
echo VITE_API_MODE=real >> .env

# Opcional: usar proxy local de Vite en desarrollo
echo VITE_USE_API_PROXY=true >> .env
echo VITE_API_PROXY_TARGET=https://stg.prolibu.com >> .env

npm run dev
# Abre: http://localhost:5173

npm run build
npm run deploy
```

Producción pública: `https://dienton82.github.io/Gestor-de-Notas/`

---

## 🌍 Entornos

- Desarrollo local: puede usar la API real configurada en `VITE_API_URL`.
- Desarrollo local con proxy opcional: puedes ejecutar Vite con `VITE_USE_API_PROXY=true` para consumir la API a través de `/api` y evitar bloqueos del navegador durante desarrollo.
- Producción pública en GitHub Pages: usa un backend mock local integrado, sin depender de CORS del servidor externo.

### Variables útiles

- `VITE_API_MODE=real` para usar la API real
- `VITE_API_MODE=mock` para forzar backend mock en cualquier entorno
- `VITE_API_URL=https://stg.prolibu.com/v2`
- `VITE_USE_API_PROXY=true`
- `VITE_API_PROXY_TARGET=https://stg.prolibu.com`

---

## ⚠️ Demo pública sin CORS

La URL pública `https://dienton82.github.io/Gestor-de-Notas/` funciona con un backend mock local persistido en `localStorage`, por lo que el login y el CRUD de notas no dependen del servidor externo `https://stg.prolibu.com/v2`.

En ese caso:

- la demo pública no falla por restricciones CORS;
- el flujo de autenticación funciona dentro del navegador;
- las notas creadas o editadas en la demo persisten localmente en el dispositivo del usuario.

---

## 🗂️ Estructura del proyecto

```plaintext
Gestor-de-Notas/
├── public/
├── src/
│   ├── api/
│   ├── components/
│   ├── config/
│   ├── mocks/
│   ├── pages/
│   ├── router/
│   ├── stores/
│   ├── utils/
│   └── main.js
├── package.json
├── README.md
└── vite.config.js
```

---

## 📡 Endpoints utilizados

- `POST /auth/signin`
- `GET /note/`
- `POST /note/`
- `GET /note/{noteCode}`
- `PATCH /note/{noteCode}`
- `DELETE /note/{noteCode}`

---

## 🔑 Credenciales de prueba

```txt
Email:    test.user4@prolibu.com
Password: Prolibu2025!
```

---

## 📷 Captura

![Pantalla principal](public/gestorNotas.webp)

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.  
© 2025 [dienton82](https://github.com/dienton82)
