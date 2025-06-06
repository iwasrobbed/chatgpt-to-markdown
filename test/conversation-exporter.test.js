import { describe, test, expect, beforeEach, mock } from 'bun:test'
import { JSDOM } from 'jsdom'
import { exportConversation } from '../src/conversation-exporter.js'

describe('conversation-exporter', () => {
  let document, window

  beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://chatgpt.com/c/abc12345-6789-def0-1234-567890abcdef',
    })
    document = dom.window.document
    window = dom.window

    // Mock DOM globals
    global.document = document
    global.window = window
    global.Blob = window.Blob
    global.URL = {
      createObjectURL: () => 'blob:mock-url',
      revokeObjectURL: () => {},
    }

    // Mock console methods
    global.console = {
      log: mock(() => {}),
      error: mock(() => {}),
    }
  })

  describe('exportConversation', () => {
    test('exports a simple conversation successfully', async () => {
      document.body.innerHTML = `
        <article data-testid="conversation-turn-1">
          <div data-message-author-role="user">
            <div class="whitespace-pre-wrap">Hello, ChatGPT!</div>
          </div>
        </article>
        <article data-testid="conversation-turn-2">
          <div data-message-author-role="assistant">
            <div class="markdown prose">Hello! How can I help you today?</div>
          </div>
        </article>
      `

      // Mock DOM methods
      const mockAnchor = {
        download: '',
        href: '',
        style: { display: '' },
        click: mock(() => {}),
      }

      document.createElement = mock(() => mockAnchor)
      document.body.appendChild = mock(() => {})
      document.body.removeChild = mock(() => {})

      const result = await exportConversation(document)

      expect(result.messageCount).toBe(2)
      expect(result.filename).toMatch(/ChatGPT-[a-f0-9]+-\d+\.md/)
      expect(result.characterCount).toBeGreaterThan(0)
      expect(mockAnchor.click).toHaveBeenCalled()
    })

    test('exports conversation with complex HTML formatting', async () => {
      document.body.innerHTML = `
        <article data-testid="conversation-turn-1">
          <div data-message-author-role="user">
            <div class="whitespace-pre-wrap">Can you explain <code>async/await</code>?</div>
          </div>
        </article>
        <article data-testid="conversation-turn-2">
          <div data-message-author-role="assistant">
            <div class="markdown prose">
              <p>Sure! <strong>Async/await</strong> is a way to handle <em>asynchronous</em> code.</p>
              <pre><code class="language-javascript">async function example() {
  const result = await fetch('/api/data');
  return result.json();
}</code></pre>
            </div>
          </div>
        </article>
      `

      const mockAnchor = {
        download: '',
        href: '',
        style: { display: '' },
        click: mock(() => {}),
      }

      document.createElement = mock(() => mockAnchor)
      document.body.appendChild = mock(() => {})
      document.body.removeChild = mock(() => {})

      const result = await exportConversation(document)

      expect(result.messageCount).toBe(2)
      expect(result.characterCount).toBeGreaterThan(0)

      // The content should contain properly formatted markdown
      const downloadCall = document.createElement.mock.calls[0]
      expect(downloadCall).toBeDefined()
    })

    test('handles user-only messages', async () => {
      document.body.innerHTML = `
        <article data-testid="conversation-turn-1">
          <div data-message-author-role="user">
            <div class="whitespace-pre-wrap">Just a user message</div>
          </div>
        </article>
      `

      const mockAnchor = {
        download: '',
        href: '',
        style: { display: '' },
        click: mock(() => {}),
      }

      document.createElement = mock(() => mockAnchor)
      document.body.appendChild = mock(() => {})
      document.body.removeChild = mock(() => {})

      const result = await exportConversation(document)

      expect(result.messageCount).toBe(1)
      expect(result.characterCount).toBeGreaterThan(0)
    })

    test('handles assistant messages with fallback content selector', async () => {
      document.body.innerHTML = `
        <article data-testid="conversation-turn-1">
          <div data-message-author-role="assistant">
            <div class="whitespace-pre-wrap">Fallback content without markdown prose</div>
          </div>
        </article>
      `

      const mockAnchor = {
        download: '',
        href: '',
        style: { display: '' },
        click: mock(() => {}),
      }

      document.createElement = mock(() => mockAnchor)
      document.body.appendChild = mock(() => {})
      document.body.removeChild = mock(() => {})

      const result = await exportConversation(document)

      expect(result.messageCount).toBe(1)
      expect(result.characterCount).toBeGreaterThan(0)
    })

    test('throws error when no conversation turns found', async () => {
      document.body.innerHTML = '<div>No conversation content</div>'

      await expect(exportConversation(document)).rejects.toThrow(
        "No conversation turns found. Make sure you're on a ChatGPT conversation page."
      )
    })

    test('throws error when no content is extracted', async () => {
      document.body.innerHTML = `
        <article data-testid="conversation-turn-1">
          <div>No valid message content</div>
        </article>
      `

      await expect(exportConversation(document)).rejects.toThrow(
        'No content extracted from conversation'
      )
    })

    test('logs appropriate messages during export', async () => {
      document.body.innerHTML = `
        <article data-testid="conversation-turn-1">
          <div data-message-author-role="user">
            <div class="whitespace-pre-wrap">Test message</div>
          </div>
        </article>
      `

      const mockAnchor = {
        download: '',
        href: '',
        style: { display: '' },
        click: mock(() => {}),
      }

      document.createElement = mock(() => mockAnchor)
      document.body.appendChild = mock(() => {})
      document.body.removeChild = mock(() => {})

      await exportConversation(document)

      expect(console.log).toHaveBeenCalledWith(
        'Starting ChatGPT to Markdown conversion...'
      )
      expect(console.log).toHaveBeenCalledWith('Found 1 conversation turns')
      expect(console.log).toHaveBeenCalledWith(
        'Conversation exported successfully'
      )
    })
  })
})
