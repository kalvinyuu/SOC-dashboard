# CyberSec: High-Performance Security Operations Dashboard

A professional-grade security log ingestion and analysis engine designed for high-throughput SOC (Security Operations Center) environments. Built with a focus on **Information Density**, **Mathematical Anomaly Detection**, and **Backend Performance**.

## 🚀 Performance & Throughput
CyberSec is engineered for elite-level ingestion throughput, leveraging Bun's low-level I/O and SharedArrayBuffer for zero-copy concurrency.

- **Single-Core Baseline:** Benchmarked at **~84,214 logs/sec** (Real persistence to SQLite).
- **Platinum Multi-threaded Ingestion:** Benchmarked at **~169,241 logs/sec** utilizing 7 background generators and a lock-free Ring Buffer.
- **Peak Engine Velocity:** Benchmarked at **~6,760,472 logs/sec** (Raw IPC + Generation, isolating DB I/O).
- **IPC Efficiency:** Uses `SharedArrayBuffer` + `Atomics` for thread-safe shared memory between main and worker threads.

### ⚡️ Stress Testing Modes
The dashboard includes an interactive stress test utility that allows you to compare execution strategies:

*   **Single Core Mode**: Strict sequential execution. Best for testing baseline ingestion latency.
*   **Bun Worker Mode**: Parallelized worker pool. Best for high-density simulation, preventing event loop starvation.

## 🏗️ Technical Stack
*   **Runtime**: [Bun](https://bun.sh) (Selected for the `bun:sqlite` performance and Worker API)
*   **Backend**: [Elysia.js](https://elysiajs.com) (Type-safe high-performance framework)
*   **Frontend**: React 19 + Tailwind CSS + Vite
*   **Database**: [Drizzle ORM](https://orm.drizzle.team) + Bun native SQLite (in WAL mode)
*   **Charting**: [uPlot](https://github.com/leeoniya/uPlot) (The fastest time-series visualization in JS)
*   **State Management**: [TanStack Query v5](https://tanstack.com/query) (Elite server-state synchronization)
*   **Logging**: [Pino](https://getpino.io) (Industry-standard low-overhead JSON logging)
*   **Concurrency**: Workers + SharedArrayBuffer Ring Buffer

## 🛡️ Advanced Security Features
- **Shannon Entropy Analysis**: Mathematical complexity detection (0-8 bits) to identify encrypted payloads and exfiltration.
- **Attack Signature Simulation**: Real-time generation of SQLi, XSS, Path Traversal, and RCE vectors.
- **System Health Index**: A weighted heuristic calculating overall infrastructure safety in real-time.

## 🛠️ Getting Started

### 1. Setup
```bash
bun install
bun run db:push
```

### 2. Launch
```bash
bun run dev
```

### 3. Benchmarking (Performance Verification)
Verify ingestion speed using the tiered load testing suite:

**Standard Ingestion Test (Single Thread)**
```bash
bun run load_test.ts 5000
```
*Current result: 84k logs/sec*

**Platinum Ingestion Test (Multi-Thread Multi-Worker)**
```bash
bun run load_test_multi.ts 5000
```
*Current result: 169k logs/sec*

**Peak Engine Test (Raw Generation Loop)**
```bash
bun run load_test_peak.ts 1000
```
*Current result: 6.7 Million logs/sec*

---

## Architecture Deep Dive: Shannon Entropy in Security
This project implements the Shannon Entropy formula to measure "unpredictability" in incoming traffic. While standard logs show *what* happened, entropy analysis identifies *why* it might be suspicious—detecting encrypted payloads or randomized attack paths that standard signature-based detection might miss.