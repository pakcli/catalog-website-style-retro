/**
 * Pure Business Logic: Standalone Compiler Adapter Helpers
 * Inlines dependencies and prepares single-file exports without backend dependencies
 */
export function synthesizeStandaloneHtml(title, headContent, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en" class="theme-dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} -- Standalone Cartridge</title>
  <style>
    :root { --bg: #0d0f0c; --fg: #b0a84a; }
    body { background-color: var(--bg); color: var(--fg); font-family: monospace; margin: 0; padding: 1rem; }
  </style>
  ${headContent || ''}
</head>
<body>
  ${bodyContent || ''}
</body>
</html>`;
}
