# Multiverse Website Workspace

Welcome to your unified website workspace! This directory is designed to house and organize multiple websites side-by-side. 

---

## 📁 Workspace Structure

- **`.git/`** — Git repository tracking all projects in this workspace under a shared version control history.
- **`.agent/`** — Agent workspace settings.
- **`the-rift/`** — 🎮 **The Rift**: League of Legends daily puzzle website.
- **`README.md`** — Workspace documentation and guide (this file).

---

## 🚀 Projects Overview & Commands

### 1. The Rift (League of Legends Daily Puzzle)
A dark-themed League of Legends puzzle application built using Next.js 14, Tailwind CSS, Framer Motion, and Zustand.

* **Project Folder**: `the-rift/`
* **Development Server**:
  ```bash
  cd the-rift && npm run dev
  ```
* **Build for Production**:
  ```bash
  cd the-rift && npm run build
  ```
* **Production Start**:
  ```bash
  cd the-rift && npm run start
  ```

---

## ➕ Adding a New Website to this Workspace

To add a new website to this workspace, you can easily initialize it inside a new folder. For example, to create a new Next.js or React app:

### Next.js (Recommended)
Run the following command at the root of the workspace:
```bash
npx create-next-app@latest your-new-site
```

### Vite (React / Vue / Vanilla)
Run the following command at the root of the workspace:
```bash
npx create-vite@latest your-new-site
```

---

## 🛠️ Global Git Configuration
The workspace root contains a shared `.gitignore` which is configured to automatically ignore building/caching folders (`node_modules`, `.next`, `dist`, etc.) across **all current and future** sub-websites. You do not need to update the root gitignore for new projects.

Happy Coding! 🚀
