# 💇 Peluquería Web3 - Frontend

Sistema de gestión de peluquería con React + TypeScript + Vite.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
pnpm dev
```

## 📁 Estructura del Proyecto

```
src/
├── api/                # Capa de comunicación con la API
│   ├── authApi.ts      # Autenticación
│   ├── servicesApi.ts  # Servicios de peluquería
│   ├── appointmentsApi.ts # Citas
│   └── stylistsApi.ts  # Estilistas
├── components/         # Componentes de UI
├── config/             # Configuración centralizada
├── lib/                # Utilidades y cliente HTTP
├── pages/              # Páginas de la aplicación
├── routes/             # Rutas y protección
├── store/              # Estado global (Zustand)
├── types/              # Tipos TypeScript
└── utility/            # Schemas y helpers
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# .env.local
VITE_API_URL=https://localhost:7001/api
VITE_API_TIMEOUT=10000
```

## 📖 Documentación de la API

La documentación completa para construir la API backend está en la carpeta `/docs`:

- [README](./docs/README.md) - Índice de documentación
- [Arquitectura](./docs/01-ARCHITECTURE.md) - Estructura del proyecto
- [Configuración](./docs/02-PROJECT-SETUP.md) - Setup inicial
- [Modelos](./docs/03-MODELS.md) - Entidades y DTOs
- [Endpoints](./docs/04-ENDPOINTS.md) - Rutas de la API
- [Autenticación](./docs/05-AUTH.md) - JWT y seguridad
- [Base de Datos](./docs/06-DATABASE.md) - PostgreSQL/Supabase
- [Despliegue](./docs/07-DEPLOYMENT.md) - Producción
- [Migración](./docs/MIGRATION.md) - Guía de migración

## 🛠️ Stack Tecnológico

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS 4** - Estilos
- **Zustand** - Estado global
- **React Router 7** - Navegación
- **React Hook Form + Zod** - Formularios y validación

## 📜 Scripts

```bash
pnpm dev      # Desarrollo
pnpm build    # Build producción
pnpm preview  # Preview build
pnpm lint     # Linting
```

## 🎯 Principios de Diseño

- **SOLID** - Responsabilidad única, código extensible
- **YAGNI** - Solo lo necesario
- **KISS** - Simplicidad
- **DRY** - Sin repetición

---

## Notas de Desarrollo (Original)

### React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
