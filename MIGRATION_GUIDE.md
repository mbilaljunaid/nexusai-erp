# NexusAI Techstack Migration Guide

## Phase 1: Foundation Setup (Current)

### What's Been Created

1. **NestJS Backend Scaffold** ✅
   - Located in `backend/src/`
   - Modular structure: Auth, ERP, EPM, CRM, HR, AI modules
   - Health check endpoint at `/health`
   - Global exception filter + validation pipes
   - JWT authentication setup

2. **Docker Compose Full Stack** ✅
   - PostgreSQL 16 (port 5432)
   - Redis 7 (port 6379)
   - Milvus vector DB (port 19530)
   - MinIO S3-compatible storage (port 9000)
   - MongoDB 7 (port 27017)
   - Neo4j 5 (port 7687)
   - Ollama for LLaMA inference (port 11434)
   - Prometheus for metrics (port 9090)
   - Grafana for dashboards (port 3000)

3. **Kubernetes Infrastructure** ✅
   - Namespace configuration
   - API deployment (3 replicas)
   - PostgreSQL deployment with persistent volumes
   - Service definitions
   - Health checks and resource limits

4. **Environment Configuration** ✅
   - `.env.example` with all service configs
   - Database credentials
   - LLM configuration
   - API settings

### Getting Started

#### 1. Start All Services Locally

```bash
# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Verify services
docker-compose ps

# View logs
docker-compose logs -f
```

#### 2. Initialize Databases

```bash
# PostgreSQL (runs on startup)
# MongoDB (runs on startup)
# Redis (runs on startup)

# Initialize Milvus
# Connect via Python or Ollama client

# Download LLaMA model
curl http://localhost:11434/api/pull -d '{"name": "llama2"}'
```

#### 3. Run NestJS Backend

```bash
cd backend
npm install
npm run dev
```

Backend will start on http://localhost:3001

#### 4. Run Next.js Frontend (Phase 2)

```bash
# Create from current React app
npx create-next-app@latest frontend --typescript --tailwind
```

### Service Access

| Service | URL | Credentials |
|---------|-----|-------------|
| PostgreSQL | localhost:5432 | nexusai / nexusai_dev |
| Redis | localhost:6379 | - |
| MongoDB | localhost:27017 | nexusai / nexusai_dev |
| Neo4j | localhost:7474 | neo4j / nexusai_dev |
| Milvus | localhost:19530 | - |
| MinIO Console | localhost:9001 | minioadmin / minioadmin |
| Ollama | localhost:11434 | - |
| Prometheus | localhost:9090 | - |
| Grafana | localhost:3000 | admin / admin |

---

## Phase 2: Backend Development

### 1. Implement ERP Module

```typescript
// backend/src/modules/erp/gl-entry.controller.ts
@Controller('api/erp/gl-entry')
export class GLEntryController {
  @Post()
  createGLEntry(@Body() dto: CreateGLEntryDto) {
    // Implementation
  }
}
```

### 2. Implement AI Service

```typescript
// backend/src/modules/ai/ai.service.ts
@Injectable()
export class AIService {
  constructor(private readonly langchain: LangChainService) {}
  
  async analyzeGLEntry(entry: GLEntry) {
    // Use LangChain + LLaMA for anomaly detection
  }
}
```

### 3. Implement Job Queue

```typescript
// backend/src/common/jobs/approval.job.ts
@Processor('approvals')
export class ApprovalProcessor {
  @Process('send-notification')
  async sendNotification(job: Job) {
    // Send approval notifications
  }
}
```

---

## Phase 3: Frontend Migration (Next Steps)

### Migrate React → Next.js

```bash
# Create Next.js app in frontend/ directory
# Copy components from client/src/
# Update routing from Wouter to Next.js Link
# Migrate API calls to /api routes
```

---

## Phase 4: AI/ML Integration

### 1. Vector Database Setup

```python
# Python script to populate Milvus
from milvus import connections
from sentence_transformers import SentenceTransformer

# Connect to Milvus
connections.connect(host="localhost", port=19530)

# Generate embeddings for knowledge base
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(documents)
```

### 2. Fine-tune LLaMA

```bash
# Download base model
ollama pull llama2

# Create custom model
ollama create nexusai-erp --from llama2

# Fine-tune on domain data
# (Training pipeline via Prefect)
```

---

## Phase 5: Production Deployment

### Deploy to Kubernetes

```bash
# Set up K8s cluster (AWS EKS, GKE, AKS)
# Apply manifests
kubectl apply -f infrastructure/kubernetes/

# Verify deployments
kubectl get deployments -n nexusai

# Port forward to test
kubectl port-forward svc/nexusai-api 3001:80 -n nexusai
```

### Set up CI/CD

```bash
# Create GitHub Actions workflow
# Build Docker images
# Push to registry
# Deploy to K8s via ArgoCD
```

---

## Architecture Decisions Made

### Why NestJS?
- ✅ Enterprise-grade architecture
- ✅ Modular & scalable
- ✅ Built-in dependency injection
- ✅ Microservices-ready

### Why Milvus?
- ✅ Distributed vector DB
- ✅ GPU acceleration
- ✅ Scales to billions of vectors
- ✅ Open-source & self-hosted

### Why Docker Compose for Dev?
- ✅ All services in one command
- ✅ Mimics production environment
- ✅ Easy to tear down
- ✅ Perfect for local development

---

## Testing the Setup

### 1. Health Check
```bash
curl http://localhost:3001/health
# Response: {"status":"ok","timestamp":"..."}
```

### 2. Database Connection
```bash
psql -h localhost -U nexusai -d nexusai
# Should connect successfully
```

### 3. Vector DB
```python
from pymilvus import connections
connections.connect(host="localhost", port=19530)
print(connections.get_connection_info())
```

### 4. LLaMA Inference
```bash
curl http://localhost:11434/api/generate -d '{"model":"llama2","prompt":"Hello"}'
```

---

## Next Immediate Steps

1. **Install backend dependencies**
   ```bash
   cd backend && npm install
   ```

2. **Initialize databases**
   ```bash
   docker-compose exec postgres psql -U nexusai -d nexusai -f init.sql
   ```

3. **Start NestJS dev server**
   ```bash
   cd backend && npm run dev
   ```

4. **Begin implementing ERP module**

5. **Connect frontend to new API endpoints**

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5432

# Kill process
kill -9 <PID>
```

### Docker Service Not Starting
```bash
# Check logs
docker-compose logs postgres

# Rebuild
docker-compose up --build
```

### Permission Denied on Volume
```bash
# Fix permissions
sudo chown -R $USER:$USER ./infrastructure
```

---

## Next Documentation

See `TECHSTACK.md` for complete technology reference.
See `TECHSTACK_MIGRATION.md` for phased migration timeline.

---

**Status:** Phase 1 Complete ✅  
**Next:** Backend development begins
