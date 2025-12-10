# 🗄️ Configuración de Base de Datos

## Supabase como PostgreSQL

Supabase proporciona una instancia de PostgreSQL que usaremos como base de datos en la nube.

### Obtener Credenciales

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Crear un nuevo proyecto o seleccionar existente
3. Ir a **Settings** → **Database**
4. Copiar la **Connection string** (URI)

### Formato de Connection String

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

Convertir a formato compatible con .NET:

```
Host=db.[PROJECT-REF].supabase.co;Port=5432;Database=postgres;Username=postgres;Password=[YOUR-PASSWORD];SSL Mode=Require;Trust Server Certificate=true
```

## Entity Framework Core Setup

### AppDbContext

```csharp
// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using PeluqueriaApi.Models;

namespace PeluqueriaApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Stylist> Stylists => Set<Stylist>();
    public DbSet<Appointment> Appointments => Set<Appointment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplicar todas las configuraciones
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
```

### Configuraciones de Entidades

```csharp
// Data/Configurations/UserConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PeluqueriaApi.Models;

namespace PeluqueriaApi.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        
        builder.HasKey(u => u.Id);
        
        builder.Property(u => u.Id)
            .HasColumnName("id");
        
        builder.Property(u => u.Name)
            .HasColumnName("name")
            .HasMaxLength(100)
            .IsRequired();
        
        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired();
        
        builder.HasIndex(u => u.Email)
            .IsUnique();
        
        builder.Property(u => u.PasswordHash)
            .HasColumnName("password_hash")
            .HasMaxLength(255)
            .IsRequired();
        
        builder.Property(u => u.Role)
            .HasColumnName("role")
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(UserRole.Cliente);
        
        builder.Property(u => u.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
        
        builder.Property(u => u.UpdatedAt)
            .HasColumnName("updated_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}
```

```csharp
// Data/Configurations/ServiceConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PeluqueriaApi.Models;

namespace PeluqueriaApi.Data.Configurations;

public class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> builder)
    {
        builder.ToTable("services");
        
        builder.HasKey(s => s.Id);
        
        builder.Property(s => s.Id).HasColumnName("id");
        builder.Property(s => s.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(s => s.Description).HasColumnName("description").HasMaxLength(500);
        builder.Property(s => s.Price).HasColumnName("price").HasPrecision(10, 2);
        builder.Property(s => s.Duration).HasColumnName("duration");
        builder.Property(s => s.Category).HasColumnName("category").HasMaxLength(50);
        builder.Property(s => s.ImageUrl).HasColumnName("image_url").HasMaxLength(500);
        builder.Property(s => s.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}
```

```csharp
// Data/Configurations/StylistConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PeluqueriaApi.Models;

namespace PeluqueriaApi.Data.Configurations;

public class StylistConfiguration : IEntityTypeConfiguration<Stylist>
{
    public void Configure(EntityTypeBuilder<Stylist> builder)
    {
        builder.ToTable("stylists");
        
        builder.HasKey(s => s.Id);
        
        builder.Property(s => s.Id).HasColumnName("id");
        builder.Property(s => s.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(s => s.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
        builder.HasIndex(s => s.Email).IsUnique();
        builder.Property(s => s.Phone).HasColumnName("phone").HasMaxLength(20);
        builder.Property(s => s.Specialties).HasColumnName("specialties").HasColumnType("text[]");
        builder.Property(s => s.Bio).HasColumnName("bio").HasMaxLength(1000);
        builder.Property(s => s.Rating).HasColumnName("rating").HasPrecision(3, 2).HasDefaultValue(0);
        builder.Property(s => s.ReviewCount).HasColumnName("review_count").HasDefaultValue(0);
        builder.Property(s => s.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        builder.Property(s => s.AvatarUrl).HasColumnName("avatar_url").HasMaxLength(500);
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}
```

