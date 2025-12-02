# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.1.0] - 2025-11-25

### ✨ Agregado - Arquitectura Desacoplada de Autenticación

#### Servicios Desacoplados
- ✅ `authService.ts` - Lógica pura de autenticación (sin dependencia de API)
- ✅ `credentialValidator.ts` - Validador configurable (conecta a cualquier fuente)
- ✅ Inyección de dependencias en `authStore.ts`

#### Scripts de Configuración
- ✅ `setup-api.ps1` - Script PowerShell para Windows
- ✅ `setup-api.sh` - Script Bash para macOS/Linux
- ✅ `.env.local.example` - Ejemplo de configuración

#### Documentación
- ✅ `ARCHITECTURE.md` - Guía completa de la arquitectura
- ✅ Ejemplos de testing
- ✅ Troubleshooting guide

#### Configuración
- ✅ Script `pnpm db` - Levanta JSON Server en puerto 3001
- ✅ Variable de entorno `VITE_API_URL` configurable
- ✅ Fallback automático a `http://localhost:3001`

### 🔄 Cambios

#### authStore.ts
- Ahora usa `authService` y `credentialValidator`
- Lee `VITE_API_URL` de `.env.local`
- Permite cambiar fuente de datos sin modificar código

#### Flujo de Login
```
SignIn → authStore.login() → authService.login() → credentialValidator → API
```

### 🎯 Ventajas

✅ **Testeable** - Cada capa se puede testear por separado
✅ **Flexible** - Cambiar de API sin tocar lógica
✅ **Reutilizable** - authService es independiente
✅ **Configurable** - puerto/URL desde scripts o `.env.local`

### 📦 Nuevas Dependencias

Ninguna nueva (ya estaban: `zustand`, `react-hook-form`, `zod`)

---

## [1.0.0] - 2025-11-25

### ✨ Agregado

#### Sistema de Autenticación Completo
- ✅ Zustand store (`authStore.ts`) con gestión de estado auth
- ✅ Componente `SignIn` con validación Zod y React Hook Form
- ✅ Componente `SignUp` con validación de contraseñas
- ✅ Rutas protegidas con `ProtectedRoute` HOC
- ✅ Hidratación automática de sesión en app mount
- ✅ Persistencia de token en localStorage

#### Esquemas de Validación
- ✅ `LoginSchema` - Validación para login
- ✅ `SignUpSchema` - Validación para registro con confirmación de contraseña
- ✅ Tipos TypeScript exportados desde esquemas

#### Rutas y Navegación
- ✅ `/auth/signin` - Página de login
- ✅ `/auth/signup` - Página de registro
- ✅ `/dashboard` - Panel protegido
- ✅ Redirección automática `/` → `/auth/signin`
- ✅ Redirección a `/auth/signin` cuando intenta acceder a ruta protegida sin autenticación

#### CSS Globales y Directivas Tailwind
- ✅ `.flex-center` - Centro vertical y horizontal
- ✅ `.screen-center` - Full screen centrado (perfect para login)
- ✅ `.grid-center` - Grid centrado
- ✅ `.container-centered` - Max-width container
- ✅ `.card-base` y `.card-padded` - Componentes card
- ✅ `.heading-1`, `.heading-2`, `.heading-3`, `.heading-4` - Tipografía
- ✅ `.text-muted` y `.text-small` - Textos secundarios
- ✅ `.stack-v`, `.stack-h`, `.stack-tight` - Layouts flex
- ✅ `.hover-elevated` - Efecto hover con sombra
- ✅ Animaciones: `.animate-fade-in`, `.animate-slide-in-up`, `.animate-slide-in-down`

#### Componentes UI Mejorados
- ✅ `SignIn` centrado en pantalla con `.screen-center`
- ✅ `SignUp` centrado en pantalla con `.screen-center`
- ✅ `Dashboard` con navbar, layout de grid y cards interactivas

#### Documentación
- ✅ README.md con guía completa del proyecto
- ✅ CHANGELOG.md para tracking de cambios
- ✅ Documentación de endpoints necesarios en backend

### 🔧 Configuración

- ✅ TypeScript con `verbatimModuleSyntax` habilitado
- ✅ Paths resueltos con `@/` alias
- ✅ ESLint configurado
- ✅ Vite con React plugin

### 📦 Dependencias Instaladas

```
react-hook-form ^7.51.0
@hookform/resolvers ^3.3.4
zustand ^5.0.0
```

### 🏗️ Estructura de Carpetas

```
src/
├── components/
│   ├── SignIn.tsx
│   ├── SignUp.tsx
│   └── ui/
├── pages/
│   └── Dashboard.tsx
├── store/
│   └── authStore.ts
├── routes/
│   ├── routes.tsx
│   ├── protectedRoute.tsx
│   └── protectedRoute.ts
├── utility/
│   └── schemas/
│       └── auth.ts
├── styles/
│   └── globals.css
├── App.tsx
├── main.tsx
└── index.css
```

### 📝 Notas

- El sistema de autenticación está listo pero requiere endpoints en el backend
- Las peticiones actualmente van a `/api/auth/login`, `/api/auth/signup` y `/api/auth/me`
- El token se persiste en `localStorage` bajo la clave `authToken`
- La validación ocurre en el cliente con Zod antes de enviar
- TypeScript está en modo strict para máxima seguridad

---

## Próximos Pasos (Roadmap)

- [ ] Integración con backend real
- [ ] Recuperación de contraseña
- [ ] Autenticación OAuth (Google, GitHub)
- [ ] Refresh tokens
- [ ] Tests unitarios y e2e
- [ ] Componentes de perfil de usuario
- [ ] Sistema de citas
- [ ] Panel administrativo
