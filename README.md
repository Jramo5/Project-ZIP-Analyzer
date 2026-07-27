![Version](https://img.shields.io/badge/version-1.0.0-success)
![Responsive](https://img.shields.io/badge/Responsive-Yes-brightgreen)
![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-yellow)
![License](https://img.shields.io/badge/License-PolyForm%20Noncommercial%201.0.0-blue)
![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4-red)

# Project ZIP Analyzer

A modern, responsive and intelligent web application for analyzing compressed project files (`.zip`) directly in the browser.

Project ZIP Analyzer inspects the structure of software projects, detects technologies, frameworks, dependencies, architecture, security indicators and generates a comprehensive JSON report without uploading any data to a server.

---

## Live Demo

🌐 **GitHub Pages**

https://jramo5.github.io/Project-ZIP-Analyzer/

---

## Repository

https://github.com/Jramo5/Project-ZIP-Analyzer

---

## Features

* Analyze ZIP projects entirely in the browser.
* No server required.
* Drag & Drop support.
* Generates a complete JSON project manifest.
* Detects programming languages automatically.
* Detects frameworks and technologies.
* Detects package managers and dependencies.
* Identifies project entry points.
* Generates a complete project tree.
* Calculates project statistics.
* Smart project analysis.
* Security inspection.
* Quality scoring.
* Automatic recommendations.
* Interactive charts.
* JSON syntax highlighting.
* Copy JSON to clipboard.
* Download generated analysis.
* Responsive interface.
* Dark mode UI.
* Built with pure HTML, CSS and JavaScript.

---

## Intelligent Analysis

The application performs automatic project inspection and attempts to identify:

### Project Type

* Web Application
* Backend
* Frontend
* Full Stack
* REST API
* SDK
* Library
* CLI
* Installer
* Docker Project
* Static Website

---

### Framework Detection

Supports automatic detection of technologies such as:

* Laravel
* Symfony
* CodeIgniter
* WordPress
* React
* Vue
* Angular
* Next.js
* Express
* NestJS
* Flask
* Django
* FastAPI
* Spring Boot
* ASP.NET
* Bootstrap
* Tailwind CSS

---

### Architecture Detection

Attempts to identify:

* MVC
* HMVC
* Clean Architecture
* Hexagonal Architecture
* Domain Driven Design (DDD)
* SPA
* SSR
* Monolithic Applications
* Modular Projects
* API First

---

### Security Inspection

Detects potentially sensitive files such as:

* .env
* .env.example
* Certificates
* Private keys
* SQL backups
* Vendor directories
* node_modules
* Hidden files
* Configuration files

Also generates a security risk assessment.

---

### Quality Analysis

Calculates indicators such as:

* Project organization
* Maintainability
* Documentation
* Configuration
* Modularity
* Overall project quality score

---

## Generated Report

The analyzer produces a structured JSON report containing sections similar to:

```json
{
  "metadata": {},
  "summary": {},
  "statistics": {},
  "languages": {},
  "frameworks": [],
  "dependencies": {},
  "components": {},
  "security": {},
  "entryPoints": [],
  "analysis": {},
  "recommendations": [],
  "quality": {},
  "fileList": [],
  "structure": {}
}
```

---

## Technologies

* HTML5
* CSS3
* Vanilla JavaScript (ES2022)
* Bootstrap 5
* JSZip
* Chart.js
* Bootstrap Icons

---

## Project Structure

```text
Project-ZIP-Analyzer/
│
├── index.html
├── assets/
│   ├── css/
│   ├── js/
│   │   ├── analyzer.js
│   │   ├── smartAnalyzer.js
│   │   ├── frameworkDetector.js
│   │   ├── architectureDetector.js
│   │   ├── securityAnalyzer.js
│   │   ├── qualityAnalyzer.js
│   │   ├── recommendationEngine.js
│   │   ├── summaryBuilder.js
│   │   └── ...
│   └── icons/
├── README.md
└── LICENSE
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Jramo5/Project-ZIP-Analyzer.git
```

Open the project using a local web server.

Examples:

```bash
php -S localhost:8000
```

or

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

> **Note:** Opening `index.html` directly with the `file://` protocol is not recommended because some browser security restrictions may prevent certain features from working correctly.

---

## Usage

1. Open Project ZIP Analyzer.
2. Drag & Drop or select a ZIP project.
3. Wait for the analysis to complete.
4. Explore the generated dashboard.
5. Review statistics, structure, dependencies and security.
6. Inspect the generated JSON.
7. Export or copy the analysis.

---

## Why Project ZIP Analyzer?

Project ZIP Analyzer was created to provide developers, auditors and software architects with a lightweight tool capable of understanding the internal structure of software projects without requiring installation or server-side processing.

All analysis is performed locally in the browser, ensuring privacy and fast execution.

---

## Roadmap

Future planned features include:

* Git repository analysis.
* PDF report export.
* Project comparison.
* Duplicate file detection.
* License compatibility checker.
* Dependency vulnerability inspection.
* AI-assisted project summary.
* Plugin system for custom analyzers.

---

## License

This project is licensed under the PolyForm Noncommercial License 1.0.0.

You are permitted to:

* Use the software for personal purposes.
* Use the software for educational purposes.
* Study the source code.
* Modify the source code.
* Share copies of the software.

You are NOT permitted to:

* Sell this software.
* Include this software in paid products.
* Offer this software as a paid service.
* Use this software directly or indirectly for commercial purposes.
* Remove or alter copyright notices.
* Remove author attribution.

Any modified or redistributed version must retain:

* Original copyright notices.
* Original author attribution.
* License information.

Commercial use requires prior written permission from the copyright holder.

For commercial licensing inquiries, please contact the author.

---

## Copyright

© 2026 Jorge Ramos

All rights reserved except as granted under the PolyForm Noncommercial License 1.0.0.

---

## Author

**Jorge Ramos**

GitHub:

https://github.com/Jramo5

Made with ❤️ for developers, software architects, security researchers and open-source enthusiasts.
