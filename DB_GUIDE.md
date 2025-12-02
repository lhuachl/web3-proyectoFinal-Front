# 📊 Guía de uso de db.json - Esquemas y Datos Simulados

Este archivo `db.json` contiene esquemas de datos y ejemplos que puedes usar para desarrollar y validar la aplicación sin un backend real.

## 📁 Estructura de db.json

### 1. **Auth** - Autenticación y Usuarios
```json
{
  "auth": {
    "users": [
      {
        "id": "1",
        "name": "Juan Pérez",
        "email": "juan@peluqueria.com",
        "password": "password123",
        "role": "cliente|peluquera|admin",
        "createdAt": "ISO date",
        "updatedAt": "ISO date"
      }
    ],
    "tokens": [...]
  }
}
```

**Campos:**
- `id` - UUID único del usuario
- `name` - Nombre completo
- `email` - Email único
- `password` - Contraseña hasheada (en producción)
- `role` - Tipo de usuario
- `createdAt`, `updatedAt` - Timestamps

---

### 2. **Services** - Servicios de la Peluquería
```json
{
  "services": [
    {
      "id": "1",
      "name": "Corte de cabello",
      "description": "Corte moderno y personalizado",
      "price": 25.00,
      "duration": 30,
      "category": "cortes|colorimetria|peinados|tratamientos|hombre",
      "image": "URL de imagen",
      "isActive": true
    }
  ]
}
```

**Categorías disponibles:**
- `cortes` - Cortes de cabello
- `colorimetria` - Tinturas y colorimetría
- `peinados` - Peinados especiales
- `tratamientos` - Tratamientos capilares
- `hombre` - Servicios para hombres

---

### 3. **Appointments** - Citas Programadas
```json
{
  "appointments": [
    {
      "id": "1",
      "clientId": "1",
      "serviceId": "1",
      "peluqueraId": "2",
      "dateTime": "2025-11-26T14:00:00Z",
      "duration": 30,
      "status": "confirmado|pendiente|cancelado|completado",
      "notes": "Notas adicionales",
      "totalPrice": 25.00,
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

**Estados posibles:**
- `confirmado` - Cita confirmada
- `pendiente` - Esperando confirmación
- `cancelado` - Cita cancelada
- `completado` - Cita realizada

---

### 4. **Peluqueras** - Profesionales
```json
{
  "peluqueras": [
    {
      "id": "2",
      "name": "María García",
      "email": "maria@peluqueria.com",
      "phone": "+34 612 345 678",
      "specialties": ["cortes", "colorimetria"],
      "bio": "Estilista con 8 años de experiencia",
      "rating": 4.8,
      "reviews": 24,
      "isActive": true,
      "avatar": "URL de foto",
      "workingHours": {
        "monday": { "start": "09:00", "end": "18:00" },
        "sunday": null
      }
    }
  ]
}
```

---

### 5. **Reviews** - Reseñas y Calificaciones
```json
{
  "reviews": [
    {
      "id": "1",
      "clientId": "1",
      "peluqueraId": "2",
      "appointmentId": "1",
      "rating": 5,
      "comment": "Excelente servicio",
      "createdAt": "ISO date"
    }
  ]
}
```

---

### 6. **Availability** - Disponibilidad de Profesionales
```json
{
  "availability": [
    {
      "id": "1",
      "peluqueraId": "2",
      "date": "2025-11-26",
      "slots": [
        { "time": "09:00", "available": true },
        { "time": "09:30", "available": false }
      ]
    }
  ]
}
```

---

### 7. **Promotions** - Promociones y Códigos
```json
{
  "promotions": [
    {
      "id": "1",
      "title": "Descuento por primer corte",
      "description": "20% de descuento",
      "discount": 20,
      "type": "percentage|fixed",
      "code": "PRIMER20",
      "validFrom": "ISO date",
      "validUntil": "ISO date",
      "maxUses": 100,
      "currentUses": 12,
      "isActive": true
    }
  ]
}
```

---

### 8. **Gallery** - Galería de Trabajos
```json
{
  "gallery": [
    {
      "id": "1",
      "peluqueraId": "2",
      "title": "Corte moderno",
      "description": "Último trabajo",
      "imageUrl": "URL de imagen",
      "category": "cortes",
      "createdAt": "ISO date"
    }
  ]
}
```

---

### 9. **Settings** - Configuración General
```json
{
  "settings": {
    "businessHours": {
      "monday": { "start": "09:00", "end": "18:00" }
    },
    "currency": "USD",
    "timezone": "America/New_York",
    "appointmentNoticeTime": 24,
    "cancellationTime": 48
  }
}
```

---

## 🚀 Opciones para Usar db.json

### **Opción 1: JSON Server (Recomendado para desarrollo)**

JSON Server crea un API REST automático desde `db.json`.

**Instalación:**
```bash
pnpm add -D json-server
```

**En package.json, agregar script:**
```json
{
  "scripts": {
    "db": "json-server --watch db.json --port 3001"
  }
}
```

**Ejecutar:**
```bash
pnpm db
```

**Endpoints generados automáticamente:**
```
GET    /auth/users
GET    /auth/users/1
POST   /auth/users
PUT    /auth/users/1
DELETE /auth/users/1

