/**
 * File handling utilities
 */

/**
 * Extracts conversation ID from ChatGPT URL
 * @param {string} url - The current page URL
 * @returns {string|null} Conversation ID or null if not found
 */
export function extractConversationId(url) {
  // Match pattern: https://chatgpt.com/c/[conversation-id] or https://chat.openai.com/c/[conversation-id]
  const match = url.match(/\/c\/([a-f0-9-]+)/i)
  return match ? match[1] : null
}

/**
 * Generates a timestamp-based filename for the conversation export
 * @param {Date} date - Date to use for timestamp (defaults to current date)
 * @param {string} conversationId - Optional conversation ID to include in filename
 * @returns {string} Generated filename
 */
export function generateFilename(date = new Date(), conversationId = null) {
  const timestamp = Math.floor(date.getTime() / 1000) // Unix epoch seconds

  if (conversationId) {
    // Use first 8 characters of conversation ID for brevity
    const shortId = conversationId.substring(0, 8)
    return `ChatGPT-${shortId}-${timestamp}.md`
  }

  return `ChatGPT-${timestamp}.md`
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
