# 🧴 PeluqueriaWeb3TS

Sistema web moderno para gestión de peluquería construido con React, TypeScript, Vite y Tailwind CSS.

## 🚀 Características

- **Autenticación completa** con Zustand + React Hook Form + Zod
- **Rutas protegidas** que redirigen automáticamente al login
- **Diseño responsivo** con Tailwind CSS v4
- **CSS globales** con directivas de alineación y layout
- **TypeScript strict** para máxima seguridad de tipos
- **HMR (Hot Module Reload)** en desarrollo

## 📋 Stack Tecnológico

- **Frontend:** React 19 + TypeScript
- **Build:** Vite
- **Estilos:** Tailwind CSS v4 + directivas globales
- **Estado:** Zustand
- **Formularios:** React Hook Form + Zod
- **Enrutamiento:** React Router v7
- **Package Manager:** pnpm

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   ├── SignIn.tsx          # Componente de login
│   ├── SignUp.tsx          # Componente de registro
│   └── ui/                 # Componentes UI reutilizables
├── pages/
│   └── Dashboard.tsx       # Panel principal autenticado
├── store/
│   └── authStore.ts        # Zustand store de autenticación
├── routes/
│   ├── routes.tsx          # Configuración de rutas
│   ├── protectedRoute.tsx  # HOC para rutas protegidas
│   └── protectedRoute.ts   # Re-exportación
├── utility/
│   └── schemas/
│       └── auth.ts         # Schemas Zod para validación
├── styles/
│   └── globals.css         # Clases CSS globales
├── App.tsx                 # Componente raíz
├── main.tsx                # Entry point
└── index.css               # Estilos base Tailwind
```

## 🔐 Sistema de Autenticación

### Cómo Funciona

1. **Usuario inicia sesión** en `/auth/signin`
2. `SignIn` valida datos con Zod y llama a `authStore.login()`
3. Store realiza petición a `/api/auth/login`
4. Si es exitosa, guarda token en `localStorage` y user en el store
5. ProtectedRoute verifica `token` y `user`, redirige si falta
6. Usuario accede a `/dashboard`

### Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `src/store/authStore.ts` | Zustand store con lógica auth |
| `src/routes/protectedRoute.tsx` | HOC que valida autenticación |
| `src/utility/schemas/auth.ts` | Validaciones Zod |
| `src/components/SignIn.tsx` | Formulario login |
| `src/components/SignUp.tsx` | Formulario registro |

### Flujo de Hidratación

```
App.tsx monta
  ↓
useEffect llama authStore.hydrate()
  ↓
hydrate() lee token de localStorage
  ↓
Intenta obtener user desde /api/auth/me
  ↓
Si OK: setUser() + setToken()
Si Fail: limpia token de localStorage
  ↓
Marca initialized: true
  ↓
ProtectedRoute deja pasar o redirige
```

## 🎨 CSS Globales

Se han definido utilidades globales en `src/styles/globals.css` para acelerar desarrollo:

### Alineación
- `.flex-center` - Centro vertical y horizontal (flex)
- `.screen-center` - Full screen centrado (para login, 404)
- `.grid-center` - Grid con items centrados
- `.container-centered` - Max-width container con padding

### Componentes
- `.card-base` - Card sin padding
- `.card-padded` - Card con padding p-6
- `.card-padded hover-elevated` - Card con hover effect

### Tipografía
- `.heading-1`, `.heading-2`, `.heading-3`, `.heading-4`
- `.text-muted` - Texto secundario
- `.text-small` - Texto pequeño
- `.text-error` - Texto de error

### Layout
- `.stack-v` - Flex vertical con gap-4
- `.stack-h` - Flex horizontal con gap-4
- `.stack-tight` - Flex vertical con gap-2

### Animaciones
- `.animate-fade-in` - Desvanecimiento suave
- `.animate-slide-in-up` - Deslizar desde abajo
- `.animate-slide-in-down` - Deslizar desde arriba

**Ejemplo de uso:**
```tsx
<div className="screen-center bg-background">
  <Card className="w-full max-w-sm card-padded">
    <h1 className="heading-2">Iniciar Sesión</h1>
  </Card>
</div>
```

## 🚀 Quick Start

### 1. Instalación
```bash
pnpm install
```

### 2. Desarrollo
```bash
pnpm dev
```

Abre http://localhost:5173

### 3. Build
```bash
pnpm build
```

### 4. Preview
```bash
pnpm preview
```

## 📝 Variables de Entorno

Crea `.env.local`:
```
VITE_API_URL=http://localhost:3000/api
```

## 🔄 Endpoints Necesarios en Backend

El store espera estos endpoints:

### POST `/api/auth/login`
**Request:**
```json
{ "email": "user@example.com", "password": "password123" }
```

**Response:**
```json
{
  "token": "jwt_token_aqui",
  "user": { "id": "1", "email": "user@example.com", "name": "Juan" }
}
```

### POST `/api/auth/signup`
**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_aqui",
  "user": { "id": "1", "email": "juan@example.com", "name": "Juan Pérez" }
}
```

### GET `/api/auth/me`
**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "user": { "id": "1", "email": "user@example.com", "name": "Juan" }
}
```

## 🛠️ Desarrollo

### Agregar una nueva página protegida

1. Crea componente en `src/pages/NuevaPage.tsx`
2. Agrega ruta en `src/routes/routes.tsx`:
```tsx
{
  path: '/nueva-pagina',
  element: (
    <ProtectedRoute>
      <NuevaPage />
    </ProtectedRoute>
  ),
}
```
3. Listo, ya está protegida

### Agregar una nueva utilidad CSS

1. Edita `src/styles/globals.css`
2. Agrega bajo `@layer components {}`
3. Se aplica automáticamente globalmente

## 📦 Dependencias Principales

```json
{
  "react": "^19.0.0",
  "react-router-dom": "^7.0.0",
  "zustand": "^5.0.0",
  "react-hook-form": "^7.0.0",
  "@hookform/resolvers": "^3.0.0",
  "zod": "^3.0.0",
  "tailwindcss": "^4.0.0"
}
```

## 🐛 Troubleshooting

### Error: "No se encuentra el módulo @/..."
- Verifica que la ruta sea relativa correcta
- Asegúrate que TypeScript reconoce los paths en `tsconfig.json`

### Error: "Usuario no autenticado"
- El token puede estar expirado
- Limpia localStorage y vuelve a login
- Verifica que `/api/auth/me` está respondiendo correctamente

### Página en blanco después de login
- Abre DevTools y revisa la consola
- Verifica que `routes.tsx` tiene ruta para `/dashboard`
- Confirma que `ProtectedRoute` renderiza correctamente

## 📚 Más Información

- [React Router Docs](https://reactrouter.com/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Última actualización:** 25 de noviembre de 2025
