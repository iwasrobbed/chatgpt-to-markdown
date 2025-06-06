import { describe, test, expect, beforeEach } from 'bun:test'
import { JSDOM } from 'jsdom'
import {
  extractConversationTurns,
  extractUserMessage,
  extractAssistantMessage,
  isValidChatGPTPage,
} from '../src/utils/dom-extractor.js'

describe('dom-extractor', () => {
  let document

  beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    document = dom.window.document
    global.document = document
  })

  describe('extractConversationTurns', () => {
    test('extracts conversation turns successfully', () => {
      document.body.innerHTML = `
        <article data-testid="conversation-turn-1">Turn 1</article>
        <article data-testid="conversation-turn-2">Turn 2</article>
      `

      const turns = extractConversationTurns(document)
      expect(turns.length).toBe(2)
    })

    test('throws error when no turns found', () => {
      document.body.innerHTML = '<div>No conversation turns</div>'

      expect(() => extractConversationTurns(document)).toThrow(
        "No conversation turns found. Make sure you're on a ChatGPT conversation page."
      )
    })

    test('finds turns with various testid formats', () => {
      document.body.innerHTML = `
        <article data-testid="conversation-turn-user-1">User turn</article>
        <article data-testid="conversation-turn-assistant-2">Assistant turn</article>
      `

      const turns = extractConversationTurns(document)
      expect(turns.length).toBe(2)
    })
  })

  describe('extractUserMessage', () => {
    test('extracts user message content', () => {
      const turn = document.createElement('article')
      turn.innerHTML = `
        <div data-message-author-role="user">
          <div class="whitespace-pre-wrap">Hello, how are you?</div>
        </div>
      `

      const content = extractUserMessage(turn)
      expect(content).toBe('Hello, how are you?')
    })

    test('returns null when no user message found', () => {
      const turn = document.createElement('article')
      turn.innerHTML = '<div>No user message</div>'

      const content = extractUserMessage(turn)
      expect(content).toBeNull()
    })

    test('returns null when user message has no content', () => {
      const turn = document.createElement('article')
      turn.innerHTML = `
        <div data-message-author-role="user">
          <div>No whitespace-pre-wrap content</div>
        </div>
      `

      const content = extractUserMessage(turn)
      expect(content).toBeNull()
    })
  })

  describe('extractAssistantMessage', () => {
    test('extracts assistant message from markdown prose', () => {
      const turn = document.createElement('article')
      turn.innerHTML = `
        <div data-message-author-role="assistant">
          <div class="markdown prose">I'm doing well, thank you!</div>
        </div>
      `

      const content = extractAssistantMessage(turn)
      expect(content).toBe("I'm doing well, thank you!")
    })

    test('falls back to whitespace-pre-wrap when no markdown prose', () => {
      const turn = document.createElement('article')
      turn.innerHTML = `
        <div data-message-author-role="assistant">
          <div class="whitespace-pre-wrap">Fallback content</div>
        </div>
      `

      const content = extractAssistantMessage(turn)
      expect(content).toBe('Fallback content')
    })

    test('returns null when no assistant message found', () => {
      const turn = document.createElement('article')
      turn.innerHTML = '<div>No assistant message</div>'

      const content = extractAssistantMessage(turn)
      expect(content).toBeNull()
    })

    test('prefers markdown prose over whitespace-pre-wrap', () => {
      const turn = document.createElement('article')
      turn.innerHTML = `
        <div data-message-author-role="assistant">
          <div class="markdown prose">Preferred content</div>
          <div class="whitespace-pre-wrap">Fallback content</div>
        </div>
      `

      const content = extractAssistantMessage(turn)
      expect(content).toBe('Preferred content')
    })
  })

  describe('isValidChatGPTPage', () => {
    test('returns true for chat.openai.com URLs', () => {
      expect(isValidChatGPTPage('https://chat.openai.com/c/123')).toBe(true)
      expect(isValidChatGPTPage('https://chat.openai.com/')).toBe(true)
    })

    test('returns true for chatgpt.com URLs', () => {
      expect(isValidChatGPTPage('https://chatgpt.com/c/123')).toBe(true)
      expect(isValidChatGPTPage('https://chatgpt.com/')).toBe(true)
    })

    test('returns false for other URLs', () => {
      expect(isValidChatGPTPage('https://google.com')).toBe(false)
      expect(isValidChatGPTPage('https://github.com')).toBe(false)
      expect(isValidChatGPTPage('about:blank')).toBe(false)
    })

    test('returns false for empty or invalid URLs', () => {
      expect(isValidChatGPTPage('')).toBe(false)
      expect(isValidChatGPTPage(null)).toBe(false)
      expect(isValidChatGPTPage(undefined)).toBe(false)
    })
  })
})
