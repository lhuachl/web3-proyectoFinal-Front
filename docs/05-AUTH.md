# 🔐 Autenticación y Autorización

## Flujo de Autenticación

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │     │     API     │     │  Base Datos │
│   (React)   │     │  (ASP.NET)  │     │ (PostgreSQL)│
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ 1. POST /login    │                   │
       │   {email, pass}   │                   │
       │──────────────────▶│                   │
       │                   │ 2. Buscar usuario │
       │                   │──────────────────▶│
       │                   │◀──────────────────│
       │                   │ 3. Verificar hash │
       │                   │                   │
       │ 4. JWT Token      │                   │
       │◀──────────────────│                   │
       │                   │                   │
       │ 5. GET /protected │                   │
       │ [Bearer token]    │                   │
       │──────────────────▶│                   │
       │                   │ 6. Validar JWT    │
       │ 7. Datos          │                   │
       │◀──────────────────│                   │
```

## Configuración JWT

### Generación de Clave Segura

```bash
# Generar una clave segura (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))

# Ejemplo de salida (usar algo similar en producción):
# xK3mB9dQ7wZ2yN5hF8jL6cR4tV0pW1aS+E=...
```

### Estructura del Token

```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "nameid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "usuario@example.com",
  "unique_name": "Juan Pérez",
  "role": "Cliente",
  "exp": 1702483200,
  "iss": "PeluqueriaApi",
  "aud": "PeluqueriaWeb"
}
```

## Implementación

### Servicio de Autenticación (Opcional)

Solo crear si la lógica de autenticación se vuelve compleja:

```csharp
// Services/IAuthService.cs
namespace PeluqueriaApi.Services;

public interface IAuthService
{
    Task<AuthResult> LoginAsync(string email, string password);
    Task<AuthResult> RegisterAsync(string name, string email, string password);
    string GenerateToken(User user);
    Guid? ValidateToken(string token);
}

public record AuthResult(
    bool Success,
    string? Token = null,
    UserDto? User = null,
    string? Error = null
);
```

```csharp
// Services/AuthService.cs
namespace PeluqueriaApi.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<AuthResult> LoginAsync(string email, string password)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
            return new AuthResult(false, Error: "Usuario no encontrado");

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return new AuthResult(false, Error: "Contraseña incorrecta");

        var token = GenerateToken(user);
        return new AuthResult(true, token, user.ToDto());
    }

    public async Task<AuthResult> RegisterAsync(
        string name, 
        string email, 
        string password)
    {
        if (await _context.Users.AnyAsync(u => u.Email == email))
            return new AuthResult(false, Error: "Email ya registrado");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = name,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = UserRole.Cliente
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateToken(user);
        return new AuthResult(true, token, user.ToDto());
    }

    public string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        
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
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: new SigningCredentials(
                key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public Guid? ValidateToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);

            handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _config["Jwt:Issuer"],
                ValidAudience = _config["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(key)
            }, out var validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            var userId = jwtToken.Claims
                .First(x => x.Type == ClaimTypes.NameIdentifier).Value;

            return Guid.Parse(userId);
        }
        catch
        {
            return null;
        }
    }
}
```

## Autorización por Roles

### Políticas de Autorización

```csharp
// Program.cs
builder.Services.AddAuthorization(options =>
{
    // Política para administradores
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole("Admin"));
    
    // Política para estilistas y admins
    options.AddPolicy("StaffOnly", policy => 
        policy.RequireRole("Admin", "Peluquera"));
});
```

### Uso en Controllers

```csharp
[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    // Solo accesible por administradores
}

[ApiController]
[Route("api/staff")]
public class StaffController : ControllerBase
{
    [HttpGet("appointments")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> GetAllAppointments()
    {
        // Solo estilistas y admins
    }
}
```

## Protección de Rutas

### Rutas Públicas vs Protegidas

```csharp
[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    // Ruta pública - cualquiera puede ver servicios
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll() { }

    // Ruta protegida - solo admins pueden crear
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(ServiceDto dto) { }
}
```

## Extension Methods para Claims

```csharp
// Extensions/ClaimsExtensions.cs
namespace PeluqueriaApi.Extensions;

public static class ClaimsExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(claim ?? throw new UnauthorizedAccessException());
    }

    public static string GetEmail(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Email)?.Value 
            ?? throw new UnauthorizedAccessException();
    }

    public static string GetRole(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Role)?.Value ?? "Cliente";
    }

    public static bool IsAdmin(this ClaimsPrincipal user)
    {
        return user.GetRole() == "Admin";
    }
}
```

### Uso en Controllers

```csharp
[Authorize]
[HttpGet("profile")]
public async Task<IActionResult> GetProfile()
{
    var userId = User.GetUserId(); // Extension method
    var email = User.GetEmail();
    
    // ...
}
```

## Seguridad - Mejores Prácticas

### ✅ Hacer

1. **Siempre hashear contraseñas**
   ```csharp
   var hash = BCrypt.Net.BCrypt.HashPassword(password);
   var isValid = BCrypt.Net.BCrypt.Verify(password, hash);
   ```

2. **Usar HTTPS en producción**
   ```csharp
   app.UseHttpsRedirection();
   ```

3. **Configurar CORS correctamente**
   ```csharp
   policy.WithOrigins("https://tu-dominio.com")
         .AllowAnyHeader()
         .AllowAnyMethod();
   ```

4. **Tokens con expiración corta** (24h máximo)

5. **Validar todas las entradas**

### ❌ NO Hacer

1. Almacenar contraseñas en texto plano
2. Incluir información sensible en el JWT
3. Usar CORS `AllowAnyOrigin()` con `AllowCredentials()`
4. Exponer detalles de errores internos
5. Hardcodear secretos en el código

## Manejo de Errores de Autenticación

```csharp
// Middleware/ExceptionMiddleware.cs
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (UnauthorizedAccessException)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(
                ApiResponse.Fail<object>("No autorizado"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no manejado");
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(
                ApiResponse.Fail<object>("Error interno del servidor"));
        }
    }
}

// Program.cs
app.UseMiddleware<ExceptionMiddleware>();
```
