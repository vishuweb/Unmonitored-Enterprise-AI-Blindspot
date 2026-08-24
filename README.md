# ControlPlane.ai

> **Real-Time Runtime Governance and Observability for Enterprise AI**

ControlPlane.ai is a model-agnostic, zero-overhead inline runtime control layer positioned between enterprise applications and downstream Large Language Models (LLMs). It intercepts requests and responses in real time, evaluates them concurrently across three specialized engines (**Performance**, **Cost**, and **Responsibility**), and enforces deterministic automated governance decisions: **ALLOW**, **BLOCK**, **EDIT**, or **ESCALATE**.

```text
Enterprise Application (Support Bot / Internal Copilot / Autonomous Agent)
                                   ↓
                         [ ControlPlane.ai Proxy ]
        ┌──────────────────────────┼──────────────────────────┐
        ↓                          ↓                          ↓
[ Performance Engine ]      [ Cost Engine ]       [ Responsibility Engine ]
  • Faithfulness              • Semantic Cache       • PII Detection & Redact
  • Hallucination Risk        • Dynamic Routing      • Injection / Jailbreak
  • Grounding Quality         • Token Accounting     • Brand Safety & Policy
        └──────────────────────────┬──────────────────────────┘
                                   ↓
             Governance Decision: ALLOW | BLOCK | EDIT | ESCALATE
                                   ↓
                       Downstream LLM / Output
```

---

## Table of Contents

