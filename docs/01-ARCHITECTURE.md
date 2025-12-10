# 🏗️ Arquitectura General

## Estructura del Proyecto

Seguimos una arquitectura en capas simplificada, aplicando YAGNI para evitar complejidad innecesaria.

```
PeluqueriaApi/
├── Controllers/           # Controladores de API
│   ├── AuthController.cs
│   ├── ServicesController.cs
│   ├── AppointmentsController.cs
│   └── StylistsController.cs
├── Models/               # Entidades de dominio
│   ├── User.cs
│   ├── Service.cs
│   ├── Appointment.cs
│   └── Stylist.cs
├── DTOs/                 # Data Transfer Objects
│   ├── Auth/
│   │   ├── LoginRequest.cs
│   │   ├── RegisterRequest.cs
│   │   └── AuthResponse.cs
│   ├── ServiceDto.cs
│   ├── AppointmentDto.cs
│   └── StylistDto.cs
├── Data/                 # Acceso a datos
│   ├── AppDbContext.cs
│   └── Configurations/   # Configuraciones de EF Core
├── Services/             # Lógica de negocio (solo si es necesario)
│   ├── IAuthService.cs
│   └── AuthService.cs
├── Extensions/           # Métodos de extensión
│   └── ServiceExtensions.cs
├── Middleware/           # Middleware personalizado
│   └── ExceptionMiddleware.cs
└── Program.cs            # Configuración de la aplicación
```

## Principios Aplicados

### ❌ NO hacer (Anti-patrones)

```
# Evitar capas innecesarias (YAGNI)
PeluqueriaApi/
├── Domain/
│   ├── Entities/
│   ├── ValueObjects/
│   └── Aggregates/
├── Application/
│   ├── Commands/
│   ├── Queries/
│   ├── Handlers/
│   └── Validators/
├── Infrastructure/
│   ├── Repositories/
│   ├── Persistence/
│   └── External/
└── Presentation/
    ├── Controllers/
    └── Filters/
```

Esta estructura es excesiva para una aplicación de este tamaño. Aplicamos YAGNI y KISS.

### ✅ SÍ hacer (Patrón recomendado)

```csharp
// KISS: Controlador simple y directo
[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ServicesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ServiceDto>>> GetAll()
    {
        var services = await _context.Services
            .Where(s => s.IsActive)
            .Select(s => s.ToDto())
            .ToListAsync();
            
        return Ok(services);
    }
}
```

## Flujo de Datos

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌────────────┐
│   Cliente   │────▶│  Controller  │────▶│  DbContext  │────▶│ PostgreSQL │
│   (React)   │◀────│   (API)      │◀────│   (EF Core) │◀────│ (Supabase) │
└─────────────┘     └──────────────┘     └─────────────┘     └────────────┘
       │                   │
       │              ┌────┴────┐
       │              │  DTOs   │
       │              └─────────┘
       │
  ┌────┴────┐
  │  JWT    │
  │ Token   │
  └─────────┘
```

## Decisiones de Arquitectura

| Decisión | Justificación |
|----------|---------------|
| Sin Repository Pattern | EF Core ya es un repository/unit of work. Agregar otra capa viola YAGNI |
| DTOs simples | Mapeo manual con extension methods en lugar de AutoMapper (KISS) |
| Controllers "gordos" | Para CRUD simple, la lógica en el controller es aceptable (YAGNI) |
| Services opcionales | Solo crear servicios cuando hay lógica de negocio compleja |
| Sin CQRS/MediatR | Innecesario para esta escala de aplicación (YAGNI) |

## Cuándo Agregar Complejidad

Solo agregar capas adicionales cuando:

1. **Services**: Lógica de negocio compleja que requiere transacciones o múltiples operaciones
2. **Repository**: Necesidad de cambiar el ORM o tests unitarios extensivos
3. **CQRS**: Requisitos de escalabilidad masiva o auditoría compleja

```csharp
// Ejemplo: Cuándo SÍ necesitas un Service
public class AppointmentService : IAppointmentService
{
    // Múltiples operaciones + lógica de negocio
    public async Task<Result> BookAppointment(BookAppointmentRequest request)
    {
        // 1. Verificar disponibilidad del estilista
        // 2. Verificar que el cliente no tenga cita a la misma hora
        // 3. Calcular precio con descuentos
        // 4. Crear la cita
        // 5. Enviar notificación
        // 6. Actualizar disponibilidad
    }
}
```
