# 📒 Gestor de Notas

![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue) ![Vue 3](https://img.shields.io/badge/Vue-3.5.13-green) ![Vite](https://img.shields.io/badge/Vite-6.3.5-blueviolet) ![Pinia](https://img.shields.io/badge/Pinia-3.0.2-yellow) ![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen)

---

## 🚀 Descripción

**Gestor de Notas** es una aplicación de escritorio (SPA) para gestionar notas personales:

* 🔑 Autenticación con JWT.
* 📋 CRUD de notas (listar, crear, editar, eliminar).
* ✏️ Edición **inline** con doble clic.
* 📎 Adjuntos (archivos) opcionales.

Construida con **Vue 3 (Composition API)**, **Pinia** para estado global, **Vite** como bundler y **CSS Modules** para estilos encapsulados.

---

## ⚙️ Instalación y ejecución

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/dienton82/Gestor-de-Notas.git
   cd Gestor-de-Notas
   ```
2. **Instalar dependencias**

   ```bash
   npm install
   ```
3. **Configurar variables de entorno** (opcional)

   * Crea un archivo `.env` en la raíz:

     ```ini
     VITE_API_URL=https://stg.prolibu.com/v2
     ```
4. **Modo desarrollo**

   ```bash
   npm run dev
   ```

   Abre tu navegador en **[http://localhost:5173](http://localhost:5173)**
5. **Generar build**

   ```bash
   npm run build
   ```
6. **Desplegar en GitHub Pages**

   ```bash
   npm run deploy
   ```

   ↪️ La aplicación quedará disponible en:
   `https://dienton82.github.io/Gestor-de-Notas/`

---

## 🗂️ Estructura de carpetas

```plaintext
Gestor-de-Notas/
├── public/               # Archivos estáticos (index.html, favicon...)
├── src/                  # Código fuente
│   ├── api/              # Cliente Axios y configuración de rutas a la API
│   ├── assets/           # Imágenes y estilos globales
│   ├── components/       # Componentes reutilizables (NoteCard, Spinner, MainLayout)
│   ├── pages/            # Vistas de la aplicación (Login, NotesList, NoteForm, NoteDetail)
│   ├── router/           # Configuración de rutas (vue-router)
│   ├── stores/           # Pinia stores (auth, notes)
│   ├── index.css         # CSS global y directivas Tailwind (si aplica)
│   └── main.js           # Entry point de la aplicación
├── .gitignore            # Ignora node_modules, dist, etc.
├── package.json          # Scripts, dependencias y metadata del proyecto
├── tailwind.config.js    # Configuración de TailwindCSS
├── postcss.config.cjs    # Configuración de PostCSS (plugins)
├── vite.config.js        # Configuración de Vite (base, plugins)
└── README.md             # Este archivo
```

---

## 📡 Endpoints usados

* **POST** `/auth/signin`  — Iniciar sesión (devuelve JWT)
* **GET**  `/note/`         — Listar notas (paginación)
* **POST** `/note/`         — Crear nota
* **GET**  `/note/{noteCode}` — Detalle de nota
* **PATCH** `/note/{noteCode}` — Actualizar nota
* **DELETE** `/note/{noteCode}` — Eliminar nota

---

## 🔑 Credenciales de prueba

* **Email:** `test.user4@prolibu.com`
* **Password:** `Prolibu2025!`

---

## ✨ Plus implementados

* ✅ Spinner de carga y toasts de notificación
* ✅ Edición inline con doble clic
* ✅ CSS Modules con diseño **responsive**
* ✅ Despliegue automático en GitHub Pages

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.
© 2025 [dienton82](https://github.com/dienton82)

---

> ¡Gracias por probar el Gestor de Notas!
> Para dudas o sugerencias, abre un *issue* en el repositorio.
