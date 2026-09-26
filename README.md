# RuralGrid Planner ⚡
### Cost-Optimized Village Electrification using Kruskal’s Algorithm

RuralGrid Planner is an interactive decision support tool and educational simulator designed for rural energy planning authorities. It demonstrates how **Kruskal's Minimum Spanning Tree (MST)** algorithm selects the lowest-cost transmission topology to electrify remote rural communities from a central power substation, while giving planners full control over the **installation cost vs. storm-resilience tradeoff**.

---

## 🌟 Key Features

1. **Greedy Kruskal's MST Solver**:
   - Evaluates transmission candidate lines sorted by cost / effective weight.
   - Utilizes **Union-Find (Disjoint-Set with path compression)** to detect cycles and merge energized micro-grids in $O(E \log E)$ time.
   - Interactive simulation controls: **Next Step**, **Previous Step**, **Run Automatically (Play/Pause)**, **Reset**, and **Run Full Simulation**.

2. **Planning Preference Slider (Cost vs. Reliability Optimization)**:
   - Adjusts cable weight according to storm vulnerability:
     $$\text{effectiveWeight} = \text{installationCost} + \text{reliabilityFactor} \times \text{riskPenalty}$$
   - **Overhead Cables**: Low initial capital (₹20L–₹45L), but high storm-risk penalty (+20) due to monsoon winds and fallen trees.
   - **Underground Cables**: Higher initial capital (₹30L–₹60L), but low storm-risk penalty (+5) ensuring high reliability.

3. **Priority Village Reliability Audit (Clinics & Schools)**:
   - Evaluates designated priority infrastructure:
     - **Village B**: Primary Health Clinic & Vaccine Storage Ward 🏥
     - **Village C**: Govt Higher Secondary Model School & Examination Centre 🏫
   - **Hop-Distance Rule**: Compares the village's hop-distance to the substation in the final MST against the cost of its cheapest rejected direct feeder line.
   - If the MST path is **more than 1 hop longer** than a rejected direct feeder would have provided (1 hop), the system flags a **High Reliability Risk alert**, documenting the skipped direct line, its capital cost, and the longer multi-link cascade route it received instead.

4. **Live Network Telemetry & Metrics**:
   - Total Network Capital Cost (₹ Lakhs)
   - Running Capital Saved vs. Building Every Candidate Line
   - Villages Electrified / Remaining
   - Selected Edges Count & Overhead/Underground Composition
   - Network Reliability Score (%)
   - Live Disjoint Set Component Viewer

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- npm or pnpm or yarn

### Quick Start
```bash
cd /Users/akashdhillon/.gemini/antigravity/scratch/ruralgrid-planner
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
ruralgrid-planner/
├── src/
│   ├── components/
│   │   ├── AlgorithmControls.tsx       # Next, Prev, Auto-play, Speed slider
│   │   ├── EducationalExplanation.tsx  # Kruskal step logic & live disjoint sets
│   │   ├── EdgeDetailModal.tsx         # Deep-dive inspector for transmission lines
│   │   ├── EdgeTable.tsx               # Ranked priority queue with status badges
│   │   ├── Header.tsx                  # Global title, status badge & triggers
│   │   ├── MetricsCards.tsx            # Capital cost, access %, reliability
│   │   ├── NetworkVisualization.tsx    # SVG power topology with animated flows
│   │   ├── PlanningPreferenceSlider.tsx# Cost vs. storm risk tradeoff
│   │   └── PriorityAuditPanel.tsx      # Hop-distance audit for Clinics & Schools
│   ├── data/
│   │   └── sampleNetwork.ts            # Substation & Village graph coordinates & candidate lines
│   ├── types/
│   │   └── grid.ts                     # TypeScript data contracts & step records
│   ├── utils/
│   │   ├── graph.ts                    # Union-Find, BFS path finding, priority audit
│   │   └── kruskal.ts                  # Step computation & metrics engine
│   ├── App.tsx                         # State coordination & layout
│   ├── main.tsx                        # Application mount
│   └── index.css                       # Tailwind layers & particle keyframes
├── package.json
├── tailwind.config.js
└── vite.config.ts
```
