# NexusAI Quick Start Guide

## ONE-COMMAND STARTUP

```bash
# 1. Start all infrastructure services
docker-compose up -d

# 2. Wait 30 seconds for services to initialize
sleep 30

# 3. Run database migrations (when TypeORM integration is complete)
# cd backend && npm run db:migration:run

# 4. Start NestJS backend
cd backend && npm run dev
```

## Verify Everything Works

```bash
# Health Check
curl http://localhost:3001/health

# PostgreSQL Connection
psql -h localhost -U nexusai -d nexusai -c "SELECT version();"

# Redis Connection
redis-cli -h localhost ping

# Milvus Vector DB
curl -X GET "http://localhost:19530/api/v1/health"
```

## Service Access Points

| Service | URL | Status |
|---------|-----|--------|
| **NestJS API** | http://localhost:3001 | ✅ Ready |
| **Grafana** | http://localhost:3000 | admin/admin |
| **Prometheus** | http://localhost:9090 | - |
| **PostgreSQL** | localhost:5432 | nexusai/nexusai_dev |
| **Redis** | localhost:6379 | - |
| **MongoDB** | localhost:27017 | nexusai/nexusai_dev |
| **Neo4j** | http://localhost:7474 | neo4j/nexusai_dev |
| **Milvus** | localhost:19530 | - |
| **MinIO Console** | http://localhost:9001 | minioadmin/minioadmin |
| **Ollama LLaMA** | http://localhost:11434 | - |

## Next Steps

### 1. Implement GL Entry (DONE ✅)
- Controller: `backend/src/modules/erp/gl-entry.controller.ts`
- Service: `backend/src/modules/erp/gl-entry.service.ts`
- Entity: `backend/src/modules/erp/entities/gl-entry.entity.ts`

Test it:
```bash
curl -X POST http://localhost:3001/api/erp/gl-entries \
  -H "Content-Type: application/json" \
  -d '{
    "journalDate": "2024-11-29",
    "description": "Test GL Entry",
    "debitAccount": "1000",
    "debitAmount": 1000,
    "creditAccount": "5100",
    "creditAmount": 1000
  }'
```

### 2. Implement EPM Module
- Budget controller + service
- Forecast controller + service
- Scenario controller + service

### 3. Implement CRM Module
- Lead controller + service
- Opportunity controller + service

### 4. Implement AI Service
- Connect to Ollama LLaMA
- Set up LangChain RAG
- Implement anomaly detection

### 5. Frontend Migration
- Keep React running during transition
- Gradually build Next.js pages
- Connect to new API endpoints

## Troubleshooting

### Port Already in Use
```bash
lsof -i :5432
kill -9 <PID>
```

### Docker Service Failed
```bash
docker-compose logs postgres
docker-compose up --build
```

### NestJS Build Errors
```bash
cd backend
npm install --legacy-peer-deps
npm run build
```

## Architecture

```
Frontend (React)          → API Gateway (Kong) → NestJS Backend
                                ↓
                        ┌───────┼───────┐
                        ↓       ↓       ↓
                      ERP    EPM     CRM
                        ↓       ↓       ↓
    ┌─────────────────────────────────────────────┐
    │ PostgreSQL | TimescaleDB | MongoDB | Neo4j  │
    └────────────┬──────────────────────┬─────────┘
                 ↓                      ↓
              Redis              Milvus + LLaMA
           (Cache/Queue)      (AI/Vector Search)
```

## Production Deployment

```bash
# 1. Build Docker image
docker build -t nexusai/api:latest backend/

# 2. Deploy to Kubernetes
kubectl apply -f infrastructure/kubernetes/

# 3. Verify pods
kubectl get pods -n nexusai
```

## Documentation

- **TECHSTACK.md** - Complete technology reference
- **MIGRATION_GUIDE.md** - Phase-by-phase implementation
- **IMPLEMENTATION_STATUS.md** - Current progress
- **docker-compose.yml** - Full infrastructure

---

**Status:** ✅ Foundation Ready | Backend Scaffold Complete | ERP GL Entry Implemented

**Next:** Run `docker-compose up -d && cd backend && npm run dev`
