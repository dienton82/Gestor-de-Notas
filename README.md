# Gestor de Notas

Aplicación SPA desarrollada con Vue 3 para la gestión de notas personales. El proyecto mantiene la interfaz actual del frontend y añade una API demo mínima en Express para ofrecer una demo pública más estable, con autenticación básica, CRUD completo de notas y archivos PDF servidos como recursos estáticos reales.

## Arquitectura

- Frontend SPA con Vue 3, Vite, Pinia y Vue Router
- Backend demo con Express para autenticación, notas y adjuntos
- API externa opcional para desarrollo o integración real
- Despliegue recomendado: frontend en Vercel y backend en Render o Railway

## Demo

Demo pública actual:

`https://dienton82.github.io/Gestor-de-Notas/`

Arquitectura recomendada para demo estable:

- frontend desplegado en Vercel
- backend demo desplegado en Render o Railway

El formulario de acceso incluye credenciales precargadas para facilitar la revisión del flujo. Si se usa el backend demo, cualquier correo y contraseña no vacíos permiten entrar a la aplicación.

## Tecnologías

### Frontend

- Vue 3
- Vite
- Pinia
- Vue Router
- Axios
- CSS Modules
- lucide-vue-next

### Backend demo

- Node.js
- Express
- CORS
- Multer

## Funcionalidades

- Autenticación de usuario con soporte de entorno demo
- CRUD completo de notas
- Edición inline en escritorio
- Búsqueda por título o contenido
- Ordenamiento por fecha
- Paginación
- Agrupación por fecha: Hoy, Ayer y Esta semana
- Adjuntos PDF servidos desde backend demo
- Interfaz responsive para escritorio y móvil

## Diseño e interfaz

La UI sigue una línea visual moderna y sobria basada en escalas de grises con amarillo como color de acento. El sistema visual prioriza legibilidad, contraste y consistencia entre formularios, acciones, tarjetas y estados interactivos.

La personalización incluye:

- botones primarios, secundarios y de acción con estilo consistente
- inputs, file input y dropdowns personalizados
- eliminación de estilos nativos del navegador cuando afectaban la experiencia
- tarjetas y contenedores con jerarquía visual clara

## Ejecución local

### 1. Instalar dependencias

```bash
npm install
npm --prefix backend install
```

### 2. Ejecutar frontend y backend demo

Backend demo:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev
```

Por defecto, el frontend en producción usa el modo `demo` y en desarrollo usa el modo `real`. Si quieres trabajar localmente contra el backend demo, define `VITE_API_MODE=demo`.

### 3. Build del frontend

```bash
npm run build
```

## Variables de entorno

### Frontend

Archivo recomendado: `.env`

```bash
VITE_API_MODE=demo
VITE_API_URL=https://stg.prolibu.com/v2
VITE_DEMO_API_URL=http://localhost:4000
VITE_USE_API_PROXY=false
VITE_API_PROXY_TARGET=https://stg.prolibu.com
VITE_APP_BASE_PATH=/
```

Valores admitidos para `VITE_API_MODE`:

- `real`: usa la API externa
- `demo`: usa el backend Express
- `mock`: usa el mock local del frontend como fallback

Notas:

- para Vercel, `VITE_APP_BASE_PATH=/`
- para GitHub Pages, `VITE_APP_BASE_PATH=/Gestor-de-Notas/`
- el proxy de Vite sólo aplica cuando `VITE_API_MODE=real`

### Backend

Archivo recomendado: `backend/.env`

```bash
PORT=4000
PUBLIC_API_URL=http://localhost:4000
ALLOWED_ORIGINS=http://localhost:5173
```

`ALLOWED_ORIGINS` admite múltiples dominios separados por coma, por ejemplo:

```bash
ALLOWED_ORIGINS=http://localhost:5173,https://tu-frontend.vercel.app
```

## API demo

El backend demo expone estos endpoints:

- `POST /auth/signin`
- `GET /note/`
- `GET /note/:noteCode`
- `POST /note/`
- `PATCH /note/:noteCode`
- `DELETE /note/:noteCode`
- `GET /files/demo/brief-demo.pdf`

Características del backend demo:

- usa datos semilla definidos en JSON
- mantiene notas en memoria durante la ejecución
- guarda nuevos adjuntos en `backend/public/uploads`
- resuelve URLs de archivos con base en la URL pública del backend
- permite CORS configurable para el frontend desplegado

## Despliegue recomendado

### Frontend en Vercel

Configura:

- framework preset: `Vite`
- build command: `npm run build`
- output directory: `dist`

Variables sugeridas en Vercel:

```bash
VITE_API_MODE=demo
VITE_DEMO_API_URL=https://tu-backend-demo.onrender.com
VITE_APP_BASE_PATH=/
```

El archivo `vercel.json` incluye un rewrite a `index.html` para soportar Vue Router en modo SPA.

### Backend en Render o Railway

Usa la carpeta `backend/` como servicio Node.js.

Configuración mínima:

- install command: `npm install`
- start command: `npm start`
- root directory: `backend`

Variables sugeridas:

```bash
PUBLIC_API_URL=https://tu-backend-demo.onrender.com
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

## Estructura del proyecto

```text
Gestor-de-Notas/
├── backend/
│   ├── data/        # Datos semilla para la demo
│   ├── public/      # PDFs demo y uploads servidos por Express
│   ├── server.js    # API demo mínima
│   └── package.json
├── public/          # Assets del frontend y fallback mock
├── src/
│   ├── api/         # Cliente HTTP
│   ├── components/  # Componentes reutilizables
│   ├── config/      # Estrategia de entornos y URLs
│   ├── mocks/       # Fallback mock local del frontend
│   ├── pages/       # Vistas principales
│   ├── router/      # Rutas y guards
│   ├── stores/      # Estado global con Pinia
│   ├── utils/       # Helpers de errores, seguridad y adjuntos
│   └── main.js
├── package.json
├── README.md
├── vercel.json
└── vite.config.js
```

## Credenciales de acceso

Valores precargados en la pantalla de login:

```txt
Email:    test.user4@prolibu.com
Password: Prolibu2025!
```

En el backend demo se permite cualquier correo y contraseña no vacíos.

## Licencia

Este proyecto está bajo la licencia MIT.  
© 2025 [dienton82](https://github.com/dienton82)
