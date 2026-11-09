/**
 * Pure Business Logic: Telemetry Calculator (Tokens, Size, and LOC)
 */
export function calculateTelemetry(content = '') {
  if (typeof content !== 'string') content = '';
  const bytes = new TextEncoder().encode(content).length;
  const kb = (bytes / 1024).toFixed(1) + ' KB';
  const loc = content.split('\n').length;
  // Approximation: ~4 chars per token for code/markdown
  const tokens = Math.round(content.length / 4);
  const formattedTokens = tokens > 1000 ? `~${(tokens / 1000).toFixed(1)}k tok` : `~${tokens} tok`;

  return { bytes, fileSize: kb, loc, tokens: formattedTokens };
}
