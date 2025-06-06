/**
 * File handling utilities
 */

/**
 * Generates a timestamp-based filename for the conversation export
 * @param {Date} date - Date to use for timestamp (defaults to current date)
 * @returns {string} Generated filename
 */
export function generateFilename(date = new Date()) {
  const timestamp = date.toISOString().split('T')[0] // YYYY-MM-DD
  return `ChatGPT-Conversation-${timestamp}.md`
}

/**
 * Creates and triggers a download for the given content
 * @param {string} content - Content to download
 * @param {string} filename - Name of the file
 * @returns {Promise<void>} Promise that resolves when download is triggered
 */
export function triggerDownload(content, filename) {
  return new Promise(resolve => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.download = filename
    a.href = url
    a.style.display = 'none'

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    resolve()
  })
}

/**
 * Validates that content is not empty
 * @param {string} content - Content to validate
 * @throws {Error} If content is empty or whitespace only
 */
export function validateContent(content) {
  if (!content || !content.trim()) {
    throw new Error('No content extracted from conversation')
  }
}
