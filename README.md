# ![Version](https://img.shields.io/badge/version-1.1.0-success)

![Responsive](https://img.shields.io/badge/Responsive-Yes-brightgreen)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-yellow)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)
![License](https://img.shields.io/badge/License-PolyForm%20Noncommercial%201.0.0-blue)
![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4-red)

# Project ZIP Analyzer

**Project ZIP Analyzer** is a modern web application that analyzes compressed software projects (`.zip`) entirely inside your browser.

It automatically inspects the project structure, detects programming languages, frameworks, package managers, dependencies, entry points, security indicators, and generates a comprehensive JSON report without uploading your files to any server.

---

## 🌐 Live Demo

**GitHub Pages**

https://jramo5.github.io/Project-ZIP-Analyzer/

---

## 📦 Repository

https://github.com/Jramo5/Project-ZIP-Analyzer

---

# Features

* Analyze ZIP projects entirely in the browser.
* 100% client-side processing.
* No server required.
* Drag & Drop support.
* Automatic project inspection.
* JSON report generation.
* Programming language detection.
* Framework detection.
* Package manager detection.
* Dependency extraction.
* Entry point detection.
* Project architecture inference.
* Security inspection.
* Interactive project tree.
* File statistics.
* Language distribution charts.
* JSON syntax highlighting.
* Copy JSON to clipboard.
* Download analysis report.
* Responsive interface.
* Dark Mode.
* Built with modern Vanilla JavaScript.

---

# Intelligent Analysis

The analyzer automatically identifies:

## Programming Languages

* PHP
* JavaScript
* TypeScript
* HTML
* CSS / SCSS
* Python
* Go
* Rust
* Java
* C#
* C++
* SQL
* XML
* YAML
* Markdown
* Shell
* Dockerfile
* And many more...

---

## Framework Detection

Supports automatic detection of projects built with:

* Laravel
* Symfony
* CodeIgniter
* CakePHP
* WordPress
* Drupal
* Joomla
* React
* Vue
* Angular
* Next.js
* Nuxt
* Express
* NestJS
* Flask
* Django
* FastAPI
* Spring Boot
* ASP.NET

---

## Package Managers

Automatically detects:

* Composer
* npm
* Yarn
* pnpm
* Bun
* Cargo
* Go Modules
* Maven
* Gradle
* Poetry
* Pip

---

## Project Classification

Attempts to identify:

* Frontend
* Backend
* Full Stack
* SDK
* Library
* REST API
* CLI Application
* Static Website

---

## Architecture Detection

Detects common software structures such as:

* MVC
* REST API
* SPA
* Modular Applications
* Backend Services
* Frontend Applications

---

## Security Inspection

Searches for potentially sensitive resources including:

* `.env`
* `.env.example`
* Private keys
* Certificates
* Hidden files
* `vendor`
* `node_modules`
* Sensitive filenames
* Configuration files

A security summary is generated as part of the analysis.

---

# Generated Report

Each analysis produces a structured JSON report similar to:

```json
{
  "metadata": {},
  "statistics": {},
  "languages": {},
  "frameworks": [],
  "packageManagers": [],
  "dependencies": {},
  "security": {},
  "entryPoints": [],
  "analysis": {},
  "components": {},
  "fileList": [],
  "structure": {}
}
```

---

# Technologies

* HTML5
* CSS3
* Vanilla JavaScript (ES2022)
* Bootstrap 5
* Bootstrap Icons
* JSZip
* Chart.js

---

# Project Structure

```text
Project-ZIP-Analyzer/
│
├── index.html
├── README.md
├── LICENSE
│
└── assets/
    ├── css/
    │   └── style.css
    │
    ├── js/
    │   ├── analyzer.js
    │   ├── utils.js
    │   ├── ui.js
    │   └── main.js
    │
    └── vendor/
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/Jramo5/Project-ZIP-Analyzer.git
```

Move into the project directory:

```bash
cd Project-ZIP-Analyzer
```

Run a local web server.

Example using PHP:

```bash
php -S localhost:8000
```

Or Python:

```bash
python -m http.server 8000
```

Then open:

```
http://localhost:8000
```

> **Note**
>
> Opening the project directly with the `file://` protocol is not recommended because browser security restrictions may prevent ZIP processing or ES Module loading.

---

# Usage

1. Open Project ZIP Analyzer.
2. Drag & Drop or choose a ZIP project.
3. Wait while the project is analyzed.
4. Explore the generated dashboard.
5. Inspect statistics, technologies and project structure.
6. View or copy the generated JSON.
7. Download the report if needed.

---

# Why Project ZIP Analyzer?

Project ZIP Analyzer was created to help developers, software architects, security researchers and technical auditors quickly understand the internal structure of software projects.

Since every analysis is performed locally inside the browser, no project files leave your computer, making the application privacy-friendly and extremely fast.

---

# Browser Support

Compatible with modern browsers:

* Google Chrome
* Microsoft Edge
* Mozilla Firefox
* Brave
* Opera

Safari support may vary depending on the browser version.

---

# Roadmap

Future planned features:

* Git repository analysis
* PDF report export
* Project comparison
* Duplicate file detection
* Dependency vulnerability scanner
* License compatibility checker
* Plugin architecture
* AI-powered project summaries
* Project complexity metrics
* Dependency graphs

---

# License

This project is licensed under the **PolyForm Noncommercial License 1.0.0**.

You may:

* Use the software for personal purposes.
* Use the software for educational purposes.
* Study the source code.
* Modify the source code.
* Share copies of the software.

You may **NOT**:

* Sell this software.
* Include it in commercial products.
* Offer it as a paid service.
* Use it directly or indirectly for commercial purposes.
* Remove copyright notices.
* Remove author attribution.

Commercial licensing requires prior written permission from the copyright holder.

---

# Copyright

© 2026 Jorge Ramos

All rights reserved except as granted under the PolyForm Noncommercial License 1.0.0.

---

# Author

**Jorge Ramos**

GitHub

https://github.com/Jramo5

---

Made with ❤️ for developers, software architects, security researchers and open-source enthusiasts.
