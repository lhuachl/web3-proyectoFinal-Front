# 🚀 Guía Rápida - Arquitectura Desacoplada de Auth

## Resumen de lo Nuevo

Se ha refactorizado completamente la autenticación para **desacoplar login de validación**:

```
Antes (Acoplado):
  authStore → fetch('/api/auth/login') → directamente en el mismo código

Ahora (Desacoplado):
  authStore → authService → credentialValidator → fetch('/api/auth/login')
```

## ⚡ Inicio Rápido (5 minutos)

### 1. Configurar API (elige UNO)

#### Opción A: Windows (PowerShell)
```powershell
.\setup-api.ps1 3001
```

#### Opción B: macOS/Linux (Bash)
```bash
chmod +x setup-api.sh
./setup-api.sh 3001
```

#### Opción C: Manual
Crea `.env.local`:
```
VITE_API_URL=http://localhost:3001
```

### 2. Levanta 2 terminales

**Terminal 1 - JSON Server (simula backend)**
```bash
pnpm db
```

Esto inicia un API REST en `http://localhost:3001` con datos de `db.json`

**Terminal 2 - App**
```bash
pnpm dev
```

### 3. Prueba el login

- Abre http://localhost:5173
- Email: `juan@peluqueria.com`
- Contraseña: `password123`
- ¡Listo! Deberías estar en el dashboard

## 🏗️ Arquitectura en 3 Capas

### Capa 1: `authService.ts` (Lógica Pura)
```typescript
// Solo recibe y retorna datos
const result = await authService.login(
  email, 
  password, 
  validator  // ← inyectado
);
// Devuelve: { token, user }
```

**No depende de:** API, HTTP, nada
**Responsabilidad:** Orquestar login/logout

### Capa 2: `credentialValidator.ts` (Valida Credenciales)
```typescript
// Conecta a la fuente (API, DB, etc)
const validator = createCredentialValidator({
  apiUrl: 'http://localhost:3001'  // ← configurable
});

await validator.validateLogin(email, password);
// Devuelve: { success, token, user, error }
```

**Responsabilidad:** Comunicar con API/DB

### Capa 3: `authStore.ts` (Estado Global)
```typescript
// Orquesta todo
const validator = createCredentialValidator({ 
  apiUrl: getApiUrl()  // ← lee .env.local
});

// Usa authService y credentialValidator
await authService.login(email, password, validator.validateLogin);
```

**Responsabilidad:** Estado global y persistencia

## 🔌 Cambiar Fuente de Datos (Sin Tocar Código)

### De JSON Server a API Real

Solo cambiar `.env.local`:
```bash
# Antes:
VITE_API_URL=http://localhost:3001

# Después:
VITE_API_URL=https://api.miempresa.com
```

**Nada más.** El código es el mismo.

### De API Real a Mock Local

1. Editar `authStore.ts`:

```typescript
// Comentar el credentialValidator normal
// const validator = createCredentialValidator({ apiUrl: getApiUrl() });

// Usar mock
import { createMockValidator } from '@/services/mockValidator';
const validator = createMockValidator();
```

2. Crear `src/services/mockValidator.ts` (copiar estructura de `credentialValidator.ts`)

## 📊 Flujo Completo de Login

```
Usuario escribe email/password
  ↓
SignIn.tsx llama authStore.login(email, password)
  ↓
authStore.login() llama authService.login(email, password, validator)
  ↓
authService llama validator.validateLogin(email, password)
  ↓
credentialValidator hace: POST http://localhost:3001/auth/login
  ↓
JSON Server busca en db.json y devuelve { token, user }
  ↓
authService retorna a authStore
  ↓
authStore guarda en estado global + localStorage
  ↓
ProtectedRoute valida y permite acceso al Dashboard
  ↓
✅ Usuario logueado
```

## 🧪 Testing

### Test de authService (sin API)

```typescript
import { authService } from '@/services/authService';

const mockValidator = async (email, pass) => ({
  success: true,
  token: 'test_token',
  user: { id: '1', email, name: 'Test' }
});

const result = await authService.login('a@b.com', 'pass', mockValidator);
expect(result.token).toBe('test_token');
```

**Ventaja:** No necesita servidor, es instantáneo

### Test de credentialValidator (con API)

```typescript
const validator = createCredentialValidator({
  apiUrl: 'http://localhost:3001',
  timeout: 5000
});

const result = await validator.validateLogin('juan@peluqueria.com', 'password123');
expect(result.success).toBe(true);
```

**Requiere:** JSON Server corriendo

## 🔄 Endpoints Esperados

Tu API debe tener estos 3 endpoints:

### POST /auth/login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "juan@peluqueria.com", "password": "password123"}'
```

**Response:**
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

### POST /auth/signup
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Nuevo", "email": "nuevo@test.com", "password": "pass123"}'
```

### GET /auth/me
```bash
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response:**
```json
{
  "user": {
    "id": "1",
    "email": "juan@peluqueria.com",
    "name": "Juan Pérez"
  }
}
```

## 📁 Archivos Nuevos

```
src/
├── services/
│   ├── authService.ts              ← Lógica pura
│   └── credentialValidator.ts      ← Valida contra API
├── store/
│   └── authStore.ts                ← Refactorizado
setup-api.ps1                        ← Script Windows
setup-api.sh                         ← Script Linux/Mac
.env.local.example                   ← Ejemplo de config
ARCHITECTURE.md                      ← Docs completas
```

## 🛠️ Solucionar Problemas

### "Cannot POST /auth/login"

JSON Server no está corriendo:
```bash
pnpm db
```

### "VITE_API_URL is undefined"

No tienes `.env.local`:
```bash
# Windows
.\setup-api.ps1 3001

# Linux/Mac
./setup-api.sh 3001

# O manual: crear .env.local con:
# VITE_API_URL=http://localhost:3001
```

### "Timeout error"

La API tarda más de 5 segundos:

Editar `authStore.ts`:
```typescript
const validator = createCredentialValidator({
  apiUrl: getApiUrl(),
  timeout: 10000  // 10 segundos
});
```

## ✅ Checklist de Integración

- [ ] Ejecuté `.\setup-api.ps1 3001` (o bash equivalent)
- [ ] Creé `.env.local` con `VITE_API_URL`
- [ ] Ejecuté `pnpm db` en una terminal
- [ ] Ejecuté `pnpm dev` en otra terminal
- [ ] Probé login con `juan@peluqueria.com` / `password123`
- [ ] Leí `ARCHITECTURE.md` para entender el flujo

## 🚀 Próximos Pasos

1. **Crear backend real** - Reemplaza JSON Server con tu API
2. **Cambiar URL** - Solo edita `.env.local`, sin cambiar código
3. **Agregar tests** - Usa ejemplos de `ARCHITECTURE.md`
4. **Agregar OAuth** - Crea nuevo validator, mismo authService
5. **Agregar refresh tokens** - Amplía credentialValidator

---

**¿Dudas?** Revisa `ARCHITECTURE.md` para más detalles

Última actualización: 25 de noviembre de 2025
