# Scaling CyberSec: From Edge to Enterprise

This document outlines the architectural roadmap for scaling the CyberSec ingestion engine from a high-performance local tool to a globally distributed security platform.

## Current State: Optimized Edge Ingestion
- **Runtime:** Bun (Single-node multi-threaded)
- **IPC:** SharedArrayBuffer + Atomics (Lock-free)
- **Storage:** SQLite (WAL Mode)
- **Throughput:** ~70k writes/sec (constrained by Disk I/O)

---

## Phase 2: Distributed Real-Time Layer (Dragonfly)
To scale beyond a single node, the in-memory `StatsService` and `SharedArrayBuffer` must be replaced with a distributed memory store.

### Why Dragonfly?
- **Multi-threaded Redis:** Unlike standard Redis (single-threaded), Dragonfly scales vertically with every core on the machine.
- **Real-time Suppression:** Use Dragonfly for "Rate Limiting" and "IP Blacklisting."
- **Implementation:**
    - Workers check Dragonfly for `IP_REPUTATION` scores before processing.
    - Real-time "Global HUD" stats are stored as atomic counters in Dragonfly.

---

## Phase 3: Massively Parallel Analytics (ClickHouse)
SQLite is excellent for local storage but hits a bottleneck with complex analytical queries (e.g., "Find the 95th percentile entropy over 100M logs").

### Why ClickHouse?
- **Columnar Storage:** Only reads the specific columns (e.g., `entropy`, `timestamp`) needed for a query.
- **Data Compression:** Security logs are highly repetitive; ClickHouse can compress them by up to 90%, saving massive storage costs.
- **Batch Processing:** ClickHouse architecture is designed to ingest the exact `batch.push()` format we've implemented in our current `LoggerService`.

---

## The Enterprise Security Pipeline
1. **Bun Load-Balancer:** Ingests raw TCP/HTTP traffic.
2. **Evaluation Workers:** Perform Shannon Entropy and Threat Scoring in parallel.
3. **Dragonfly:** Updates real-time metrics and checks block-lists.
4. **Kafka/Redpanda:** Acts as a durable buffer between the workers and the DB.
5. **ClickHouse:** Periodically drains the buffer for long-term storage and forensic analysis.
