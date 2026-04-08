# Gestor de Notas

Aplicacion SPA de gestion de notas personales construida con Vue 3, Vite y Pinia. Incluye backend demo en Express con autenticacion, CRUD completo y adjuntos PDF persistidos en Cloudinary.

**Demo publica:** [https://gestor-notas-topaz.vercel.app](https://gestor-notas-topaz.vercel.app)

---

## Arquitectura

| Capa | Tecnologia | Hosting |
|------|-----------|---------|
| Frontend SPA | Vue 3 + Vite + Pinia + Vue Router | Vercel |
| Backend API | Express + Multer | Render |
| Storage de archivos | Cloudinary (raw/upload, preset unsigned) | Cloudinary |

El frontend se comunica con el backend via REST. Los PDFs adjuntos se suben desde el backend a Cloudinary y se almacenan como recursos `raw`. La URL publica resultante se guarda en la nota y se sirve directamente al navegador.

---

## Stack tecnico

### Frontend

- Vue 3 (Composition API + Options API)
- Vite
- Pinia (state management)
- Vue Router (SPA con history mode)
- Axios
- CSS Modules
- lucide-vue-next (iconografia)

### Backend

- Node.js 18+
- Express 4
- Multer (upload en memoria)
- Cloudinary API (raw upload via data URI base64)
- CORS configurable

---

## Funcionalidades

- Autenticacion demo (cualquier correo y contrasena no vacios)
- Creacion, lectura, edicion y eliminacion de notas
- Edicion inline con doble clic en escritorio
- Busqueda por titulo o contenido
- Ordenamiento por fecha
- Paginacion
- Agrupacion temporal: Hoy, Ayer, Esta semana
- Adjuntos PDF con persistencia real en Cloudinary
- Visualizacion directa de PDF en el navegador (sin descarga)
- Interfaz responsive para escritorio y movil

---

## Ejecucion local

### 1. Instalar dependencias

```bash
npm install
npm --prefix backend install
```

### 2. Ejecutar

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev
```

### 3. Build de produccion

```bash
npm run build
```

---

## Variables de entorno

### Frontend (.env)

```bash
VITE_API_MODE=demo
VITE_DEMO_API_URL=http://localhost:4000
VITE_APP_BASE_PATH=/
```

Valores de `VITE_API_MODE`:

| Valor | Comportamiento |
|-------|---------------|
| `demo` | Usa el backend Express (produccion y desarrollo) |
| `real` | Usa API externa configurable |
| `mock` | Usa mock local del frontend |

### Backend (backend/.env)

```bash
PORT=4000
PUBLIC_API_URL=http://localhost:4000
ALLOWED_ORIGINS=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_UNSIGNED_UPLOAD_PRESET=
CLOUDINARY_UPLOAD_FOLDER=gestor-notas-demo
```

| Variable | Descripcion |
|----------|------------|
| `PORT` | Puerto del servidor Express |
| `PUBLIC_API_URL` | URL publica del backend (para construir URLs de archivos) |
| `ALLOWED_ORIGINS` | Dominios permitidos por CORS, separados por coma |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_UNSIGNED_UPLOAD_PRESET` | Preset unsigned para subida de PDFs |
| `CLOUDINARY_UPLOAD_FOLDER` | Carpeta logica en Cloudinary para organizar uploads |

Si las variables de Cloudinary no estan definidas, el backend usa un fallback local (no persistente entre reinicios).

---

## Despliegue

### Frontend en Vercel

| Campo | Valor |
|-------|-------|
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

Variables en Vercel:

```bash
VITE_API_MODE=demo
VITE_DEMO_API_URL=https://gestor-de-notas-8h9n.onrender.com
VITE_APP_BASE_PATH=/
```

### Backend en Render

| Campo | Valor |
|-------|-------|
| Root directory | `backend` |
| Build command | `npm install` |
| Start command | `npm start` |

Variables en Render:

```bash
PORT=4000
PUBLIC_API_URL=https://gestor-de-notas-8h9n.onrender.com
ALLOWED_ORIGINS=https://gestor-notas-topaz.vercel.app
CLOUDINARY_CLOUD_NAME=dneam8g56
CLOUDINARY_UNSIGNED_UPLOAD_PRESET=gestor-notas-demo-pdf
CLOUDINARY_UPLOAD_FOLDER=gestor-notas-demo
```

### Configuracion requerida en Cloudinary

Para que los PDFs se visualicen correctamente:

1. Crear un **Upload Preset** con modo **Unsigned** y delivery type **Upload** (no Authenticated)
2. En **Settings > Security**, activar **"Allow delivery of PDF and ZIP files"**
3. Verificar que **Strict transformations** este deshabilitado

---

## API demo

| Metodo | Endpoint | Descripcion |
|--------|----------|------------|
| POST | `/auth/signin` | Login (cualquier credencial no vacia) |
| GET | `/note/` | Listar notas |
| GET | `/note/:noteCode` | Obtener nota individual |
| POST | `/note/` | Crear nota (soporta FormData con adjunto) |
| PATCH | `/note/:noteCode` | Actualizar nota |
| DELETE | `/note/:noteCode` | Eliminar nota |
| GET | `/health` | Health check |

---

## Estructura del proyecto

```
gestor-notas/
  backend/
    data/          Datos semilla y runtime
    public/        PDFs demo estaticos
    server.js      API Express
    package.json
  src/
    api/           Cliente HTTP (Axios)
    components/    Componentes reutilizables
    config/        Configuracion de entornos y URLs
    layouts/       Layouts de autenticacion y principal
    mocks/         Fallback mock local
    pages/         Vistas principales
    router/        Rutas y guards de navegacion
    stores/        Estado global (Pinia)
    utils/         Helpers de seguridad, errores y adjuntos
    main.js        Entry point
  vercel.json      Rewrite para SPA
  vite.config.js   Configuracion de Vite
```

---

## Credenciales de acceso

Valores precargados en la pantalla de login:

```
Email:    test.user4@prolibu.com
Password: Prolibu2025!
```

En el backend demo se permite cualquier correo y contrasena no vacios.

---

## Licencia

MIT -- [dienton82](https://github.com/dienton82)
