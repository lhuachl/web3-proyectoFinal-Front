# 🔌 Endpoints de API

## Resumen de Endpoints

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Iniciar sesión | ❌ No |
| POST | `/api/auth/register` | Registrar usuario | ❌ No |
| GET | `/api/auth/me` | Obtener usuario actual | ✅ Sí |
| POST | `/api/auth/refresh` | Refrescar token | ✅ Sí |
| GET | `/api/services` | Listar servicios | ❌ No |
| GET | `/api/services/{id}` | Obtener servicio | ❌ No |
| GET | `/api/stylists` | Listar estilistas | ❌ No |
| GET | `/api/stylists/{id}` | Obtener estilista | ❌ No |
| GET | `/api/stylists/{id}/availability` | Ver disponibilidad | ❌ No |
| GET | `/api/appointments` | Mis citas | ✅ Sí |
| GET | `/api/appointments/{id}` | Obtener cita | ✅ Sí |
| POST | `/api/appointments` | Crear cita | ✅ Sí |
| PATCH | `/api/appointments/{id}` | Actualizar cita | ✅ Sí |
| DELETE | `/api/appointments/{id}` | Cancelar cita | ✅ Sí |

---

## AuthController

```csharp
// Controllers/AuthController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PeluqueriaApi.Data;
using PeluqueriaApi.DTOs.Auth;
using PeluqueriaApi.DTOs.Common;
using PeluqueriaApi.Extensions;
using PeluqueriaApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PeluqueriaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    /// <summary>
    /// POST /api/auth/login
    /// Iniciar sesión con email y contraseña
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(ApiResponse.Fail<AuthResponse>("Credenciales inválidas"));
        }

        var token = GenerateJwtToken(user);
        var expiresIn = int.Parse(_config["Jwt:ExpiresInHours"] ?? "24") * 3600;

        return Ok(ApiResponse.Ok(new AuthResponse(token, expiresIn, user.ToDto())));
    }

    /// <summary>
    /// POST /api/auth/register
    /// Registrar nuevo usuario
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register(RegisterRequest request)
    {
        // Verificar si el email ya existe
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return Conflict(ApiResponse.Fail<AuthResponse>("El email ya está registrado"));
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Cliente,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        var expiresIn = int.Parse(_config["Jwt:ExpiresInHours"] ?? "24") * 3600;

        return Created("", ApiResponse.Ok(new AuthResponse(token, expiresIn, user.ToDto())));
    }

    /// <summary>
    /// GET /api/auth/me
    /// Obtener información del usuario autenticado
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser()
    {
        var userId = GetUserIdFromToken();
        
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(ApiResponse.Fail<UserDto>("Usuario no encontrado"));
        }

        return Ok(ApiResponse.Ok(user.ToDto()));
    }

    /// <summary>
    /// POST /api/auth/refresh
    /// Refrescar token JWT
    /// </summary>
    [Authorize]
    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> RefreshToken()
    {
        var userId = GetUserIdFromToken();
        
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(ApiResponse.Fail<AuthResponse>("Usuario no encontrado"));
        }

        var token = GenerateJwtToken(user);
        var expiresIn = int.Parse(_config["Jwt:ExpiresInHours"] ?? "24") * 3600;

        return Ok(ApiResponse.Ok(new AuthResponse(token, expiresIn, user.ToDto())));
    }

    // Helper: Generar JWT
    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(
                int.Parse(_config["Jwt:ExpiresInHours"] ?? "24")),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // Helper: Obtener UserId del token
    private Guid GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException());
    }
}
```

---

## ServicesController

```csharp
// Controllers/ServicesController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeluqueriaApi.Data;
using PeluqueriaApi.DTOs;
using PeluqueriaApi.DTOs.Common;
using PeluqueriaApi.Extensions;

namespace PeluqueriaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ServicesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// GET /api/services
    /// Listar todos los servicios activos
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ServiceDto>>>> GetAll(
        [FromQuery] string? category = null)
    {
        var query = _context.Services
            .Where(s => s.IsActive);

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(s => s.Category == category);
        }

        var services = await query
            .OrderBy(s => s.Name)
            .Select(s => s.ToDto())
            .ToListAsync();

        return Ok(ApiResponse.Ok(services));
    }

    /// <summary>
    /// GET /api/services/{id}
    /// Obtener un servicio por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ServiceDto>>> GetById(Guid id)
    {
        var service = await _context.Services.FindAsync(id);

        if (service == null || !service.IsActive)
        {
            return NotFound(ApiResponse.Fail<ServiceDto>("Servicio no encontrado"));
        }

        return Ok(ApiResponse.Ok(service.ToDto()));
    }
}
```

