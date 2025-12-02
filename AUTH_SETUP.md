# 🔐 Sistema de Autenticación - PeluqueriaWeb3TS

## Resumen de Implementación

Se ha implementado un sistema completo de autenticación con las siguientes características:

### ✅ Componentes Implementados

#### 1. **Store de Autenticación** (`src/store/authStore.ts`)
- Gestión de estado con **Zustand**
- Métodos: `login()`, `signup()`, `logout()`, `hydrate()`
- Persistencia automática en `localStorage` con clave `authToken`
- Estados: `user`, `token`, `isLoading`, `error`, `initialized`

#### 2. **Rutas Protegidas** (`src/routes/protectedRoute.tsx`)
- Componente `ProtectedRoute` que envuelve rutas privadas
- Redirige automáticamente a `/auth/signin` si no hay token/usuario
- Espera a que el estado se inicialice (`initialized` flag) antes de redirigir
- Evita "flash" de redirección no deseada

#### 3. **Sistema de Rutas** (`src/routes/routes.tsx`)
```
/               → Redirige a /auth/signin
/auth/signin    → SignIn (público)
/auth/signup    → SignUp (público)
/dashboard      → Dashboard (PROTEGIDO)
*               → Redirige a /auth/signin
```

#### 4. **Validación con Zod** (`src/utility/schemas/auth.ts`)
- `LoginSchema`: email (válido) + password (min 6 caracteres)
- `SignUpSchema`: name + email + password + confirmPassword (coincidentes)
- Tipos TypeScript automáticos con `z.infer<typeof Schema>`

#### 5. **Formularios con React Hook Form**
- **SignIn** (`src/components/SignIn.tsx`)
  - Validación en tiempo real
  - Manejo de errores con Zod
  - Integración con `useAuthStore`
  - Redirección a dashboard tras login exitoso
  
- **SignUp** (`src/components/SignUp.tsx`)
  - Validación de contraseñas coincidentes
  - Confirmación de email válido
  - Redirección a dashboard tras signup exitoso

#### 6. **Inicialización en App** (`src/App.tsx`)
```typescript
useEffect(() => {
  hydrate(); // Recuperar token de localStorage al cargar
}, [hydrate]);
```

---

## 🔄 Flujo de Autenticación

### Primer acceso (sin token)
```
1. Usuario accede a /
2. Se redirige a /auth/signin
3. Completa el formulario
4. Llamada a POST /api/auth/login
5. Store recibe token y user
6. Token se guarda en localStorage
7. Redirección a /dashboard
```

### Recarga de página (con token en localStorage)
```
1. App monta y ejecuta hydrate()
2. Se obtiene token de localStorage
3. Se hace fetch a /api/auth/me (opcional)
4. Estado se marca como initialized
5. ProtectedRoute permite acceso al dashboard
```

### Logout
```
1. Usuario hace click en logout
2. Store ejecuta logout()
3. Se limpia localStorage y estado
4. Se redirige a /auth/signin
```

---

## 🛠️ Configuración de Endpoints API

El store intenta conectar a los siguientes endpoints (**reemplaza con tu servidor real**):

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}

// Respuesta esperada
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  },
  "token": "jwt_token_aqui"
}
```

### Signup
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}

// Respuesta esperada
{
  "user": { ... },
  "token": "jwt_token_aqui"
}
```

### Get Current User (opcional en hydrate)
```
GET /api/auth/me
Authorization: Bearer {token}

// Respuesta esperada
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

---

## 📦 Dependencias Utilizadas

```json
{
  "react-hook-form": "^7.66.1",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.1.12",
  "zustand": "^5.0.8",
  "react-router-dom": "^7.9.6",
  "react": "^19.2.0",
  "tailwindcss": "^4.1.17"
}
```

---

## 🚀 Próximos Pasos Recomendados

### 1. **Conectar Backend Real**
- Reemplaza las URLs hardcodeadas en `authStore.ts`
- Implementa tu API de autenticación

### 2. **Agregar Interceptor HTTP**
Crea un cliente HTTP centralizado que añada el token automáticamente:

```typescript
// src/lib/apiClient.ts
export const apiClient = async (url: string, options = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  
  return fetch(url, { ...options, headers });
};
```

### 3. **Refresh Token (si es necesario)**
Agregar lógica de renovación automática de tokens en `hydrate()` o interceptor

### 4. **Recuperación de Contraseña**
- Nueva ruta `/auth/forgot-password`
- Esquema y formulario correspondiente

### 5. **MFA / 2FA** (futuro)
- TOTP o SMS verification
- Adicional al login/signup

### 6. **Tests**
- Unit tests en `__tests__/authStore.test.ts`
- Tests e2e con Playwright

---

## 📋 Checklist de Prueba

- [ ] Acceder a `/` redirige a `/auth/signin`
- [ ] Formulario SignIn valida email y contraseña
- [ ] Login exitoso guarda token en localStorage
- [ ] Dashboard solo accesible con token válido
- [ ] Recarga de página mantiene sesión activa
- [ ] Logout limpia token y redirige a signin
- [ ] SignUp crea nueva cuenta
- [ ] Mensajes de error muestran correctamente
- [ ] Estados de carga (loading) funcionan
- [ ] Rutas inválidas redirigen a signin

---

## 🔍 Estructura de Archivos

```
src/
├── store/
│   └── authStore.ts           # Zustand store de autenticación
├── routes/
│   ├── protectedRoute.tsx      # Componente de rutas protegidas
│   └── routes.tsx              # Definición de rutas
├── components/
│   ├── SignIn.tsx              # Componente de login
│   ├── SignUp.tsx              # Componente de registro
│   └── ui/                     # Componentes reutilizables
├── utility/schemas/
│   └── auth.ts                 # Esquemas Zod
├── pages/
│   └── Dashboard.tsx           # Página protegida
├── App.tsx                     # Componente root con hydrate
└── main.tsx                    # Entry point con BrowserRouter
```

---

## 💡 Notas Importantes

1. **LocalStorage**: Se usa para persistencia. En producción, considera usar sessionStorage o cookies HTTP-only.

2. **CORS**: Si tu API está en otro dominio, configura CORS adecuadamente.

3. **Tipos TypeScript**: El store usa tipos inferidos de Zod automáticamente.

4. **SSR**: Si necesitas Server-Side Rendering, adapta la lógica de `hydrate()`.

5. **Modo desarrollo**: El endpoint `/api/auth/login` fallará si no tienes backend. Usa mocks en desarrollo:

```typescript
// Simulación para desarrollo
if (process.env.DEV) {
  // Retornar user mock
}
```

---

## ✨ Características Implementadas

✅ Validación con Zod  
✅ Gestión de estado con Zustand  
✅ Rutas protegidas con React Router  
✅ Persistencia en localStorage  
✅ Manejo de errores  
✅ Estados de carga  
✅ Hidratación automática del estado  
✅ Integración React Hook Form  
✅ Tipado completo con TypeScript  
✅ Redirección inteligente de rutas  

---

## 📞 Soporte

Para dudas o problemas, revisa:
- Console del navegador (F12)
- Errores en TypeScript
- Red (Network tab) para ver requests al API
