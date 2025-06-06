/**
 * Main conversation exporter functionality
 */

import { convertHtmlToMarkdown } from './utils/markdown-converter.js'
import {
  extractConversationTurns,
  extractUserMessage,
  extractAssistantMessage,
} from './utils/dom-extractor.js'
import {
  generateFilename,
  triggerDownload,
  validateContent,
  extractConversationId,
} from './utils/file-utils.js'

/**
 * Exports a ChatGPT conversation to markdown format
 * @param {Document} document - DOM document
 * @returns {Promise<Object>} Export result with stats
 */
export async function exportConversation(document = window.document) {
  console.log('Starting ChatGPT to Markdown conversion...')

  const conversationTurns = extractConversationTurns(document)
  console.log(`Found ${conversationTurns.length} conversation turns`)

  // Get current URL and extract conversation ID
  const currentUrl = window.location.href
  const conversationId = extractConversationId(currentUrl)

  console.log(`Current URL: ${currentUrl}`)
  if (conversationId) {
    console.log(`Conversation ID: ${conversationId}`)
  }

  let conversationContent = ''
  let messageCount = 0

  for (const turn of conversationTurns) {
    const userContent = extractUserMessage(turn)
    const assistantContent = extractAssistantMessage(turn)

    if (userContent) {
      conversationContent += `**You**:\n${convertHtmlToMarkdown(userContent)}\n\n`
      messageCount++
    }

    if (assistantContent) {
      conversationContent += `**ChatGPT**:\n${convertHtmlToMarkdown(assistantContent)}\n\n`
      messageCount++
    }
  }

  // Validate that we actually have conversation content
  validateContent(conversationContent)

  // Start markdown with conversation metadata
  let markdown = ''

  // Add conversation URL as metadata header
  if (currentUrl) {
    markdown += `# ChatGPT Conversation\n\n`
    markdown += `**Source:** [${currentUrl}](${currentUrl})\n\n`
    markdown += `---\n\n`
  }

  // Add the actual conversation content
  markdown += conversationContent

  const filename = generateFilename(new Date(), conversationId)
  await triggerDownload(markdown, filename)

  console.log('Conversation exported successfully')
  console.log(`Total messages: ${messageCount}, characters: ${markdown.length}`)

  return {
    messageCount,
    characterCount: markdown.length,
    filename,
    conversationUrl: currentUrl,
    conversationId,
  }
}