---

## StylistsController

```csharp
// Controllers/StylistsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeluqueriaApi.Data;
using PeluqueriaApi.DTOs;
using PeluqueriaApi.DTOs.Common;
using PeluqueriaApi.Extensions;

namespace PeluqueriaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StylistsController : ControllerBase
{
    private readonly AppDbContext _context;

    public StylistsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// GET /api/stylists
    /// Listar todos los estilistas activos
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<StylistDto>>>> GetAll()
    {
        var stylists = await _context.Stylists
            .Where(s => s.IsActive)
            .OrderByDescending(s => s.Rating)
            .Select(s => s.ToDto())
            .ToListAsync();

        return Ok(ApiResponse.Ok(stylists));
    }

    /// <summary>
    /// GET /api/stylists/{id}
    /// Obtener un estilista por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<StylistDto>>> GetById(Guid id)
    {
        var stylist = await _context.Stylists.FindAsync(id);

        if (stylist == null || !stylist.IsActive)
        {
            return NotFound(ApiResponse.Fail<StylistDto>("Estilista no encontrado"));
        }

        return Ok(ApiResponse.Ok(stylist.ToDto()));
    }

    /// <summary>
    /// GET /api/stylists/{id}/availability?date=2025-01-15
    /// Obtener disponibilidad de un estilista para una fecha
    /// </summary>
    [HttpGet("{id:guid}/availability")]
    public async Task<ActionResult<ApiResponse<StylistAvailabilityDto>>> GetAvailability(
        Guid id, 
        [FromQuery] DateOnly date)
    {
        var stylist = await _context.Stylists.FindAsync(id);
        if (stylist == null || !stylist.IsActive)
        {
            return NotFound(ApiResponse.Fail<StylistAvailabilityDto>("Estilista no encontrado"));
        }

        // Obtener citas del día
        var appointments = await _context.Appointments
            .Where(a => a.StylistId == id 
                && a.DateTime.Date == date.ToDateTime(TimeOnly.MinValue)
                && a.Status != AppointmentStatus.Cancelado)
            .Select(a => new { a.DateTime, a.Duration })
            .ToListAsync();

        // Generar slots disponibles (simplificado: 9:00 - 18:00, cada 30 min)
        var slots = new List<AvailabilitySlot>();
        var startTime = new TimeOnly(9, 0);
        var endTime = new TimeOnly(18, 0);

        for (var time = startTime; time < endTime; time = time.AddMinutes(30))
        {
            var slotDateTime = date.ToDateTime(time);
            var isBooked = appointments.Any(a => 
                slotDateTime >= a.DateTime && 
                slotDateTime < a.DateTime.AddMinutes(a.Duration));

            slots.Add(new AvailabilitySlot(time.ToString("HH:mm"), !isBooked));
        }

        return Ok(ApiResponse.Ok(new StylistAvailabilityDto(date.ToString("yyyy-MM-dd"), slots)));
    }
}

public record StylistAvailabilityDto(string Date, List<AvailabilitySlot> Slots);
public record AvailabilitySlot(string Time, bool Available);
```

---

## AppointmentsController

