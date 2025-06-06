/**
 * HTML to Markdown conversion utilities
 */

/**
 * Converts HTML content to clean markdown format
 * @param {string} html - HTML content to convert
 * @returns {string} Converted markdown text
 */
export function convertHtmlToMarkdown(html) {
  return (
    html
      .replace(/<p>/g, '\n\n')
      .replace(/<\/p>/g, '')
      .replace(/<b>/g, '**')
      .replace(/<\/b>/g, '**')
      .replace(/<strong[^>]*>/g, '**')
      .replace(/<\/strong>/g, '**')
      .replace(/<i>/g, '_')
      .replace(/<\/i>/g, '_')
      .replace(/<em[^>]*>/g, '_')
      .replace(/<\/em>/g, '_')
      .replace(/<h1[^>]*>/g, '\n# ')
      .replace(/<\/h1>/g, '\n')
      .replace(/<h2[^>]*>/g, '\n## ')
      .replace(/<\/h2>/g, '\n')
      .replace(/<h3[^>]*>/g, '\n### ')
      .replace(/<\/h3>/g, '\n')
      .replace(/<h4[^>]*>/g, '\n#### ')
      .replace(/<\/h4>/g, '\n')
      .replace(/<h5[^>]*>/g, '\n##### ')
      .replace(/<\/h5>/g, '\n')
      .replace(/<h6[^>]*>/g, '\n###### ')
      .replace(/<\/h6>/g, '\n')
      .replace(/<ul[^>]*>/g, '')
      .replace(/<\/ul>/g, '\n')
      .replace(/<ol[^>]*>/g, '')
      .replace(/<\/ol>/g, '\n')
      .replace(/<li[^>]*>/g, '\n- ')
      .replace(/<\/li>/g, '')
      .replace(/<hr[^>]*>/g, '\n---\n')
      .replace(/<br[^>]*>/g, '\n')
      .replace(/<code[^>]*>/g, match => {
        const lm = match.match(/class="[^"]*language-([^"]*)"/)
        return lm ? '\n```' + lm[1] + '\n' : '`'
      })
      .replace(/<\/code[^>]*>/g, (match, offset, string) => {
        const beforeCode = string.substring(0, offset)
        if (beforeCode.includes('\n```')) {
          return '\n```\n'
        }
        return '`'
      })
      .replace(/<pre[^>]*>/g, '\n```\n')
      .replace(/<\/pre>/g, '\n```\n')
      .replace(/<table[^>]*>/g, '\n')
      .replace(/<\/table>/g, '\n')
      .replace(/<thead[^>]*>/g, '')
      .replace(/<\/thead>/g, '')
      .replace(/<tbody[^>]*>/g, '')
      .replace(/<\/tbody>/g, '')
      .replace(/<tr[^>]*>/g, '| ')
      .replace(/<\/tr>/g, ' |\n')
      .replace(/<th[^>]*>/g, '')
      .replace(/<\/th>/g, ' | ')
      .replace(/<td[^>]*>/g, '')
      .replace(/<\/td>/g, ' | ')
      .replace(/<[^>]*>/g, '')
      .replace(/Copy code/g, '')
      .replace(
        /This content may violate our content policy\. If you believe this to be in error, please submit your feedback — your input will aid our research in this area\./g,
        ''
      )
      // Fix HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Fix bullet points
      .replace(/\n-\s+/g, '\n- ') // Fix bullet points with multiple spaces
      .replace(/\n- \n\n/g, '\n- ')
      .replace(/\n- \n/g, '\n- ')
      // Fix table formatting
      .replace(/\|\s+\|\s*$/gm, '|') // Remove empty table cells at end of rows
      .replace(/^\|\s*$/gm, '') // Remove completely empty table rows
      // Clean up excessive whitespace - be more aggressive
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace any 3+ newlines (with possible spaces) with just 2
      .replace(/(\n- [^\n]*)\n\s*\n\s*\n/g, '$1\n') // Remove extra lines after bullet points
      .replace(/(\n- [^\n]*)\n\s*\n/g, '$1\n') // Remove single extra line after bullet points
      .replace(/\n{3,}/g, '\n\n') // Max 2 newlines in a row
      .trim()
  )
}

/**
 * Cleans up HTML entities in text
 * @param {string} text - Text containing HTML entities
 * @returns {string} Text with entities decoded
 */
export function cleanHtmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

/**
 * Normalizes whitespace in markdown text
 * @param {string} text - Markdown text to normalize
 * @returns {string} Text with normalized whitespace
 */
export function normalizeWhitespace(text) {
  return text
    .replace(/(\n*- [^\n]*)\n+(?=- )/g, '$1\n') // Ensure single newline between bullet points
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace any 3+ newlines (with possible spaces) with just 2
    .replace(/(\n- [^\n]*)\n\s*\n\s*\n/g, '$1\n') // Remove extra lines after bullet points
    .replace(/(\n- [^\n]*)\n\s*\n/g, '$1\n') // Remove single extra line after bullet points
    .replace(/\n{3,}/g, '\n\n') // Max 2 newlines in a row
    .trim()
}
