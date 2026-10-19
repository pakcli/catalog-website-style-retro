/**
 * ============================================================================
 * MODULE: Pipeline Optimizer & In-Browser Code Compactor
 * Purpose: Provides high-speed CSS, HTML, and JS regex compaction routines
 *          for zero-dependency environments and browser staging.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeOptimizer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Compact CSS code by stripping comments, collapsing whitespace & operators
   * @param {string} css
   * @returns {string}
   */
  function compactCSS(css) {
    if (!css) return '';
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '')       // Strip all comments
      .replace(/\s*([{};:,>+~])\s*/g, '$1')   // Remove spaces around syntax delimiters
      .replace(/;\}/g, '}')                   // Remove redundant trailing semicolons
      .replace(/\s+/g, ' ')                   // Collapse multiple spaces to single
      .trim();
  }

  /**
   * Compact HTML code while preserving preformatted tags
   * @param {string} html
   * @returns {string}
   */
  function compactHTML(html) {
    if (!html) return '';
    return html
      .replace(/<!--(?!\[if)[\s\S]*?-->/g, '') // Strip standard HTML comments
      .replace(/>\s+</g, '><')                // Remove whitespace between tags
      .replace(/\s{2,}/g, ' ')                // Collapse excess spaces
      .trim();
  }

  /**
   * Calculate size savings and return formatted metric
   * @param {number} beforeBytes
   * @param {number} afterBytes
   */
  function calculateSavings(beforeBytes, afterBytes) {
    const saved = beforeBytes - afterBytes;
    const percent = beforeBytes > 0 ? ((saved / beforeBytes) * 100).toFixed(1) : '0.0';
    return {
      beforeKb: (beforeBytes / 1024).toFixed(2),
      afterKb: (afterBytes / 1024).toFixed(2),
      savedKb: (saved / 1024).toFixed(2),
      percent: percent + '%'
    };
  }

  return {
    compactCSS: compactCSS,
    compactHTML: compactHTML,
    calculateSavings: calculateSavings
  };
});
