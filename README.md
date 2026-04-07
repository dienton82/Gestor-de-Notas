# Gestor de Notas

Aplicación SPA desarrollada con Vue 3 para la gestión de notas personales. El proyecto incluye autenticación con soporte de modo demo, CRUD completo de notas, consumo de API externa, manejo de estado con Pinia y navegación con Vue Router. La interfaz utiliza una línea visual moderna basada en escalas de grises con acentos amarillos y un sistema de estilos personalizado.

## Demo

Aplicación desplegada en:

`https://dienton82.github.io/Gestor-de-Notas/`

En el entorno público, el formulario de acceso incluye credenciales precargadas y puede continuar en modo demo cuando la API externa no está disponible desde el navegador.

## Tecnologías

- Vue 3
- Vite
- Pinia
- Vue Router
- Axios
- CSS Modules

## Funcionalidades

- Autenticación de usuario con soporte de modo demo
- CRUD completo de notas
- Edición inline mediante doble clic
- Búsqueda por contenido o identificador
- Ordenamiento por campos clave
- Paginación
- Agrupación por fecha: Hoy, Ayer y Esta semana
- Interfaz responsive para escritorio y móvil

## Diseño e interfaz

La interfaz sigue una línea visual basada en grises neutros y un amarillo sobrio como color de acento. El objetivo es mantener una UI moderna, clara y consistente, con mejor jerarquía visual y contraste entre acciones, contenido y estados.

Se definió un sistema visual personalizado para:

- botones principales, secundarios y de acción
- inputs y estados de foco
- dropdowns y controles personalizados
- tarjetas de notas y contenedores principales
- eliminación de estilos nativos del navegador en select e input file

## Ejecución

### Instalación

```bash
git clone https://github.com/dienton82/Gestor-de-Notas.git
cd Gestor-de-Notas
npm install
```

### Desarrollo

Para trabajar contra la API real en entorno local:

```bash
echo VITE_API_URL=https://stg.prolibu.com/v2 > .env
echo VITE_API_MODE=real >> .env
npm run dev
```

Opcionalmente, puede habilitarse un proxy local de Vite para evitar bloqueos del navegador durante desarrollo:

```bash
echo VITE_USE_API_PROXY=true >> .env
echo VITE_API_PROXY_TARGET=https://stg.prolibu.com >> .env
```

### Build de producción

```bash
npm run build
```

### Deploy

```bash
npm run deploy
```

## API y modo demo

La aplicación puede consumir la API externa configurada en:

`https://stg.prolibu.com/v2`

En desarrollo local, el proyecto puede trabajar con esa API mediante `VITE_API_URL` y, si se desea, con proxy local de Vite.

En producción pública, especialmente en GitHub Pages, el consumo directo de la API externa puede verse afectado por restricciones CORS del servidor remoto. Para mantener la experiencia operativa, la aplicación utiliza un backend mock local y puede continuar en modo demo sin romper el flujo de autenticación ni el CRUD visual.

Esto implica lo siguiente:

- en local puede usarse la API real
- en entorno público puede activarse el flujo demo
- las notas generadas en la demo se almacenan localmente en el navegador

### Variables de entorno útiles

- `VITE_API_MODE=real` para usar la API real
- `VITE_API_MODE=mock` para forzar el backend mock
- `VITE_API_URL=https://stg.prolibu.com/v2`
- `VITE_USE_API_PROXY=true`
- `VITE_API_PROXY_TARGET=https://stg.prolibu.com`

## Endpoints utilizados

- `POST /auth/signin`
- `GET /note/`
- `POST /note/`
- `GET /note/{noteCode}`
- `PATCH /note/{noteCode}`
- `DELETE /note/{noteCode}`

## Credenciales de acceso

Para la demo pública, el login incluye estos valores precargados:

```txt
Email:    test.user4@prolibu.com
Password: Prolibu2025!
```

El usuario puede modificarlos manualmente antes de iniciar sesión.

## Estructura del proyecto

```text
Gestor-de-Notas/
├── public/
├── src/
│   ├── api/         # Cliente HTTP y configuración de consumo
│   ├── components/  # Componentes reutilizables de interfaz
│   ├── config/      # Configuración de entorno y comportamiento por modo
│   ├── mocks/       # Backend mock y datos para demo pública
│   ├── pages/       # Vistas principales de la aplicación
│   ├── router/      # Definición de rutas y guards
│   ├── stores/      # Estado global con Pinia
│   ├── utils/       # Helpers de errores, seguridad y soporte UI
│   └── main.js
├── package.json
├── README.md
└── vite.config.js
```

## Captura

![Pantalla principal](public/gestorNotas.webp)

## Licencia

Este proyecto está bajo la licencia MIT.  
© 2025 [dienton82](https://github.com/dienton82)
