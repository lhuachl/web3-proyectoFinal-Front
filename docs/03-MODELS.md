# 📦 Modelos y Entidades

## Modelos de Dominio

### User.cs

```csharp
namespace PeluqueriaApi.Models;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Cliente;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navegación
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}

public enum UserRole
{
    Cliente,
    Peluquera,
    Admin
}
```

### Service.cs

```csharp
namespace PeluqueriaApi.Models;

public class Service
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Duration { get; set; } // En minutos
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navegación
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
```

### Stylist.cs

```csharp
namespace PeluqueriaApi.Models;

public class Stylist
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string[] Specialties { get; set; } = Array.Empty<string>();
    public string? Bio { get; set; }
    public decimal Rating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navegación
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
```

### Appointment.cs

```csharp
namespace PeluqueriaApi.Models;

public class Appointment
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid StylistId { get; set; }
    public DateTime DateTime { get; set; }
    public int Duration { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pendiente;
    public string? Notes { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navegación
    public User Client { get; set; } = null!;
    public Service Service { get; set; } = null!;
    public Stylist Stylist { get; set; } = null!;
}

public enum AppointmentStatus
{
    Pendiente,
    Confirmado,
    Completado,
    Cancelado
}
```

## DTOs (Data Transfer Objects)

### DTOs de Autenticación

```csharp
// DTOs/Auth/LoginRequest.cs
namespace PeluqueriaApi.DTOs.Auth;

public record LoginRequest(
    string Email,
    string Password
);
```

```csharp
// DTOs/Auth/RegisterRequest.cs
namespace PeluqueriaApi.DTOs.Auth;

public record RegisterRequest(
    string Name,
    string Email,
    string Password
);
```

```csharp
// DTOs/Auth/AuthResponse.cs
namespace PeluqueriaApi.DTOs.Auth;

public record AuthResponse(
    string Token,
    int ExpiresIn,
    UserDto User
);

public record UserDto(
    Guid Id,
    string Email,
    string Name,
    string Role
);
```

### DTOs de Negocio

```csharp
// DTOs/ServiceDto.cs
namespace PeluqueriaApi.DTOs;

public record ServiceDto(
    Guid Id,
    string Name,
    string Description,
    decimal Price,
    int Duration,
    string Category,
    string? ImageUrl,
    bool IsActive
);
```

```csharp
// DTOs/StylistDto.cs
namespace PeluqueriaApi.DTOs;

public record StylistDto(
    Guid Id,
    string Name,
    string Email,
    string? Phone,
    string[] Specialties,
    string? Bio,
    decimal Rating,
    bool IsActive,
    string? AvatarUrl
);
```

```csharp
// DTOs/AppointmentDto.cs
namespace PeluqueriaApi.DTOs;

public record AppointmentDto(
    Guid Id,
    Guid ClientId,
    Guid ServiceId,
    Guid StylistId,
    DateTime DateTime,
    int Duration,
    string Status,
    string? Notes,
    decimal TotalPrice
);

public record CreateAppointmentRequest(
    Guid ServiceId,
    Guid StylistId,
    DateTime DateTime,
    string? Notes
);

public record UpdateAppointmentRequest(
    DateTime? DateTime,
    string? Notes,
    string? Status
);
```

### DTO de Respuesta Común

```csharp
// DTOs/Common/ApiResponse.cs
namespace PeluqueriaApi.DTOs.Common;

public record ApiResponse<T>(
    bool Success,
    T? Data = default,
    string? Message = null,
    string[]? Errors = null
);

// Helpers para crear respuestas (DRY)
public static class ApiResponse
{
    public static ApiResponse<T> Ok<T>(T data) 
        => new(true, data);
    
    public static ApiResponse<T> Ok<T>(T data, string message) 
        => new(true, data, message);
    
    public static ApiResponse<T> Fail<T>(string message) 
        => new(false, default, message);
    
    public static ApiResponse<T> Fail<T>(string[] errors) 
        => new(false, default, null, errors);
}
```

## Extensiones de Mapeo (DRY)

```csharp
// Extensions/MappingExtensions.cs
namespace PeluqueriaApi.Extensions;

using PeluqueriaApi.DTOs;
using PeluqueriaApi.DTOs.Auth;
using PeluqueriaApi.Models;

public static class MappingExtensions
{
    // User -> UserDto
    public static UserDto ToDto(this User user) => new(
        user.Id,
        user.Email,
        user.Name,
        user.Role.ToString().ToLower()
    );
    
    // Service -> ServiceDto
    public static ServiceDto ToDto(this Service service) => new(
        service.Id,
        service.Name,
        service.Description,
        service.Price,
        service.Duration,
        service.Category,
        service.ImageUrl,
        service.IsActive
    );
    
    // Stylist -> StylistDto
    public static StylistDto ToDto(this Stylist stylist) => new(
        stylist.Id,
        stylist.Name,
        stylist.Email,
        stylist.Phone,
        stylist.Specialties,
        stylist.Bio,
        stylist.Rating,
        stylist.IsActive,
        stylist.AvatarUrl
    );
    
    // Appointment -> AppointmentDto
    public static AppointmentDto ToDto(this Appointment appointment) => new(
        appointment.Id,
        appointment.ClientId,
        appointment.ServiceId,
        appointment.StylistId,
        appointment.DateTime,
        appointment.Duration,
        appointment.Status.ToString().ToLower(),
        appointment.Notes,
        appointment.TotalPrice
    );
}
```

## Notas sobre el Diseño

### ¿Por qué records para DTOs?

```csharp
// Records son inmutables y tienen value equality
public record UserDto(Guid Id, string Email, string Name, string Role);

// Equivalente a escribir:
public class UserDto
{
    public Guid Id { get; init; }
    public string Email { get; init; }
    public string Name { get; init; }
    public string Role { get; init; }
    
    // Constructor, Equals, GetHashCode, ToString...
}
```

**Beneficios:**
- Menos código (KISS)
- Inmutabilidad por defecto
- Deconstrucción automática
- Value equality

### ¿Por qué no AutoMapper?

AutoMapper agrega complejidad innecesaria para mapeos simples (YAGNI):

```csharp
// ❌ AutoMapper - configuración extra
CreateMap<User, UserDto>();
_mapper.Map<UserDto>(user);

// ✅ Extension method - simple y explícito
user.ToDto();
```

Solo considerar AutoMapper si:
- Hay más de 20+ entidades con mapeos complejos
- Los mapeos requieren lógica condicional compleja
- Hay mapeos bidireccionales frecuentes
