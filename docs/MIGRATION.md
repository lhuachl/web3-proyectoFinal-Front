# 🔄 Guía de Migración - JSON Server a API Real

Esta guía describe los cambios realizados para migrar de JSON Server (desarrollo) a una API real de ASP.NET.

## Cambios Realizados

### Estructura de Carpetas

```
src/
├── api/                    # NUEVO: Capa de API
│   ├── index.ts           # Barrel exports
│   ├── authApi.ts         # Endpoints de autenticación
│   ├── servicesApi.ts     # Endpoints de servicios
│   ├── appointmentsApi.ts # Endpoints de citas
│   └── stylistsApi.ts     # Endpoints de estilistas
├── config/                 # NUEVO: Configuración
│   └── api.config.ts      # URL y configuración de API
├── lib/
│   ├── apiClient.ts       # OBSOLETO (mantener para compatibilidad)
│   ├── httpClient.ts      # NUEVO: Cliente HTTP mejorado
│   └── utils.ts
├── types/
│   ├── api.types.ts       # NUEVO: Tipos centralizados
│   ├── userRol.ts
│   └── uuid.ts
├── store/
│   └── authStore.ts       # ACTUALIZADO: Usa nueva API
└── services/
    ├── authService.ts     # OBSOLETO (lógica movida a authApi)
    └── credentialValidator.ts  # OBSOLETO
```

### Archivos Obsoletos

Los siguientes archivos ya no son necesarios con la API real:

- `server.cjs` - Servidor JSON Server
- `db.json` - Base de datos local
- `src/services/authService.ts` - Reemplazado por `src/api/authApi.ts`
- `src/services/credentialValidator.ts` - Lógica integrada en httpClient

**Nota**: Mantener estos archivos si necesitas desarrollo offline.

## Configuración de Variables de Entorno

### Desarrollo (.env.local)

```bash
VITE_API_URL=https://localhost:7001/api
VITE_API_TIMEOUT=10000
```

### Producción (.env.production)

```bash
VITE_API_URL=https://tu-api-produccion.com/api
VITE_API_TIMEOUT=15000
```

## Cambios en el Flujo de Datos

### Antes (JSON Server)

```
Component → authStore → authService → credentialValidator → JSON Server
```

### Después (API Real)

```
Component → authStore → authApi → httpClient → ASP.NET API
```

## Uso de las Nuevas APIs

### Autenticación

```tsx
import { useAuthStore } from '@/store/authStore';

function LoginForm() {
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await login(email, password);
      // Redirigir a dashboard
    } catch (err) {
      // Error manejado en el store
    }
  };
}
```

### Servicios

```tsx
import { servicesApi } from '@/api';

function ServicesList() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function loadServices() {
      const response = await servicesApi.getAll();
      if (response.success && response.data) {
        setServices(response.data);
      }
    }
    loadServices();
  }, []);
}
```

### Citas

```tsx
import { appointmentsApi } from '@/api';

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function loadAppointments() {
      const response = await appointmentsApi.getMyAppointments();
      if (response.success && response.data) {
        setAppointments(response.data);
      }
    }
    loadAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    const response = await appointmentsApi.cancel(id);
    if (response.success) {
      // Actualizar lista
    }
  };
}
```

## Principios Aplicados

### SOLID

- **S**RP: Cada API maneja un solo dominio (auth, services, appointments)
- **O**CP: httpClient es extensible sin modificar
- **D**IP: Store depende de abstracciones (API), no implementaciones

### YAGNI

- Sin capas innecesarias (repositories, use cases)
- Sin sobre-abstracción
- Código directo y funcional

### KISS

- APIs simples con métodos claros
- Un solo httpClient reutilizable
- Configuración centralizada

### DRY

- Tipos compartidos en `api.types.ts`
- Lógica de headers en httpClient
- Manejo de errores centralizado

## Verificar la Migración

1. Configurar `.env.local` con la URL de la API
2. Ejecutar `pnpm dev`
3. Probar login/signup
4. Verificar que el token se almacena correctamente
5. Probar rutas protegidas

## Troubleshooting

### Error de CORS

Verificar que la API tiene configurado:

```csharp
policy.WithOrigins("http://localhost:5173")
      .AllowAnyHeader()
      .AllowAnyMethod();
```

### Token Inválido

1. Limpiar localStorage
2. Verificar que JWT_KEY coincide en frontend y backend
3. Revisar expiración del token

### Conexión Rechazada

1. Verificar que la API está corriendo
2. Verificar URL en `.env.local`
3. Revisar certificados SSL (desarrollo: `Trust Server Certificate=true`)
