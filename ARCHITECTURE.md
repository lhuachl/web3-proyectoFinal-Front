# 🔐 Arquitectura Desacoplada de Autenticación

Este documento explica la nueva arquitectura de autenticación **desacoplada y flexible** del proyecto.

## 📐 Concepto

La lógica de **autenticación** está separada de la lógica de **validación de credenciales**:

- **`authService.ts`** - Login/Logout (sin dependencia de API)
- **`credentialValidator.ts`** - Valida credenciales contra cualquier fuente
- **`authStore.ts`** - Estado global que orquesta ambas

```
┌─────────────────────────────────────────┐
│           Zustand Store                 │
│      (orquesta todo el flujo)           │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────┐                   │
│  │  authService     │                   │
│  │  (lógica pura)   │──────────────┐    │
│  └──────────────────┘              │    │
│                                    ▼    │
│  ┌────────────────────────────────────┐ │
│  │  credentialValidator               │ │
│  │  (conecta a diferentes fuentes)    │ │
│  │  - JSON Server (3001)              │ │
│  │  - API Real (8000)                 │ │
│  │  - Mock local                      │ │
│  └────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## 🔄 Flujo de Login

```
1. Usuario ingresa email/password en SignIn.tsx
   ↓
2. SignIn llama a authStore.login(email, password)
   ↓
3. authStore.login() llama a authService.login()
   ↓
4. authService.login() recibe un "validador" como parámetro
   ↓
5. validador (credentialValidator) hace POST a /auth/login
   ↓
6. credentialValidator devuelve { success, token, user }
   ↓
7. authService retorna { token, user }
   ↓
8. authStore guarda en estado global y localStorage
   ↓
9. ProtectedRoute deja pasar al dashboard
```

## 🎯 Ventajas

✅ **Testeable** - Cada capa se puede testear por separado
✅ **Flexible** - Cambiar fuente de datos sin tocar lógica
✅ **Reutilizable** - authService se puede usar en otros contextos
✅ **Mantenible** - Responsabilidades claras

## 📁 Archivos

### `src/services/authService.ts`
**Propósito:** Lógica pura de autenticación

```typescript
// Recibe un validador como parámetro
const response = await authService.login(
  email,
  password,
  validator.validateLogin  // ← función inyectada
);
```

**Métodos:**
- `login(email, password, validator)` - Login
- `signup(name, email, password, validator)` - Registro
- `verifyToken(token, validator)` - Verificar token

### `src/services/credentialValidator.ts`
**Propósito:** Valida credenciales contra una API

```typescript
const validator = createCredentialValidator({
  apiUrl: 'http://localhost:3001',  // ← configurable
  timeout: 5000
});

// Devuelve { success, token, user, error }
const result = await validator.validateLogin(email, password);
```

**Métodos:**
- `validateLogin(email, password)` - POST /auth/login
- `validateSignup(name, email, password)` - POST /auth/signup
- `validateToken(token)` - GET /auth/me

### `src/store/authStore.ts`
**Propósito:** Estado global que orquesta todo

```typescript
// Lee VITE_API_URL automáticamente
const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Crea el validador
const validator = createCredentialValidator({ apiUrl: getApiUrl() });

// Lo usa en login()
const response = await authService.login(email, password, validator.validateLogin);
```

## 🚀 Cómo Usar

### 1. Configurar URL de la API

**Opción A: Script automático (Windows)**
```powershell
.\setup-api.ps1 3001
# o
.\setup-api.ps1 http://localhost:3001
```

**Opción B: Script automático (macOS/Linux)**
```bash
chmod +x setup-api.sh
./setup-api.sh 3001
# o
./setup-api.sh http://localhost:3001
```

**Opción C: Manual**
Crea `.env.local`:
```
VITE_API_URL=http://localhost:3001
```

### 2. Ejecutar JSON Server (si usas db.json)

```bash
pnpm db
```

Esto levanta un API REST en `http://localhost:3001` con los datos de `db.json`.

### 3. Ejecutar app

```bash
pnpm dev
```

### 4. Probar

Abre http://localhost:5173 e intenta login:
- Email: `juan@peluqueria.com`
- Contraseña: `password123`

## 🔌 Cambiar Fuente de Datos

### De JSON Server a API Real

Solo cambiar la variable de entorno:

```bash
# .env.local
VITE_API_URL=https://api.miempresa.com
```

