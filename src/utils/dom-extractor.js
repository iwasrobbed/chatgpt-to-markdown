/**
 * DOM extraction utilities for ChatGPT conversations
 */

/**
 * Extracts conversation turns from the ChatGPT page
 * @param {Document} document - DOM document
 * @returns {NodeList} List of conversation turn elements
 */
export function extractConversationTurns(document) {
  const conversationTurns = document.querySelectorAll(
    'article[data-testid^="conversation-turn"]'
  )

  if (!conversationTurns.length) {
    throw new Error(
      "No conversation turns found. Make sure you're on a ChatGPT conversation page."
    )
  }

  return conversationTurns
}

/**
 * Extracts user message content from a conversation turn
 * @param {Element} turn - Conversation turn element
 * @returns {string|null} User message content or null if not found
 */
export function extractUserMessage(turn) {
  const userMessage = turn.querySelector('[data-message-author-role="user"]')
  if (!userMessage) return null

  const userContent = userMessage.querySelector('.whitespace-pre-wrap')
  return userContent ? userContent.innerHTML : null
}

/**
 * Extracts assistant message content from a conversation turn
 * @param {Element} turn - Conversation turn element
 * @returns {string|null} Assistant message content or null if not found
 */
export function extractAssistantMessage(turn) {
  const assistantMessage = turn.querySelector(
    '[data-message-author-role="assistant"]'
  )
  if (!assistantMessage) return null

  // Try markdown prose first, then whitespace-pre-wrap
  let assistantContent = assistantMessage.querySelector('.markdown.prose')
  if (!assistantContent) {
    assistantContent = assistantMessage.querySelector('.whitespace-pre-wrap')
  }

  return assistantContent ? assistantContent.innerHTML : null
}

/**
 * Checks if the current page is a valid ChatGPT conversation page
 * @param {string} url - Current page URL
 * @returns {boolean} True if on a valid ChatGPT page
 */
export function isValidChatGPTPage(url) {
  if (!url || typeof url !== 'string') return false
  return url.includes('chat.openai.com') || url.includes('chatgpt.com')
}