```csharp
// Controllers/AppointmentsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeluqueriaApi.Data;
using PeluqueriaApi.DTOs;
using PeluqueriaApi.DTOs.Common;
using PeluqueriaApi.Extensions;
using PeluqueriaApi.Models;
using System.Security.Claims;

namespace PeluqueriaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Todas las rutas requieren autenticación
public class AppointmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AppointmentsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// GET /api/appointments
    /// Obtener citas del usuario autenticado
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<AppointmentDto>>>> GetMyAppointments()
    {
        var userId = GetCurrentUserId();

        var appointments = await _context.Appointments
            .Where(a => a.ClientId == userId)
            .OrderByDescending(a => a.DateTime)
            .Select(a => a.ToDto())
            .ToListAsync();

        return Ok(ApiResponse.Ok(appointments));
    }

    /// <summary>
    /// GET /api/appointments/{id}
    /// Obtener una cita por ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<AppointmentDto>>> GetById(Guid id)
    {
        var userId = GetCurrentUserId();

        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == id && a.ClientId == userId);

        if (appointment == null)
        {
            return NotFound(ApiResponse.Fail<AppointmentDto>("Cita no encontrada"));
        }

        return Ok(ApiResponse.Ok(appointment.ToDto()));
    }

    /// <summary>
    /// POST /api/appointments
    /// Crear una nueva cita
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<AppointmentDto>>> Create(
        CreateAppointmentRequest request)
    {
        var userId = GetCurrentUserId();

        // Verificar que el servicio existe
        var service = await _context.Services.FindAsync(request.ServiceId);
        if (service == null || !service.IsActive)
        {
            return BadRequest(ApiResponse.Fail<AppointmentDto>("Servicio no válido"));
        }

        // Verificar que el estilista existe
        var stylist = await _context.Stylists.FindAsync(request.StylistId);
        if (stylist == null || !stylist.IsActive)
        {
            return BadRequest(ApiResponse.Fail<AppointmentDto>("Estilista no válido"));
        }

        // Verificar disponibilidad (simplificado)
        var hasConflict = await _context.Appointments
            .AnyAsync(a => 
                a.StylistId == request.StylistId &&
                a.DateTime == request.DateTime &&
                a.Status != AppointmentStatus.Cancelado);

        if (hasConflict)
        {
            return Conflict(ApiResponse.Fail<AppointmentDto>("Horario no disponible"));
        }

        var appointment = new Appointment
        {
            Id = Guid.NewGuid(),
            ClientId = userId,
            ServiceId = request.ServiceId,
            StylistId = request.StylistId,
            DateTime = request.DateTime,
            Duration = service.Duration,
            Status = AppointmentStatus.Pendiente,
            Notes = request.Notes,
            TotalPrice = service.Price,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        return Created($"/api/appointments/{appointment.Id}", 
            ApiResponse.Ok(appointment.ToDto()));
    }

    /// <summary>
    /// PATCH /api/appointments/{id}
    /// Actualizar una cita
    /// </summary>
    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<ApiResponse<AppointmentDto>>> Update(
        Guid id, 
        UpdateAppointmentRequest request)
    {
        var userId = GetCurrentUserId();

        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == id && a.ClientId == userId);

        if (appointment == null)
        {
            return NotFound(ApiResponse.Fail<AppointmentDto>("Cita no encontrada"));
        }

        // Solo permitir actualizar si está pendiente o confirmada
        if (appointment.Status == AppointmentStatus.Completado ||
            appointment.Status == AppointmentStatus.Cancelado)
        {
            return BadRequest(ApiResponse.Fail<AppointmentDto>(
                "No se puede modificar una cita completada o cancelada"));
        }

        if (request.DateTime.HasValue)
            appointment.DateTime = request.DateTime.Value;
        
        if (request.Notes != null)
            appointment.Notes = request.Notes;
        
        if (!string.IsNullOrEmpty(request.Status))
        {
            if (Enum.TryParse<AppointmentStatus>(request.Status, true, out var status))
            {
                appointment.Status = status;
            }
        }

        appointment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse.Ok(appointment.ToDto()));
    }

    /// <summary>
    /// DELETE /api/appointments/{id}
    /// Cancelar una cita
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Cancel(Guid id)
    {
        var userId = GetCurrentUserId();

        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == id && a.ClientId == userId);

        if (appointment == null)
        {
            return NotFound(ApiResponse.Fail<object>("Cita no encontrada"));
        }

        if (appointment.Status == AppointmentStatus.Completado)
        {
            return BadRequest(ApiResponse.Fail<object>(
                "No se puede cancelar una cita completada"));
        }

        appointment.Status = AppointmentStatus.Cancelado;
        appointment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse.Ok<object>(null, "Cita cancelada exitosamente"));
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException());
    }
}
```

---

## Formato de Respuestas

### Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Corte de cabello",
    "price": 25.00
  },
  "message": null,
  "errors": null
}
```

### Respuesta de Error

```json
{
  "success": false,
  "data": null,
  "message": "Credenciales inválidas",
  "errors": null
}
```

### Respuesta de Validación

```json
{
  "success": false,
  "data": null,
  "message": null,
  "errors": [
    "El email es requerido",
    "La contraseña debe tener al menos 6 caracteres"
  ]
}
```