1. [The Problem: The Unmonitored Enterprise AI Blindspot](#the-problem-the-unmonitored-enterprise-ai-blindspot)
2. [The Solution: Real-Time Runtime Control Layer](#the-solution-real-time-runtime-control-layer)
3. [Core Architecture & Topology](#core-architecture--topology)
4. [The Three Evaluation Engines](#the-three-evaluation-engines)
5. [Decision System (ALLOW, BLOCK, EDIT, ESCALATE)](#decision-system)
6. [Request Lifecycle & 10-Stage Pipeline](#request-lifecycle--10-stage-pipeline)
7. [Project Structure & File Map](#project-structure--file-map)
8. [Feature Map & Application Surfaces](#feature-map--application-surfaces)
9. [State Management & Data Flow](#state-management--data-flow)
10. [Domain Models & TypeScript Types](#domain-models--typescript-types)
11. [Running the Project](#running-the-project)
12. [Environment Variables](#environment-variables)
13. [Developer & Extension Guides](#developer--extension-guides)
    - [How to Add a New Demo Scenario](#how-to-add-a-new-demo-scenario)
    - [How to Add or Modify a Policy Rule](#how-to-add-or-modify-a-policy-rule)
    - [How to Modify the Runtime Evaluation Engine](#how-to-modify-the-runtime-evaluation-engine)
14. [Debugging & Troubleshooting Guide](#debugging--troubleshooting-guide)
15. [Testing Strategy](#testing-strategy)
16. [2-Minute Hackathon Demo Script](#2-minute-hackathon-demo-script)
17. [Current Limitations & Known Simulation Scope](#current-limitations--known-simulation-scope)
18. [Production Roadmap](#production-roadmap)

---

## The Problem: The Unmonitored Enterprise AI Blindspot

Enterprise GenAI adoption is accelerating, but conventional observability tools primarily monitor infrastructure-level metrics such as uptime, API availability, and token latency.

This leaves organizations blind to **semantic and runtime failures**:
* **Confidently Wrong Outputs (Hallucinations)**: Models fabricating legal citations, financial figures, or ungrounded claims without warning.
* **Sensitive PII / PHI Leakage**: Unprotected Aadhaar, SSN, credit cards, or internal credentials passed directly into third-party cloud models.
* **Prompt Injections & Jailbreaks**: Malicious users exploiting system prompts to bypass corporate security boundaries.
* **Cost Opacity & GPU Waste**: Repetitive queries triggering redundant premium LLM inference rather than cache hits.
* **Uncontrolled Autonomous Actions**: High-risk financial or database commands executed without human authorization.

```text
POST-HOC OBSERVABILITY (Traditional APM)
→ Detects operational failures AFTER bad outputs reach the user or database.

REAL-TIME RUNTIME CONTROL (ControlPlane.ai)
→ Intercepts, inspects, redacts, routes, and blocks BEFORE downstream model or user exposure.
```

---

## The Solution: Real-Time Runtime Control Layer

ControlPlane.ai sits as an inline proxy between the client application and downstream LLM APIs. Every incoming prompt and outgoing response passes through three deterministic evaluation engines:

1. **Responsibility Engine**: Inspects for sensitive PII entities (Aadhaar, SSN, Credit Cards, API Keys) and applies automated redactions. Analyzes prompt syntax for jailbreaks and verifies compliance against active security rules.
2. **Cost Engine**: Performs vector similarity lookups against an in-memory Semantic Cache (yielding 0ms downstream inference on hits). Dynamically routes requests between model tiers (e.g., GPT-4o vs. GPT-4o-mini) based on computed prompt complexity.
3. **Performance Engine**: Uses deterministic Small Language Model (SLM) grounding checks to verify faithfulness against enterprise source facts, scoring hallucination likelihood before delivery.

---

## Core Architecture & Topology

```mermaid
flowchart TD
    Client[Enterprise Application / Client] -->|1. Inbound Request| Runtime[src/engine/runtimePipeline.ts]

    subgraph Engines [Three Parallel Evaluation Engines]
        direction TB
        Resp[src/engine/responsibility.ts
• PII Redaction
• Injection Heuristics
• Brand Safety]
        Cost[src/engine/cost.ts
• Semantic Cache Lookup
• Complexity Router
• Spend Estimator]
        Perf[src/engine/performance.ts
• Faithfulness Scorer
• Hallucination Risk
• SLM Grounding Check]
    end

    Runtime --> Resp
    Runtime --> Cost
    Runtime --> Perf

    Resp --> Decider{Governance Decision Engine}
    Cost --> Decider
    Perf --> Decider

    Decider -->|ALLOW / EDIT| LLM[Downstream LLM Inference]
    Decider -->|BLOCK| Blocked[Blocked Response + Explainability Dossier]
    Decider -->|ESCALATE| Queue[src/pages/ReviewQueuePage.tsx]

    Decider --> Store[src/context/ControlPlaneContext.tsx]
    Store --> Observability[src/pages/ObservabilityPage.tsx]
    Store --> Audit[src/pages/AuditLogsPage.tsx]
```

---

## The Three Evaluation Engines

### 1. Responsibility Engine (`src/engine/responsibility.ts`)
* **Purpose**: Safeguard data privacy, prevent prompt injection, and enforce brand safety boundaries.
* **Input**: Inbound prompt string.
* **Processing**:
  * Regex pattern matchers for Indian Aadhaar (`[2-9]{1}[0-9]{3}[\s-]?[0-9]{4}[\s-]?[0-9]{4}`), US SSN, credit cards, and secret API keys (`sk-...`, `ghp_...`).
  * Structural heuristic inspection for system prompt leak vectors, "DAN" roleplay escapes, and encoded bypass payloads.
  * Brand safety and unauthorized exploit vulnerability detection.
* **Output**: `ResponsibilityEvaluation` object with sanitized prompt string, list of redacted entities, prompt injection score ($0-100$), and engine status (`PASSED`, `INTERVENED`, `BLOCKED`).
* **Implementation Mode**: Fully functional deterministic regex and structural heuristic engine.

### 2. Cost Engine (`src/engine/cost.ts`)
* **Purpose**: Prevent unnecessary inference spend and optimize latency via semantic caching and dynamic routing.
* **Input**: Prompt string, selected target model, and prompt complexity score.
* **Processing**:
  * Semantic Cache vector match simulation against canonical enterprise FAQ entries (similarity threshold $\ge 88\%$).
  * Complexity tiering: routes low-complexity prompts ($< 35/100$) from expensive tiers (`GPT-4o`) to lightweight tiers (`GPT-4o-mini`).
  * Token estimation ($pprox 	ext{chars} / 3.8$) and pricing calculation comparing cost *Without ControlPlane* vs. *With ControlPlane*.
* **Output**: `CostEvaluation` object containing cache status, routed model, routing reason, and dollar/percentage savings.
* **Implementation Mode**: Deterministic pricing matrix, token estimator, and similarity cache store.

### 3. Performance Engine (`src/engine/performance.ts`)
* **Purpose**: Prevent confidently wrong outputs and hallucinated assertions from reaching end users.
* **Input**: Prompt string, downstream model response, and scenario category tag.
* **Processing**:
  * Faithfulness scoring ($0-100\%$) and hallucination risk calculation.
  * Deterministic SLM verification detecting non-existent statutory references (e.g., California non-compete clauses) and ambiguous financial disbursements.
* **Output**: `PerformanceEvaluation` object containing grounding confidence, response quality score, and SLM verification rationale.
* **Implementation Mode**: Deterministic grounding and fact-checking simulation engine.

---

## Decision System

Every evaluation generates an explainable governance action:

| Decision | Trigger Condition | UI & Runtime Consequence | Downstream Effect |
| :--- | :--- | :--- | :--- |
| **`ALLOW`** | All 3 engines pass thresholds; no critical security or compliance violations. | Green badge in Sandbox; passes directly to model inference or returns Semantic Cache entry. | Downstream model executed or cache result returned; telemetry logged. |
| **`BLOCK`** | Prompt injection detected ($\ge 65/100$) or brand safety / exploit rule triggered. | Rose badge in Sandbox; shows triggered policy (e.g., `Prompt Injection Guard v4.1`) and factor weights. | **Downstream inference is halted immediately (0ms LLM latency)**; event marked blocked in Audit log. |
| **`EDIT`** | Sensitive PII (Aadhaar, SSN, API key) detected in unmasked request. | Cyan badge in Sandbox; shows detected entity locations and masked tokens. | **Payload is sanitized/redacted before reaching downstream model**; clean response delivered. |
| **`ESCALATE`** | Low faithfulness grounding ($< 70\%$) or high-impact financial action requested. | Purple badge in Sandbox; warning emitted; incident automatically enqueued in Human Review. | **Item pushed to `reviewQueue` state**; held until human operator approves, rejects, or edits. |

---

## Request Lifecycle & 10-Stage Pipeline

When a request is submitted in `src/pages/SandboxPage.tsx`, the orchestrator in `src/engine/runtimePipeline.ts` executes the following synchronous/asynchronous lifecycle:

```text
1. [RECEIVED]            → Normalizes payload, validates JSON structure and tenant credentials.
2. [PII_CHECK]           → ResponsibilityEngine scans & redacts Aadhaar, SSN, Credit Cards, Keys.
3. [INJECTION_GUARD]     → ResponsibilityEngine scores prompt injection & jailbreak heuristics.
4. [POLICY_EVAL]         → Evaluates active policies from DEFAULT_POLICIES and local store.
5. [RISK_SCORING]        → Synthesizes composite risk score (0 - 100) from engine risk factors.
6. [CACHE_LOOKUP]        → CostEngine evaluates Semantic Cache vector index for matching queries.
7. [ROUTING]             → CostEngine evaluates prompt complexity to route to the optimal model tier.
8. [INFERENCE]           → Executes downstream LLM generation (or bypasses if blocked / cached).
9. [HALLUCINATION_CHECK] → PerformanceEngine executes SLM grounding verification on output claims.
10. [DECISION_FINAL]     → Synthesizes final decision (ALLOW/BLOCK/EDIT/ESCALATE), emits telemetry
                           to global state, logs SHA-256 audit record, and enqueues to Review if needed.
```

---

## Project Structure & File Map

```text
├── .gitignore                           # Git ignore rules (node_modules, dist, .env, IDE files, OS files)
├── package.json                         # Project dependencies, build scripts, and metadata
├── vite.config.ts                       # Vite bundler config with /api proxy to backend server
├── tsconfig.json                        # Strict TypeScript compiler options
├── tsconfig.node.json                   # TypeScript config for Vite/Node tooling
├── tailwind.config.js                   # Custom dark enterprise palette and utility classes
├── postcss.config.js                    # PostCSS config (Tailwind + Autoprefixer)
├── index.html                           # Single-page app HTML entry point
│
├── server/
│   └── index.ts                         # Express backend: REST API gateway (health, proxy, policies, reviews, audit, metrics)
│
└── src/
    ├── main.tsx                         # React 18 bootstrap with ControlPlaneProvider wrapper
    ├── App.tsx                          # App shell rendering layout, header, demo banner, and active tab
    ├── index.css                        # Tailwind directives and custom UI utility classes (.surface, .badge)
    ├── vite-env.d.ts                    # Vite client TypeScript ambient declarations
    │
    ├── types/
    │   └── index.ts                     # Centralized domain models and TypeScript interfaces
    │
    ├── engine/
    │   ├── responsibility.ts            # Responsibility Engine (PII regex, prompt injection heuristics)
    │   ├── cost.ts                      # Cost Engine (Semantic Cache, model routing, pricing matrix)
    │   ├── performance.ts               # Performance Engine (Faithfulness, hallucination, SLM grounding)
    │   ├── runtimePipeline.ts           # 10-Stage Pipeline orchestrator and stage lifecycle manager
    │   ├── defaultPolicies.ts           # 7 default enterprise governance rules and thresholds
    │   └── scenarios.ts                 # 8 preset scenarios covering compliant, attack, PII, and cache queries
    │
    ├── services/
    │   └── api.ts                       # API client abstraction for backend endpoints (with offline fallback)
    │
    ├── context/
    │   ├── ControlPlaneContext.tsx      # Unified React State Context with backend sync + localStorage fallback
    │   └── seedData.ts                  # Seed telemetry runtime events and initial human review queue items
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx              # Enterprise navigation bar with live review badge count
    │   │   ├── Header.tsx               # Tenant/cluster switcher, live latency ticker, search trigger
    │   │   ├── DemoTourBanner.tsx       # 8-step interactive 2-minute hackathon demo walkthrough bar
    │   │   └── QuickSearchModal.tsx     # ⌘K global quick search for policies and audit events
    │   │
    │   ├── sandbox/
    │   │   ├── ScenarioSelector.tsx     # Scenario picker, client application selector, and prompt input
    │   │   ├── PipelineVisualizer.tsx   # Visual 10-stage inspection pipeline with live status badges
    │   │   └── DecisionDossier.tsx      # Explainability dossier (factor weights, cost ROI, latency)
    │   │
    │   ├── observability/
    │   │   ├── MetricsGrid.tsx          # 6 core KPIs (Total Invocations, Block Rate, Cost Saved, etc.)
    │   │   └── ObservabilityCharts.tsx  # Decision distribution, threat categories, and FinOps savings
    │   │
    │   ├── governance/
    │   │   ├── PolicyTable.tsx          # Policy catalog table with active status toggles
    │   │   └── PolicyModal.tsx          # Policy creation and parameter configuration modal
    │   │
    │   ├── review/
    │   │   ├── ReviewQueueTable.tsx     # AI Safety operations table for escalated incidents
    │   │   └── ReviewDetailDrawer.tsx   # Detailed review drawer with diff editor and action buttons
    │   │
    │   └── audit/
    │       ├── AuditTable.tsx           # Searchable, filterable audit log table with CSV/JSON export
    │       └── AuditDetailDrawer.tsx    # Raw JSON telemetry viewer and SHA-256 hash verifier
    │
    └── pages/
        ├── SandboxPage.tsx              # Live Proxy Sandbox hero view (3-column layout)
        ├── ObservabilityPage.tsx        # Operational intelligence dashboard
        ├── GovernancePage.tsx           # Governance & Policy Center
        ├── ReviewQueuePage.tsx          # Human Review safety operations queue
        ├── AuditLogsPage.tsx            # Immutable Cryptographic Audit Logs view
        └── ArchitecturePage.tsx         # System Architecture blueprint and engine deep dive
```

---

## Feature Map & Application Surfaces

| Surface / Page | Primary Responsibilities | Key Source Components |
| :--- | :--- | :--- |
| **Live Proxy Sandbox** | Hero interactive testing environment. Select scenarios, configure applications, trigger the 10-stage inspection pipeline, inspect decision dossiers, and review cost savings. | `src/pages/SandboxPage.tsx`<br/>`src/components/sandbox/*` |
| **Observability & Metrics** | Real-time operational intelligence. Visualizes total requests, block rate, hallucination rate, threat categories, and spend avoidance dynamically computed from runtime events. | `src/pages/ObservabilityPage.tsx`<br/>`src/components/observability/*` |
| **Governance & Policies** | Enterprise policy catalog. Manage, edit, and toggle active status for guardrails across Security, Privacy, Quality, Cost, and Compliance. | `src/pages/GovernancePage.tsx`<br/>`src/components/governance/*` |
| **Human Review Queue** | AI safety operations console. Inspect escalated incidents with low grounding or high financial impact. Operators can **Approve**, **Reject**, or **Edit & Release** remediated outputs. | `src/pages/ReviewQueuePage.tsx`<br/>`src/components/review/*` |
| **Audit Logs & Compliance** | Cryptographic compliance trail. Search and filter runtime events by Request ID, inspect SHA-256 hashes and raw JSON payloads, and export data via **CSV** or **JSON**. | `src/pages/AuditLogsPage.tsx`<br/>`src/components/audit/*` |
| **System Architecture** | Technical blueprint explaining proxy topology, continuous inspection flow, and the role of each engine. | `src/pages/ArchitecturePage.tsx` |

---

## State Management & Data Flow

All global application state is managed reactively through **React Context** in `src/context/ControlPlaneContext.tsx` and synchronized with `localStorage`:

```text
User Action in Sandbox
        ↓
executeProxyRequest() executes RuntimePipeline
        ↓
Generates RuntimeEvent (with SHA-256 hashes, evaluations, and decision)
        ↓
State Dispatches:
  1. Prepend to runtimeEvents collection
  2. If decision === 'ESCALATE' → Prepend to reviewQueue collection
  3. Dynamic memoization recalculates metrics (Block Rate, Cost Saved, etc.)
  4. React re-renders Sandbox, Observability, Review Queue, and Audit Log in sync
```

---

## Domain Models & TypeScript Types

Core data models are defined in `src/types/index.ts`:

* **`GovernanceDecision`**: `'ALLOW' | 'BLOCK' | 'EDIT' | 'ESCALATE'`
* **`RuntimeEvent`**: Complete telemetry object capturing `requestId`, `timestamp`, `application`, `model`, `routedModel`, `rawInput`, `sanitizedInput`, `rawOutput`, `finalOutput`, `inputSha256`, `outputSha256`, `responsibility`, `cost`, `performance`, `riskScore`, `riskFactors`, `decision`, `triggeredPolicies`, and `latency`.
* **`PolicyRule`**: Governance rule capturing `id`, `name`, `category`, `engine`, `description`, `severity`, `action`, `threshold`, `status`, `version`, and `author`.
* **`ReviewQueueItem`**: Escalated item capturing `id`, `requestId`, `riskScore`, `inputPrompt`, `originalOutput`, `proposedRemediation`, `evidence`, `status` (`'PENDING' | 'APPROVED' | 'REJECTED' | 'EDITED'`), and reviewer metadata.
* **`AggregatedMetrics`**: Computed metrics object containing total requests, counts by decision, block rate $\%$, hallucination rate $\%$, PII counts, cost saved \$, and cache hit rate $\%$.

---

## Running the Project

### Prerequisites
* **Node.js**: `v18.0.0` or higher (tested on Node `v22.20.0`)
* **npm**: `v9.0.0` or higher (tested on npm `v10.9.3`)

### Installation
```bash
npm install
```

### Frontend Development Server
```bash
npm run dev
```
Opens the local development server at `http://localhost:5173`.

The frontend works standalone with client-side engines and `localStorage` persistence. For full-stack mode with the backend API, also start the backend server (see below).

### Backend API Server (Optional)
```bash
npm run server
```
Starts the Express REST API gateway on `http://localhost:3001`. The Vite dev server automatically proxies all `/api/*` requests to this backend.

**API Endpoints:**
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/health` | GET | Gateway health check, version, and active policy count |
| `/api/scenarios` | GET | List all 8 preset evaluation scenarios |
| `/api/proxy/evaluate` | POST | Execute prompt through the 3-engine runtime pipeline |
| `/api/policies` | GET/POST | List or create governance policies |
| `/api/policies/:id` | PUT | Update a policy |
| `/api/policies/:id/status` | PATCH | Toggle policy active/draft status |
| `/api/reviews` | GET | List Human Review queue items |
| `/api/reviews/:id/action` | POST | Approve, reject, or edit a review item |
| `/api/events` | GET | List all audit events |
| `/api/events/export/json` | GET | Download audit log as JSON |
| `/api/events/export/csv` | GET | Download audit log as CSV |
| `/api/metrics` | GET | Aggregated operational metrics |

### Type Checking
```bash
npm run typecheck
```

### Production Build
```bash
npm run build
```
Runs strict TypeScript compilation (`tsc`) followed by the Vite production bundler.

### Preview Production Build
```bash
npm run preview
```

---

## Environment Variables

| Variable | Required | Purpose | Example |
| :--- | :--- | :--- | :--- |
| *None* | No | The application currently operates with an in-memory deterministic simulation engine and local storage persistence. No external API keys are required for demo or development execution. | N/A |

---

## Developer & Extension Guides

### How to Add a New Demo Scenario
1. Open `src/engine/scenarios.ts`.
2. Add a new object to the `SCENARIO_PRESETS` array matching the `ScenarioPreset` interface:
   ```typescript
   {
     id: 'sc-09-custom',
     title: 'Custom API Key Leak Detection',
     category: 'PII',
     tag: 'Credential Security',
     tagColor: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
     description: 'User accidentally sends a hardcoded GitHub Personal Access Token.',
     application: 'Internal Knowledge Copilot',
     model: 'GPT-4o (128K)',
     prompt: 'Analyze repository logs with token ghp_392819283019283019283019283019283019 to find recent commits.',
     expectedDecision: 'EDIT'
   }
   ```
3. Save the file. The scenario will appear automatically in the Live Sandbox scenario picker.

### How to Add or Modify a Policy Rule
1. Open `src/engine/defaultPolicies.ts`.
2. Add or adjust an entry in `DEFAULT_POLICIES`:
   ```typescript
   {
     id: 'pol-custom-08',
     name: 'Cross-Tenant Query Quarantine',
     category: 'SECURITY',
     engine: 'RESPONSIBILITY',
     description: 'Quarantines requests containing unauthorized cross-tenant organization IDs.',
     severity: 'CRITICAL',
     action: 'BLOCK',
     threshold: 85,
     status: 'ACTIVE',
     version: 'v1.0',
     updatedAt: '2026-08-25 00:00 UTC',
     author: 'Security Admin'
   }
   ```
3. To test dynamically without code edits, open the **Governance & Policies** page in the running app and click **Define Policy Rule**.

### How to Modify the Runtime Evaluation Engine
* **To adjust PII or prompt injection logic**: Edit `src/engine/responsibility.ts`.
* **To adjust Semantic Cache entries or model pricing**: Edit `src/engine/cost.ts` (specifically `MODEL_PRICING` and `semanticCacheStore`).
* **To adjust hallucination and faithfulness scoring**: Edit `src/engine/performance.ts`.
* **To modify the 10-stage execution pipeline**: Edit `src/engine/runtimePipeline.ts`.

---

## Debugging & Troubleshooting Guide

| Issue | Likely Cause | Solution / File to Check |
| :--- | :--- | :--- |
| **Sandbox pipeline stuck in "RUNNING"** | Asynchronous promise unhandled in `RuntimePipeline`. | Check `src/engine/runtimePipeline.ts` to ensure all `await new Promise(...)` timers resolve. |
| **New scenario not setting expected decision** | Heuristic matchers in engine do not detect prompt keywords. | Inspect `src/engine/responsibility.ts` and `src/engine/performance.ts` to verify keyword triggers. |
| **Review queue count not updating in sidebar** | React state mismatch in context. | Check `src/context/ControlPlaneContext.tsx` and ensure `reviewQueue` state is updated when `decision === 'ESCALATE'`. |
| **Metrics in Observability not reflecting new requests** | Custom prompt didn't trigger `executeProxyRequest()`. | Verify `executeProxyRequest` in `src/context/ControlPlaneContext.tsx` prepends new events to `runtimeEvents`. |
| **Exported CSV / JSON is empty** | Empty event array. | Verify `runtimeEvents` contains items before clicking Export in `src/components/audit/AuditTable.tsx`. |

---

## Testing Strategy

* **Type Safety & Compilation**: `npm run build` performs strict TypeScript validation (`tsc`) across all components, engines, and context types.
* **Deterministic Engine Verification**: Evaluation logic in `src/engine/` is deterministic, ensuring consistent scores, factor weights, and decisions for automated test suites and reproducible demo presentations.
* **State Propagation Testing**: Sandbox executions are verified to propagate immediately to the Review Queue (on `ESCALATE`), Observability metrics (on every request), and Audit Logs.

---

## 2-Minute Hackathon Demo Script

For presentations, click **Demo Mode** in the header or follow this sequence:

1. **Step 1: Normal Compliant Query (`ALLOW`)**
   - In Live Proxy Sandbox, select *Compliant Financial Analysis*.
   - Click **Intercept & Execute Real-Time Proxy**.
   - Observe all 10 stages pass, model complexity routing, grounding verified, and decision `ALLOW`.
2. **Step 2: Prompt Injection Exploit (`BLOCK`)**
   - Select *Prompt Injection & Jailbreak Attack*.
   - Click **Execute**. Responsibility Engine intercepts system prompt override attempt, **halting downstream model inference (0ms LLM compute)** under `Prompt Injection Protection v4.1`.
3. **Step 3: PII Redaction (`EDIT`)**
   - Select *Sensitive PII Leak*. Observe automated detection of Indian Aadhaar and SSN numbers, masked before downstream exposure.
4. **Step 4: Hallucination & Escalation (`ESCALATE`)**
   - Select *Ungrounded Legal Contract Hallucination*. Low faithfulness ($38\%$) flags fabricated clauses and routes to Human Review.
5. **Step 5: AI Safety Operations Console**
   - Open **Human Review Queue**, view the flagged clause with SLM evidence, and click **Save Edit & Release**.
6. **Step 6: Observability & FinOps ROI**
   - Open **Observability & Metrics** to demonstrate real-time block rate, threat breakdowns, and spend avoidance from semantic caching.
7. **Step 7: Cryptographic Audit Trail**
   - Open **Audit Logs & Compliance**, inspect SHA-256 hashes and policy version signatures, and click **Export CSV / JSON**.

---

## Current Limitations & Known Simulation Scope

To maintain engineering transparency:
* **Deterministic Simulation Engine**: The current version uses high-fidelity deterministic regex, heuristics, and similarity scoring rather than live external embedding API endpoints.
* **In-Memory / Local Storage**: State persists to browser `localStorage`. A distributed database (PostgreSQL / Redis) is planned for multi-tenant production.
* **LLM Gateway Mock**: Downstream LLM inference times and outputs are simulated realistically to provide instant, reproducible demo feedback without third-party API quotas.

---

## Production Roadmap

* [ ] **Live OpenAI / Anthropic Reverse Proxy Adapter**: Plug-and-play drop-in replacement for downstream base URLs.
* [ ] **Distributed Redis Semantic Vector Cache**: Upgrading local cosine similarity matching to milvus / Redis vector indices.
* [ ] **Small Language Model (SLM) Sidecar**: Hosting dedicated 3B parameter grounding verification models (e.g., Llama-3.2-3B or Gemma-2-2B) on GPU nodes.
* [ ] **Role-Based Access Control (RBAC)**: Fine-grained permissions for Security Operators vs. Compliance Auditors.
* [ ] **EU AI Act & SOC 2 Automated Compliance Reports**: One-click compliance report generation directly from the cryptographic audit trail.