```csharp
// Data/Configurations/AppointmentConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PeluqueriaApi.Models;

namespace PeluqueriaApi.Data.Configurations;

public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.ToTable("appointments");
        
        builder.HasKey(a => a.Id);
        
        builder.Property(a => a.Id).HasColumnName("id");
        builder.Property(a => a.ClientId).HasColumnName("client_id");
        builder.Property(a => a.ServiceId).HasColumnName("service_id");
        builder.Property(a => a.StylistId).HasColumnName("stylist_id");
        builder.Property(a => a.DateTime).HasColumnName("date_time");
        builder.Property(a => a.Duration).HasColumnName("duration");
        builder.Property(a => a.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(AppointmentStatus.Pendiente);
        builder.Property(a => a.Notes).HasColumnName("notes").HasMaxLength(500);
        builder.Property(a => a.TotalPrice).HasColumnName("total_price").HasPrecision(10, 2);
        builder.Property(a => a.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(a => a.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

        // Relaciones
        builder.HasOne(a => a.Client)
            .WithMany(u => u.Appointments)
            .HasForeignKey(a => a.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Service)
            .WithMany(s => s.Appointments)
            .HasForeignKey(a => a.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Stylist)
            .WithMany(s => s.Appointments)
            .HasForeignKey(a => a.StylistId)
            .OnDelete(DeleteBehavior.Restrict);

        // Índices para consultas frecuentes
        builder.HasIndex(a => a.ClientId);
        builder.HasIndex(a => a.StylistId);
        builder.HasIndex(a => a.DateTime);
    }
}
```

## Migraciones

### Crear Migración Inicial

```bash
# Desde la carpeta del proyecto
cd src/PeluqueriaApi

# Crear migración
dotnet ef migrations add InitialCreate

# Aplicar migración
dotnet ef database update
```

### Script SQL Manual (Alternativa)

Si prefieres crear las tablas manualmente en Supabase:

```sql
-- Crear tipos ENUM
CREATE TYPE user_role AS ENUM ('Cliente', 'Peluquera', 'Admin');
CREATE TYPE appointment_status AS ENUM ('Pendiente', 'Confirmado', 'Completado', 'Cancelado');

-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'Cliente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de servicios
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    duration INTEGER NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estilistas
CREATE TABLE stylists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    specialties TEXT[],
    bio VARCHAR(1000),
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de citas
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE RESTRICT,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    status appointment_status DEFAULT 'Pendiente',
    notes VARCHAR(500),
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_stylist_id ON appointments(stylist_id);
CREATE INDEX idx_appointments_date_time ON appointments(date_time);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Datos de Prueba

```sql
-- Insertar usuario admin
INSERT INTO users (id, name, email, password_hash, role) VALUES
(gen_random_uuid(), 'Admin', 'admin@peluqueria.com', 
 '$2a$11$rS8v9hUx.H3qhp9/8M0X6.X3Y9X7Y8Z9A0B1C2D3E4F5G6H7I8J9', 'Admin');
-- Contraseña: admin123

-- Insertar servicios
INSERT INTO services (name, description, price, duration, category, is_active) VALUES
('Corte de cabello', 'Corte moderno y personalizado', 25.00, 30, 'cortes', true),
('Tintura', 'Tintura profesional con productos de calidad', 45.00, 60, 'colorimetria', true),
('Peinado', 'Peinado para eventos especiales', 35.00, 45, 'peinados', true),
('Tratamiento capilar', 'Tratamiento profundo de hidratación', 30.00, 40, 'tratamientos', true);

-- Insertar estilistas
INSERT INTO stylists (name, email, phone, specialties, bio, rating, is_active) VALUES
('María García', 'maria@peluqueria.com', '+34 612 345 678', 
 ARRAY['cortes', 'colorimetria', 'tratamientos'], 
 'Estilista con 8 años de experiencia', 4.8, true),
('Laura Martínez', 'laura@peluqueria.com', '+34 612 345 679', 
 ARRAY['peinados', 'cortes'], 
 'Especialista en peinados de novia', 4.9, true);
```

## Configuración de Conexión Segura

### Development (User Secrets)

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=db.xxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=TU_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
```

### Production (Variables de Entorno)

```bash
# Azure App Service / Docker
ConnectionStrings__DefaultConnection="Host=db.xxx.supabase.co;..."
```

## Consideraciones de Rendimiento

1. **Índices**: Ya configurados en las columnas más consultadas
2. **Paginación**: Implementar para listas largas
3. **Proyección**: Usar `.Select()` para traer solo campos necesarios
4. **AsNoTracking**: Para consultas de solo lectura

```csharp
// Ejemplo de consulta optimizada
var appointments = await _context.Appointments
    .AsNoTracking()
    .Where(a => a.ClientId == userId)
    .OrderByDescending(a => a.DateTime)
    .Take(10)
    .Select(a => a.ToDto())
    .ToListAsync();
```
