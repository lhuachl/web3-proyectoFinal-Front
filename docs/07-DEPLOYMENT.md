# 🚀 Guía de Despliegue

## Opciones de Despliegue

| Plataforma | Costo | Dificultad | Recomendado para |
|------------|-------|------------|------------------|
| Azure App Service | $$ | Fácil | Producción empresarial |
| Railway | $ | Muy fácil | Proyectos pequeños/medianos |
| Render | $ | Muy fácil | Proyectos pequeños |
| Docker + VPS | $ | Media | Control total |

## Preparación para Producción

### 1. Configurar appsettings.Production.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "tu-api.azurewebsites.net",
  "Cors": {
    "AllowedOrigins": [
      "https://tu-frontend.vercel.app",
      "https://tu-dominio.com"
    ]
  }
}
```

### 2. Variables de Entorno de Producción

```bash
# Requeridas
ConnectionStrings__DefaultConnection="Host=db.xxx.supabase.co;..."
Jwt__Key="TuClaveSecretaDeProduccion64CaracteresMinimo"
Jwt__Issuer="PeluqueriaApi"
Jwt__Audience="PeluqueriaWeb"

# Opcionales
ASPNETCORE_ENVIRONMENT="Production"
```

### 3. Publicar Aplicación

```bash
# Publicar para producción
dotnet publish -c Release -o ./publish

# El resultado estará en ./publish
```

---

## Despliegue en Azure App Service

### Usando Azure CLI

```bash
# Login
az login

# Crear grupo de recursos
az group create --name peluqueria-rg --location eastus

# Crear App Service Plan (F1 = gratis)
az appservice plan create \
  --name peluqueria-plan \
  --resource-group peluqueria-rg \
  --sku F1 \
  --is-linux

# Crear Web App
az webapp create \
  --name peluqueria-api \
  --resource-group peluqueria-rg \
  --plan peluqueria-plan \
  --runtime "DOTNET|8.0"

# Configurar variables de entorno
az webapp config appsettings set \
  --name peluqueria-api \
  --resource-group peluqueria-rg \
  --settings \
    ConnectionStrings__DefaultConnection="Host=db.xxx.supabase.co;..." \
    Jwt__Key="TuClaveSecreta..."

# Desplegar
az webapp deployment source config-zip \
  --name peluqueria-api \
  --resource-group peluqueria-rg \
  --src ./publish.zip
```

### Usando Visual Studio / VS Code

1. Click derecho en proyecto → Publish
2. Seleccionar Azure → Azure App Service
3. Configurar y publicar

---

## Despliegue en Railway

### 1. Archivo railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "numReplicas": 1,
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 2. Dockerfile

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["PeluqueriaApi.csproj", "./"]
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "PeluqueriaApi.dll"]
```

### 3. Desplegar

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Desplegar
railway up

# Configurar variables
railway variables set ConnectionStrings__DefaultConnection="..."
railway variables set Jwt__Key="..."
```

---

## Despliegue con Docker

### Docker Compose (Desarrollo local)

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: ./src/PeluqueriaApi
      dockerfile: Dockerfile
    ports:
      - "5000:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=db.xxx.supabase.co;...
      - Jwt__Key=TuClaveSecretaLocal
      - Jwt__Issuer=PeluqueriaApi
      - Jwt__Audience=PeluqueriaWeb
    restart: unless-stopped
```

### Comandos Docker

```bash
# Construir imagen
docker build -t peluqueria-api .

# Ejecutar contenedor
docker run -d \
  --name peluqueria-api \
  -p 5000:8080 \
  -e ConnectionStrings__DefaultConnection="Host=..." \
  -e Jwt__Key="..." \
  peluqueria-api

# Ver logs
docker logs -f peluqueria-api
```

---

## Health Check Endpoint

Agregar endpoint de salud para monitoreo:

```csharp
// Program.cs
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));
```

---

## Configuración de HTTPS

### En Producción (Recomendado)

```csharp
// Program.cs
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
app.UseHttpsRedirection();
```

### Certificado SSL

- **Azure**: Automático con dominio .azurewebsites.net
- **Railway/Render**: Automático
- **VPS**: Usar Certbot con Let's Encrypt

---

## Monitoreo y Logs

### Application Insights (Azure)

```bash
dotnet add package Microsoft.ApplicationInsights.AspNetCore
```

```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry();
```

### Logging Básico

```csharp
// Configurado por defecto en ASP.NET Core
app.Logger.LogInformation("API iniciada");
```

---

## Checklist de Producción

- [ ] Variables de entorno configuradas
- [ ] JWT Key seguro (64+ caracteres)
- [ ] CORS configurado solo para dominios permitidos
- [ ] HTTPS habilitado
- [ ] Logs configurados
- [ ] Health check funcionando
- [ ] Base de datos migrada
- [ ] Datos de prueba eliminados
- [ ] Swagger deshabilitado en producción (opcional)

```csharp
// Solo Swagger en desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

---

## Actualizar el Frontend

Una vez desplegada la API, actualizar el frontend:

```bash
# .env.local o .env.production
VITE_API_URL=https://tu-api.azurewebsites.net/api
```

Y redesplegar el frontend.
