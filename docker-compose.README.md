# Docker Compose Deployment Guide

This directory contains several Docker Compose configurations for different deployment scenarios.

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Set your USPTO API key:**
   ```bash
   echo "USPTO_API_KEY=your_actual_api_key_here" > .env
   ```

3. **Run the service:**
   ```bash
   docker-compose up -d
   ```

## Available Configurations

### 1. `docker-compose.yml` - Standard Deployment
**Use for:** Production-ready single container deployment

```bash
# Start the service
docker-compose up -d

# View logs
docker-compose logs -f trademark-mcp-server

# Stop the service
docker-compose down
```

**Features:**
- Uses pre-built image from GitHub Container Registry
- Health checks with automatic restart
- Proper networking configuration
- Production-ready settings

### 2. `docker-compose.dev.yml` - Development
**Use for:** Local development and testing

```bash
# Build and run development version
docker-compose -f docker-compose.dev.yml up -d --build

# View real-time logs
docker-compose -f docker-compose.dev.yml logs -f
```

**Features:**
- Builds image locally from source
- Development environment variables
- Volume mounts for logs
- Fast rebuilding for development

### 3. `docker-compose.prod.yml` - Production with Nginx
**Use for:** Production deployment with reverse proxy

```bash
# Deploy production stack
docker-compose -f docker-compose.prod.yml up -d

# Check all services
docker-compose -f docker-compose.prod.yml ps
```

**Features:**
- Nginx reverse proxy with CORS support
- Resource limits and logging configuration
- SSL/HTTPS support (commented out, ready to enable)
- Production-optimized settings

## Environment Configuration

Create a `.env` file with your configuration:

```bash
# Required
USPTO_API_KEY=your_uspto_api_key_here

# Optional
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

## Health Monitoring

All configurations include health checks:

```bash
# Check service health
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0",
  "service": "trademark-mcp-server"
}
```

## Production Deployment

### With Nginx Reverse Proxy

1. **Configure SSL (optional):**
   ```bash
   mkdir ssl
   # Add your cert.pem and key.pem files to ssl/
   ```

2. **Update nginx.conf:**
   - Uncomment HTTPS server block
   - Set your domain name
   - Configure SSL certificate paths

3. **Deploy:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Resource Management

The production configuration includes resource limits:
- **Memory**: 512MB limit, 256MB reservation
- **CPU**: 0.5 cores limit, 0.25 cores reservation
- **Logging**: 10MB max file size, 3 file rotation

## Scaling

Scale the service for high availability:

```bash
# Scale to 3 replicas
docker-compose up -d --scale trademark-mcp-server=3

# With nginx load balancing (production config)
docker-compose -f docker-compose.prod.yml up -d --scale trademark-mcp-server=3
```

## Troubleshooting

### Common Issues

1. **Container won't start:**
   ```bash
   # Check logs
   docker-compose logs trademark-mcp-server
   
   # Check environment variables
   docker-compose exec trademark-mcp-server env | grep USPTO
   ```

2. **API key issues:**
   ```bash
   # Verify API key is set
   docker-compose exec trademark-mcp-server sh -c 'echo $USPTO_API_KEY'
   
   # Test API connectivity
   curl "http://localhost:3000/health"
   ```

3. **Health check failures:**
   ```bash
   # Check container health
   docker-compose ps
   
   # Manual health check
   docker-compose exec trademark-mcp-server wget -qO- http://localhost:3000/health
   ```

### Log Management

```bash
# View live logs
docker-compose logs -f

# View logs for specific service
docker-compose logs trademark-mcp-server

# Export logs
docker-compose logs --no-color > trademark-server.log
```

## Custom Networks

All configurations use custom networks for isolation:
- `trademark-mcp-network` (standard)
- `trademark-mcp-dev-network` (development)
- `trademark-mcp-prod-network` (production)

## Security Considerations

1. **API Key Security:**
   - Never commit `.env` files to version control
   - Use Docker secrets in production swarm mode
   - Rotate API keys regularly

2. **Network Security:**
   - Use custom networks for service isolation
   - Enable firewall rules for external access
   - Consider VPN access for administrative endpoints

3. **Container Security:**
   - Images run as non-root user
   - Resource limits prevent resource exhaustion
   - Health checks ensure service availability

## Integration Examples

### With Traefik (Alternative to Nginx)

```yaml
version: '3.8'
services:
  trademark-mcp-server:
    image: ghcr.io/jordanburke/trademark-mcp-server:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.trademark.rule=Host(`trademark.yourdomain.com`)"
      - "traefik.http.routers.trademark.tls=true"
      - "traefik.http.routers.trademark.tls.certresolver=letsencrypt"
```

### With Docker Swarm

```bash
# Deploy to swarm
docker stack deploy -c docker-compose.prod.yml trademark-stack

# Scale services
docker service scale trademark-stack_trademark-mcp-server=3
```