# CyberSec: High-Performance Security Operations Dashboard

A professional-grade security log ingestion and analysis engine designed for high-throughput SOC (Security Operations Center) environments. Built with a focus on **Information Density**, **Mathematical Anomaly Detection**, and **Backend Performance**.

## 🚀 Performance & Throughput
- **Single-Core Baseline:** Capable of processing ~2,000-5,000 logs/sec in standard sequential execution mode.
- **Multithreaded Scaling (Bun Workers):** Leverages Bun's internal worker pool to distribute generation load across all available CPU cores.
- **IPC Efficiency:** Uses `SharedArrayBuffer` for zero-copy communication between the main thread and background workers.
- **Peak Engine Speed:** Benchmarked at **20,000+ persistent logs/sec** on SQLite and over **1,000,000 logs/sec** in-memory generation speed.

### ⚡️ Stress Testing Modes
The dashboard includes an interactive stress test utility that allows you to compare execution strategies:

*   **Single Core Mode:** Sequential execution on the main event loop. This is useful for baseline performance measurements and low-to-medium traffic simulation.
*   **Bun Worker Mode:** Parallelized execution. Distributes tasks across background threads. This is the recommended approach for high-density production environments as it prevents event loop starvation during massive traffic spikes.

## 🛡️ Advanced Security Features
- **Shannon Entropy Analysis:** Uses mathematical entropy calculation on payloads and user agents to detect obfuscated malware, unusual request patterns, and potential exfiltration.
- **Attack Signature Simulation:** Real-time generation and detection of SQL Injection, XSS, Path Traversal, and RCE signatures.
- **Automated Threat Scoring:** Each log is enriched with a dynamic `threatScore` based on payload entropy, severity levels, and HTTP metadata.
- **System Health Integrity Index:** A real-time heuristic calculating overall system safety based on weighted anomaly aggregates.

## 🛠️ Professional Tooling
- **Interactive API Documentation:** Full OpenAPI/Swagger integration available at `/swagger`.
- **SOC Operator Utilities:**
    - **Real-time Filters:** Instant pivoting by Severity and Threat Vector.
    - **Data Portability:** Full "Export to CSV" functionality for forensics and external analysis.
    - **Visual Metrics:** Real-time correlation charts between Shannon Entropy and Severity levels.

## 🏗️ Technical Stack
- **Runtime:** [Bun](https://bun.sh) (Selected for superior I/O performance)
- **Backend:** [Elysia.js](https://elysiajs.com) (High-performance web framework)
- **Frontend:** React 19 + Vite (Type-safe, fast HMR)
- **Persistence:** [Drizzle ORM](https://orm.drizzle.team) + Bun:SQLite
- **Visualization:** [uPlot](https://github.com/leeoniya/uPlot) (Lightweight, high-performance charting)

## Getting Started

### 1. Environment Setup
```bash
bun install
bun run db:push
```

### 2. Development
```bash
bun run dev
```

### 3. Load Testing (Performance Verification)
Run the internal benchmarking tool to stress-test the ingestion engine:
```bash
bun run load_test.ts 10000
```

---

## Architecture Deep Dive: Shannon Entropy in Security
This project implements the Shannon Entropy formula to measure "unpredictability" in incoming traffic. While standard logs show *what* happened, entropy analysis helps identify *why* it might be suspicious—detecting encrypted payloads or randomized attack paths that standard signature-based detection (WAF) might miss.