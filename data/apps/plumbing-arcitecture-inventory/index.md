---
title: Plumbing Architecture & Inventory
sector: tools
category: TOOLS & UTILITY
scope: [tools]
file-size: 22.5 KB
tags: [Plumbing, Architecture, BOM Calculator, Zero-Backend]
overview: Interactive plumbing architecture, flow topology, part inventory, and automated procurement Bill of Materials (BOM) engine.
badge: v2.5
img: "[[img-lightmode.webp]], [[img-darkmode.webp]]"
---

# Plumbing Architecture & Stockroom Inventory Engine

A standalone zero-dependency web cartridge for modeling domestic and commercial plumbing architectures, managing real-world physical fitting/valve inventory, reconciling as-built vs proposed design revisions, and generating procurement Bill of Materials (BOM).

---

## Key Features

- **Interactive System Topology Diagram**: Visual SVG vector schematic detailing inflow mains, PRV regulation, whole-house multi-stage filtration, water heating loops, manifold distribution branches (Cold 🔵 & Hot 🔴), and sanitary DWV lines.
- **Stockroom Inventory & Bin Management**: Catalog valves, expansion fittings, PEX/copper tubing, and fixtures with physical stock counts, minimum alert thresholds, unit costs, and storage bin coordinates.
- **Dynamic Revision & Placement Tracking**: Record physical installations per room or circuit. Compare As-Built baselines against proposed renovations with automated delta auditing.
- **Automated Bill of Materials (BOM)**: Real-time reconciliation between active revision needs and on-hand stock. Flags shortages and generates a one-click hardware store shopping checklist with cost estimates.
- **Plumbing Code Sizing Tools**:
  - **WSFU (Water Supply Fixture Unit) Sizer**: Computes simultaneous fixture demand based on IPC/UPC standards and recommends trunk/branch diameter.
  - **Pipe Volume & Purge Wait Calculator**: Calculates internal water retention (gallons / liters) and hot water delivery delay times.
- **Preventative Maintenance Tracker**: Log scheduled tests for main shutoff valves, water heater anode flushes, and filter cartridge replacements.
- **Zero-Backend Architecture**: 100% client-side execution with LocalStorage persistence, instant JSON import/export, and CSV spreadsheet export.
