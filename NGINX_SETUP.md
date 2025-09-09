# Nginx Reverse Proxy Setup

This project now includes nginx as a reverse proxy to provide a unified entry point for all services.

## Architecture

```
Internet → Nginx (Port 80) → Backend (Port 8000)
                           → Frontend (Port 3000)
```

## Benefits

- **Single Entry Point**: Access everything through port 80
- **Load Balancing**: Ready for multiple backend/frontend instances
- **Security**: Rate limiting, security headers, and hidden service ports
- **Performance**: Gzip compression and static asset caching
- **SSL Ready**: Easy to add HTTPS support

## Quick Start

### Development Mode (Recommended)
```bash
# Start with nginx proxy + direct service access for debugging
./scripts/nginx-setup.sh dev

# Or use docker-compose directly
docker-compose up -d
```

**Access URLs:**
- Main Application: http://localhost
- Backend API: http://localhost:8000 (direct access)
- Frontend: http://localhost:3091 (direct access)
- Health Check: http://localhost/health

### Production Mode
```bash
# Start with only nginx exposed
./scripts/nginx-setup.sh prod

# Or use docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Access URLs:**
- Main Application: http://localhost
- Health Check: http://localhost/health

## Configuration Files

### Nginx Configuration
- `nginx/nginx.conf` - Main nginx configuration
- Includes rate limiting, security headers, and gzip compression
- Routes `/api/*` to backend, everything else to frontend

### Docker Compose Files
- `docker-compose.yml` - Base configuration with nginx
- `docker-compose.override.yml` - Development overrides (auto-loaded)
- `docker-compose.prod.yml` - Production configuration

### Frontend API Configuration
- `frontend/app/lib/config.ts` - Smart API URL resolution
- Automatically detects browser vs server environment
- Uses nginx proxy in production, direct access in development

### Environment Variables
```bash
# Nginx
NGINX_PORT=80                           # External nginx port

# Frontend API URLs
NEXT_PUBLIC_API_URL=http://localhost    # Public API URL (via nginx)
NEXT_PUBLIC_API_URL_DEV=http://localhost:8000  # Development direct access
INTERNAL_API_URL=http://backend:8000    # Internal container-to-container URL
```

## Service Management

```bash
# Start development environment
./scripts/nginx-setup.sh dev

# Start production environment
./scripts/nginx-setup.sh prod

# Stop all services
./scripts/nginx-setup.sh stop

# Check service status
./scripts/nginx-setup.sh status

# View nginx logs
./scripts/nginx-setup.sh logs

# Restart services
./scripts/nginx-setup.sh restart
```

## Security Features

- **Rate Limiting**: 10 req/s for API, 30 req/s for web
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Hidden Services**: Backend/frontend not directly accessible in production
- **Server Tokens**: Nginx version hidden

## Performance Features

- **Gzip Compression**: Automatic compression for text assets
- **Static Asset Caching**: 1-year cache for images, fonts, etc.
- **Connection Pooling**: Efficient upstream connections

## SSL/HTTPS Setup (Future)

To add SSL support:

1. Obtain SSL certificates
2. Update `docker-compose.prod.yml` to mount certificates
3. Update `nginx/nginx.conf` to include SSL configuration
4. Change `NEXT_PUBLIC_API_URL` to use https://

## Troubleshooting

### Service Won't Start
```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs nginx
docker-compose logs backend
docker-compose logs frontend
```

### Can't Access Application
1. Verify nginx is running: `docker-compose ps nginx`
2. Check nginx logs: `./scripts/nginx-setup.sh logs`
3. Test backend health: `curl http://localhost/health`

### Port Conflicts
- Change `NGINX_PORT` in `.env` if port 80 is in use
- In development, direct service ports can also be changed

## Monitoring

The nginx configuration includes:
- Access logs: `/var/log/nginx/access.log`
- Error logs: `/var/log/nginx/error.log`
- Health check endpoint: `/health`

View logs with:
```bash
docker-compose logs nginx
```
