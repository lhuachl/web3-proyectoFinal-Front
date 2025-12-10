# ⚙️ Configuración del Proyecto

## Crear el Proyecto

```bash
# Crear solución
dotnet new sln -n PeluqueriaApi

# Crear proyecto Web API
dotnet new webapi -n PeluqueriaApi -o src/PeluqueriaApi

# Agregar proyecto a la solución
dotnet sln add src/PeluqueriaApi/PeluqueriaApi.csproj
```

## Paquetes NuGet Necesarios

```bash
cd src/PeluqueriaApi

# Entity Framework Core + PostgreSQL (Supabase)
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design

# Autenticación JWT
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

# Hash de contraseñas
dotnet add package BCrypt.Net-Next
```

## Archivo .csproj Final

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
  </ItemGroup>

</Project>
```

## Program.cs - Configuración Mínima (KISS)

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PeluqueriaApi.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ========================================
// Servicios
// ========================================

// DbContext con PostgreSQL (Supabase)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Autenticación JWT
var jwtKey = builder.Configuration["Jwt:Key"] 
    ?? throw new InvalidOperationException("JWT Key no configurada");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Controllers
builder.Services.AddControllers();

// Swagger con JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Peluqueria API", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header. Ejemplo: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CORS para el frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
            ?? new[] { "http://localhost:5173" })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// ========================================
// Middleware Pipeline
// ========================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

## appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.xxxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
  },
  "Jwt": {
    "Key": "TuClaveSecretaMuyLargaYSeguraDeAlMenos32Caracteres!",
    "Issuer": "PeluqueriaApi",
    "Audience": "PeluqueriaWeb",
    "ExpiresInHours": 24
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://tu-dominio.com"
    ]
  }
}
```

## appsettings.Development.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.xxxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_DEV_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
  }
}
```

## User Secrets (Recomendado para desarrollo)

```bash
# Inicializar secrets
dotnet user-secrets init

# Guardar connection string de forma segura
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=db.xxxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"

# Guardar JWT Key
dotnet user-secrets set "Jwt:Key" "TuClaveSecretaMuyLargaYSeguraDeAlMenos32Caracteres!"
```

## Estructura de Carpetas Final

```
src/PeluqueriaApi/
├── Controllers/
│   ├── AuthController.cs
│   ├── ServicesController.cs
│   ├── AppointmentsController.cs
│   └── StylistsController.cs
├── Data/
│   ├── AppDbContext.cs
│   └── Configurations/
│       ├── UserConfiguration.cs
│       ├── ServiceConfiguration.cs
│       ├── AppointmentConfiguration.cs
│       └── StylistConfiguration.cs
├── DTOs/
│   ├── Auth/
│   │   ├── LoginRequest.cs
│   │   ├── RegisterRequest.cs
│   │   └── AuthResponse.cs
│   ├── Common/
│   │   └── ApiResponse.cs
│   ├── ServiceDto.cs
│   ├── AppointmentDto.cs
│   └── StylistDto.cs
├── Extensions/
│   └── MappingExtensions.cs
├── Models/
│   ├── User.cs
│   ├── Service.cs
│   ├── Appointment.cs
│   └── Stylist.cs
├── appsettings.json
├── appsettings.Development.json
├── PeluqueriaApi.csproj
└── Program.cs
```