No requiere cambio de código. El `credentialValidator` hace las mismas peticiones.

### De API a Mock Local

Crear un nuevo validador:

```typescript
// src/services/mockValidator.ts
export const createMockValidator = () => {
  const db = {
    users: [
      { id: '1', email: 'juan@test.com', password: 'pass123', name: 'Juan' }
    ]
  };

  return {
    validateLogin: async (email: string, password: string) => {
      const user = db.users.find(u => u.email === email);
      if (!user || user.password !== password) {
        return { success: false, error: 'Credenciales inválidas' };
      }
      return {
        success: true,
        token: `token_${user.id}`,
        user: { id: user.id, email: user.email, name: user.name }
      };
    },
    // ... otros métodos
  };
};
```

Luego en `authStore.ts`:

```typescript
// Usar mock en desarrollo
const validator = createMockValidator();

// O usar credentialValidator en producción
// const validator = createCredentialValidator({ apiUrl: getApiUrl() });
```

## 📝 Estructura de Respuestas Esperadas

### Login Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "email": "juan@peluqueria.com",
    "name": "Juan Pérez"
  }
}
```

### Signup Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "2",
    "email": "nuevo@peluqueria.com",
    "name": "Nuevo Usuario"
  }
}
```

### Verify Token Response

```json
{
  "user": {
    "id": "1",
    "email": "juan@peluqueria.com",
    "name": "Juan Pérez"
  }
}
```

## 🧪 Testing

### Test de authService (sin API)

```typescript
import { authService } from '@/services/authService';
import { describe, it, expect } from 'vitest';

describe('authService', () => {
  it('should login successfully', async () => {
    const mockValidator = async () => ({
      success: true,
      token: 'mock_token',
      user: { id: '1', email: 'test@test.com', name: 'Test' }
    });

    const result = await authService.login(
      'test@test.com',
      'password',
      mockValidator
    );

    expect(result.token).toBe('mock_token');
    expect(result.user.email).toBe('test@test.com');
  });

  it('should fail with invalid credentials', async () => {
    const mockValidator = async () => ({
      success: false,
      error: 'Invalid credentials'
    });

    try {
      await authService.login('bad@test.com', 'wrong', mockValidator);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
```

### Test de credentialValidator

```typescript
import { createCredentialValidator } from '@/services/credentialValidator';

describe('credentialValidator', () => {
  it('should timeout after specified time', async () => {
    const validator = createCredentialValidator({
      apiUrl: 'http://invalid-url-that-never-responds',
      timeout: 100 // 100ms
    });

    const result = await validator.validateLogin('test@test.com', 'pass');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Timeout');
  });
});
```

## ⚙️ Configuración Avanzada

### Cambiar Timeout

Editar `authStore.ts`:

```typescript
const validator = createCredentialValidator({
  apiUrl: getApiUrl(),
  timeout: 10000  // ← 10 segundos
});
```

### Agregar Interceptores

Crear un validador personalizado:

```typescript
export const createAdvancedValidator = (config) => {
  const baseValidator = createCredentialValidator(config);

  return {
    validateLogin: async (email, password) => {
      console.log(`[Auth] Login attempt: ${email}`);
      const result = await baseValidator.validateLogin(email, password);
      if (result.success) {
        console.log(`[Auth] Login successful: ${email}`);
      } else {
        console.error(`[Auth] Login failed: ${result.error}`);
      }
      return result;
    },
    // ... otros métodos
  };
};
```

## 🐛 Troubleshooting

### "Cannot connect to API"

1. Verifica que el servidor está corriendo: `pnpm db`
2. Verifica la URL en `.env.local`
3. Abre DevTools y revisa Network para ver las peticiones
4. Comprueba que el puerto es correcto

### "Invalid response from server"

El servidor devuelve una respuesta pero sin los campos `token` o `user`.

Verifica que tu API devuelve:

```json
{
  "token": "...",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

### "Timeout error"

La API tarda más de 5000ms (configurable).

Aumenta el timeout:
```typescript
timeout: 10000
```

## 📚 Próximos Pasos

- [ ] Agregar refresh tokens
- [ ] Agregar autenticación OAuth
- [ ] Agregar logging centralizado
- [ ] Agregar retry logic
- [ ] Tests unitarios completos

---

**Última actualización:** 25 de noviembre de 2025
