# Docker Setup para PISA Job Application

## Arquitectura

La aplicación está dividida en 3 servicios principales:

1. **PostgreSQL** - Base de datos
2. **FastAPI** - API de predicciones de ML (Puerto 8000)
3. **Next.js** - Frontend y API routes (Puerto 3000)

## Configuración Rápida

### 1. Usando Docker Compose (Recomendado)

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

### 2. Construcción Individual

#### FastAPI Service
```bash
# Construir imagen
docker build -f Dockerfile.fastapi -t pisa-fastapi .

# Ejecutar contenedor
docker run -p 8000:8000 pisa-fastapi
```

#### Next.js App
```bash
# Construir imagen
docker build -t pisa-nextjs .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e FASTAPI_URL=http://fastapi-service:8000 \
  -e DATABASE_URL=postgresql://postgres:password@postgres:5432/pisa_db \
  pisa-nextjs
```

## Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

### Variables importantes para Docker:

- `FASTAPI_URL`: URL del servicio FastAPI (http://fastapi-service:8000 en Docker)
- `DATABASE_URL`: URL de PostgreSQL
- `NEXT_PUBLIC_APP_URL`: URL pública de la aplicación

## Consideraciones Importantes

### 1. Modelo de ML
- El archivo `scripts/PisaModel.pkl` debe estar presente
- Asegúrate de que todas las dependencias estén en `requirements.txt`
- El modelo requiere XGBoost: `pip install xgboost`

### 2. Volúmenes
- Los scripts de Python se montan como volumen de solo lectura
- Los datos de PostgreSQL se persisten en un volumen nombrado

### 3. Health Checks
- FastAPI: `GET /health`
- PostgreSQL: `pg_isready`
- Next.js depende de que ambos servicios estén saludables

### 4. Networking
- Los servicios se comunican a través de la red interna de Docker
- Solo los puertos necesarios están expuestos al host

## Troubleshooting

### FastAPI no se conecta
```bash
# Verificar logs del servicio FastAPI
docker-compose logs fastapi-service

# Verificar que el modelo se carga correctamente
docker-compose exec fastapi-service python -c "import joblib; print('OK')"
```

### Next.js no puede conectar a FastAPI
```bash
# Verificar conectividad de red
docker-compose exec nextjs-app curl http://fastapi-service:8000/health
```

### Base de datos
```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U postgres -d pisa_db

# Ejecutar migraciones
docker-compose exec nextjs-app npx prisma migrate deploy
```

## Producción

Para producción, considera:

1. **Usar secretos** para credenciales de base de datos
2. **Configurar reverse proxy** (nginx) para SSL
3. **Usar imágenes multi-stage** para reducir tamaño
4. **Configurar logging** centralizado
5. **Implementar monitoring** y alertas
6. **Usar orchestrador** como Kubernetes para escalabilidad

### Ejemplo con nginx:

```yaml
# Agregar a docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
  depends_on:
    - nextjs-app
