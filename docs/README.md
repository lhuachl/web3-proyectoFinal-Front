# 📚 Documentación API - Peluquería Web3

Esta documentación detalla cómo construir la API backend en ASP.NET Core para el sistema de gestión de peluquería, utilizando PostgreSQL en Supabase.

## 📁 Índice

1. [Arquitectura General](./01-ARCHITECTURE.md)
2. [Configuración del Proyecto](./02-PROJECT-SETUP.md)
3. [Modelos y Entidades](./03-MODELS.md)
4. [Endpoints de API](./04-ENDPOINTS.md)
5. [Autenticación y Autorización](./05-AUTH.md)
6. [Configuración de Base de Datos](./06-DATABASE.md)
7. [Guía de Despliegue](./07-DEPLOYMENT.md)

## 🎯 Principios de Diseño

Esta API sigue los siguientes principios:

### SOLID
- **S**ingle Responsibility: Cada clase tiene una sola responsabilidad
- **O**pen/Closed: Abierto para extensión, cerrado para modificación
- **L**iskov Substitution: Interfaces intercambiables
- **I**nterface Segregation: Interfaces pequeñas y específicas
- **D**ependency Inversion: Depender de abstracciones, no de implementaciones

### YAGNI (You Aren't Gonna Need It)
- Solo implementar funcionalidades necesarias
- No crear capas innecesarias de abstracción
- Evitar "gold plating" (sobreingeniería)

### KISS (Keep It Simple, Stupid)
- Código simple y legible
- Evitar complejidad innecesaria
- Preferir soluciones directas

### DRY (Don't Repeat Yourself)
- Reutilizar código común
- DTOs y extensiones compartidas
- Validaciones centralizadas

## 🛠️ Stack Tecnológico

- **Backend**: ASP.NET Core 8.0 (o superior)
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Entity Framework Core
- **Autenticación**: JWT Bearer Tokens
- **Documentación**: Swagger/OpenAPI

## 🚀 Inicio Rápido

```bash
# Crear el proyecto
dotnet new webapi -n PeluqueriaApi

# Agregar paquetes esenciales
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.EntityFrameworkCore.Design
```

Para más detalles, consulta [02-PROJECT-SETUP.md](./02-PROJECT-SETUP.md).