GET    /services
GET    /services?category=cortes
POST   /services

GET    /appointments
GET    /appointments?clientId=1
POST   /appointments

GET    /peluqueras
GET    /peluqueras/2

GET    /reviews
POST   /reviews

GET    /availability
GET    /availability?peluqueraId=2

GET    /promotions
POST   /promotions

GET    /gallery
GET    /gallery?peluqueraId=2

GET    /settings
```

---

### **Opción 2: Usar db.json para Mockear en el Frontend**

Sin servidor, mantener los datos en cliente:

```typescript
// src/services/mockApi.ts
import db from '../../db.json';

export const mockApi = {
  // Auth
  async login(email: string, password: string) {
    const user = db.auth.users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Credenciales inválidas');
    return {
      token: 'mock_token_' + user.id,
      user: { id: user.id, name: user.name, email: user.email }
    };
  },

  // Services
  async getServices() {
    return db.services;
  },

  // Appointments
  async getAppointments(clientId: string) {
    return db.appointments.filter(a => a.clientId === clientId);
  },

  // Peluqueras
  async getPeluqueras() {
    return db.peluqueras;
  }
};
```

Luego en `authStore.ts`, cambiar endpoints:

```typescript
login: async (email: string, password: string) => {
  // En desarrollo
  const result = await import('@/services/mockApi').then(m => 
    m.mockApi.login(email, password)
  );
  set({ user: result.user, token: result.token });
}
```

---

### **Opción 3: Mezcla - Mock + Backend Real Gradualmente**

1. **Fase 1:** Usar mock API desde db.json
2. **Fase 2:** Conectar algunos endpoints reales
3. **Fase 3:** Migrar completamente al backend

```typescript
// src/config/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const USE_MOCK = !import.meta.env.VITE_API_URL;

export const apiClient = {
  async login(email: string, password: string) {
    if (USE_MOCK) {
      return mockApi.login(email, password);
    }
    return fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json());
  }
};
```

---

## 📋 Cómo Actualizar db.json

### Agregar un usuario:
```json
{
  "auth": {
    "users": [
      // ... usuarios existentes
      {
        "id": "4",
        "name": "Nuevo Usuario",
        "email": "nuevo@peluqueria.com",
        "password": "password123",
        "role": "cliente",
        "createdAt": "2025-11-25T10:00:00Z",
        "updatedAt": "2025-11-25T10:00:00Z"
      }
    ]
  }
}
```

### Agregar un servicio:
```json
{
  "services": [
    // ... servicios existentes
    {
      "id": "6",
      "name": "Alisado permanente",
      "description": "Alisado con keratina",
      "price": 65.00,
      "duration": 120,
      "category": "tratamientos",
      "image": "https://via.placeholder.com/200",
      "isActive": true,
      "createdAt": "2025-11-25T10:00:00Z"
    }
  ]
}
```

---

## 🔗 Integración Recomendada

**En .env.local:**
```
# Desarrollo con mock (sin backend)
# VITE_API_URL=

# O con json-server
VITE_API_URL=http://localhost:3001
```

**En authStore.ts:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

login: async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  // ... resto del código
}
```

---

## ✅ Datos de Prueba Disponibles

### Usuario Test:
- **Email:** `juan@peluqueria.com`
- **Contraseña:** `password123`
- **Rol:** cliente

### Peluquera Test:
- **Email:** `maria@peluqueria.com`
- **Contraseña:** `password123`
- **Rol:** peluquera

### Admin Test:
- **Email:** `carlos@peluqueria.com`
- **Contraseña:** `password123`
- **Rol:** admin

---

## 📝 Notas Importantes

1. **db.json es solo para desarrollo** - No usar en producción
2. **Cambios en JSON Server son transitorios** - Se pierden al reiniciar si no está configurado persistir
3. **IDs deben ser únicos** - Mantener secuencias lógicas
4. **Fechas en ISO 8601** - Usar formato `YYYY-MM-DDTHH:mm:ssZ`
5. **Este archivo es tu fuente de verdad temporal** - Mantenerlo actualizado con la estructura real

---

**Última actualización:** 25 de noviembre de 2025
