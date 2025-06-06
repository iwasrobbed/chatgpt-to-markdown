/**
 * Content script for ChatGPT to Markdown extension
 * This runs on ChatGPT pages and handles the conversion
 */

import { exportConversation } from './conversation-exporter.js'

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportConversation') {
    exportConversation()
      .then(result => {
        sendResponse({
          success: true,
          messageCount: result.messageCount,
          characterCount: result.characterCount,
          filename: result.filename,
        })
      })
      .catch(error => {
        console.error('Export failed:', error)
        sendResponse({
          success: false,
          error: error.message,
        })
      })
  }
  return true // Keep message channel open for async response
})
