# Architecture Diagrams

This directory contains architecture diagrams for NexusAIFirst ERP.

## Available Diagrams

### System Architecture
- [system-overview.md](./system-overview.md) - High-level system overview

### Component Diagrams
- Module relationships
- Data flow diagrams
- Integration architecture

### Database Schema
- Entity relationship diagrams
- Data model documentation

---

## Diagram Formats

Diagrams are created using:
- ASCII art (for inline documentation)
- Mermaid (for GitHub rendering)
- PlantUML (for detailed technical diagrams)

---

## Adding New Diagrams

1. Create diagram file in this directory
2. Use Mermaid syntax for GitHub compatibility
3. Update this README with the new diagram link

---

## Main Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React + TypeScript + Vite                   │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│   │
│  │  │  CRM   │ │Finance │ │   HR   │ │ Supply │ │  More  ││   │
│  │  │ Module │ │ Module │ │ Module │ │ Chain  │ │Modules ││   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘│   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Express.js + REST API                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │   Auth   │ │  Rate    │ │Validation│ │  Audit   │   │   │
│  │  │Middleware│ │ Limiter  │ │Middleware│ │  Logger  │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC ENGINES                        │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │ GL Engine │ │ Workflow  │ │ Approval  │ │Notification│       │
│  │           │ │  Engine   │ │  Engine   │ │  Engine    │       │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │  Rules    │ │ Analytics │ │ Template  │ │ Migration  │       │
│  │  Engine   │ │  Engine   │ │  Engine   │ │  Engine    │       │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA PERSISTENCE                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL + Drizzle ORM                    │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────┐ │   │
│  │  │   Form Data    │  │   User/Auth    │  │   Audit    │ │   │
│  │  │     Store      │  │    Tables      │  │    Logs    │ │   │
│  │  └────────────────┘  └────────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

*For detailed architecture documentation, see [../README.md](../README.md)*
