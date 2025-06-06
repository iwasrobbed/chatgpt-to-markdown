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

  let markdown = ''
  let messageCount = 0

  for (const turn of conversationTurns) {
    const userContent = extractUserMessage(turn)
    const assistantContent = extractAssistantMessage(turn)

    if (userContent) {
      markdown += `**You**: ${convertHtmlToMarkdown(userContent)}\n\n`
      messageCount++
    }

    if (assistantContent) {
      markdown += `**ChatGPT**: ${convertHtmlToMarkdown(assistantContent)}\n\n`
      messageCount++
    }
  }

  validateContent(markdown)

  const filename = generateFilename()
  await triggerDownload(markdown, filename)

  console.log('Conversation exported successfully')
  console.log(`Total messages: ${messageCount}, characters: ${markdown.length}`)

  return {
    messageCount,
    characterCount: markdown.length,
    filename,
  }
}
