/**
 * ============================================================================
 * MODULE: Markdown & Frontmatter Processor (src/modules/markdown-processor.js)
 * Purpose: Client-side Markdown parser and YAML Frontmatter extractor.
 *          Parses app metadata, instructions, guided steps, and code blocks
 *          with zero external dependencies.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeMarkdown = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Parse YAML frontmatter from raw Markdown text
   * @param {string} markdownText - Raw markdown document string
   * @returns {Object} Extracted frontmatter key-value pairs
   */
  function parseFrontmatter(markdownText) {
    if (!markdownText || typeof markdownText !== 'string') return {};
    const match = markdownText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return {};

    const yamlBlock = match[1];
    const data = {};
    const lines = yamlBlock.split(/\r?\n/);

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) return;

      const key = trimmed.slice(0, colonIdx).trim();
      let value = trimmed.slice(colonIdx + 1).trim();

      // Strip enclosing single or double quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Handle YAML arrays: ["tag1", "tag2"] or [tag1, tag2]
      if (value.startsWith('[') && value.endsWith(']')) {
        const inner = value.slice(1, -1).trim();
        data[key] = inner ? inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')) : [];
      } else {
        data[key] = value;
      }
    });

    return data;
  }

  /**
   * Extract body content after YAML frontmatter
   * @param {string} markdownText
   * @returns {string}
   */
  function stripFrontmatter(markdownText) {
    if (!markdownText || typeof markdownText !== 'string') return '';
    return markdownText.replace(/^---\r?\n[\s\S]*?\r?\n---(\r?\n)?/, '').trim();
  }

  /**
   * Lightweight markdown-to-HTML parser for guided steps and descriptions
   * @param {string} md
   * @returns {string} HTML string
   */
  function renderMarkdown(md) {
    if (!md) return '';
    const body = stripFrontmatter(md);

    return body
      // Code blocks
      .replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g, function (_, lang, code) {
        const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre class="code-block" data-lang="${lang}"><code>${escaped}</code></pre>`;
      })
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      // Unordered lists
      .replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Paragraphs (double newlines)
      .replace(/\n\s*\n/g, '</p><p>')
      .replace(/^(?!<[a-z/])([\s\S]+?)(?=(<\/?(h[1-6]|pre|code|ul|ol|li|blockquote|p)|$))/gim, '<p>$1</p>');
  }

  /**
   * Extract and normalize app cartridge metadata
   * @param {string} rawMd
   * @param {string} fallbackSlug
   */
  function extractAppMetadata(rawMd, fallbackSlug) {
    const fm = parseFrontmatter(rawMd);
    const slug = fm.slug || fallbackSlug || 'unknown-app';
    const sector = (fm.category || fm.sector || 'tools').toLowerCase();

    return {
      slug: slug,
      title: fm.title || slug.toUpperCase(),
      desc: fm.desc || fm.description || 'Vintage computing interactive cartridge.',
      category: sector,
      tags: Array.isArray(fm.tags) ? fm.tags : (fm.tags ? [fm.tags] : ['offline', 'retro']),
      icon: fm.icon || '💾',
      author: fm.author || 'Fadhli S Lubis',
      version: fm.version || '1.0.0',
      rawMarkdown: rawMd,
      frontmatter: fm
    };
  }

  return {
    parseFrontmatter: parseFrontmatter,
    stripFrontmatter: stripFrontmatter,
    renderMarkdown: renderMarkdown,
    extractAppMetadata: extractAppMetadata
  };
});
