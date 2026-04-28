# AGENTS.md

## Project Goal

This repository is a personal technical blog based on Hexo.

The goal is to maintain a simple, stable, Markdown-based technical blog for publishing engineering notes, project records, research summaries, and debugging logs.

The project should remain a static blog site. Do not convert it into a custom frontend application unless explicitly requested.

## Default Stack

Use this stack by default:

- Hexo
- Butterfly theme
- GitHub Pages
- GitHub Actions
- Node.js LTS
- npm
- Markdown

Do not introduce other frameworks or platforms unless explicitly requested.

## Main Constraints

When modifying this repository:

1. Keep the project simple.
2. Prefer configuration over source-code modification.
3. Do not add backend services.
4. Do not add databases.
5. Do not add authentication systems.
6. Do not add CMS platforms.
7. Do not introduce React, Vue, Next.js, Nuxt, Astro, VitePress, or other frameworks unless explicitly requested.
8. Do not modify third-party theme source code unless necessary.
9. Do not add unnecessary dependencies.
10. Do not commit secrets, tokens, passwords, private keys, or real `.env` files.
11. Preserve existing posts and user content.
12. Make minimal, focused changes.

## Repository Structure

Expected structure:

```text
.
├── AGENTS.md
├── README.md
├── package.json
├── package-lock.json
├── _config.yml
├── _config.butterfly.yml
├── source/
│   ├── _posts/
│   ├── about/
│   ├── categories/
│   └── tags/
├── scaffolds/
├── themes/
│   └── butterfly/
└── .github/
    └── workflows/
        └── pages.yml
```

Rules:

- Blog posts go in `source/_posts/`.
- Hexo global configuration goes in `_config.yml`.
- Butterfly theme configuration goes in `_config.butterfly.yml`.
- GitHub Actions deployment goes in `.github/workflows/pages.yml`.
- Avoid editing files inside `themes/butterfly/`.

## Common Commands

Install dependencies:

```bash
npm install
```

Start local preview:

```bash
npm run server
```

Build the site:

```bash
npm run build
```

Clean generated files:

```bash
npm run clean
```

Create a new post:

```bash
npx hexo new post "post-title"
```

Recommended `package.json` scripts:

```json
{
  "scripts": {
    "build": "hexo generate",
    "server": "hexo server",
    "clean": "hexo clean"
  }
}
```

## Deployment

The blog should be deployed through GitHub Actions to GitHub Pages.

Default deployment assumptions:

- Source branch: `main`
- Build output directory: `public/`
- Deployment trigger: push to `main`
- Hosting platform: GitHub Pages

The workflow should build the Hexo site and deploy the generated `public/` directory.

Do not use personal access tokens unless necessary.

## Git Ignore Rules

Recommended `.gitignore` entries:

```gitignore
node_modules/
public/
.deploy_git/
db.json
.DS_Store
Thumbs.db
.env
.env.local
```

## Codex Working Rules

Before making changes, inspect:

- Repository structure
- `package.json`
- `_config.yml`
- `_config.butterfly.yml`
- Existing posts under `source/_posts/`
- GitHub Actions workflow
- `.gitignore`

After making changes, verify with:

```bash
npm install
npm run build
```

If local preview is needed, use:

```bash
npm run server
```

## Definition of Done

A task is complete only when:

1. The site can build successfully.
2. Existing posts and user content are preserved.
3. The project structure remains simple.
4. No secrets are committed.
5. Deployment files are correct if deployment is involved.
6. The final response lists changed files and verification commands.

## Initial Setup Rule

If the repository is empty, create the minimum working Hexo blog first.

Priority order:

1. Initialize Hexo.
2. Install dependencies.
3. Install and configure Butterfly.
4. Add basic npm scripts.
5. Add `.gitignore`.
6. Add GitHub Actions deployment workflow.
7. Verify the build.

Do not over-customize the first version.