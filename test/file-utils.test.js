import { describe, test, expect, beforeEach } from 'bun:test'
import { JSDOM } from 'jsdom'
import {
  generateFilename,
  triggerDownload,
  validateContent,
  extractConversationId,
} from '../src/utils/file-utils.js'

describe('file-utils', () => {
  let document, window

  beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
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
  })

  describe('extractConversationId', () => {
    test('extracts conversation ID from chatgpt.com URL', () => {
      const url = 'https://chatgpt.com/c/abc12345-6789-def0-1234-567890abcdef'
      const id = extractConversationId(url)
      expect(id).toBe('abc12345-6789-def0-1234-567890abcdef')
    })

    test('extracts conversation ID from chat.openai.com URL', () => {
      const url =
        'https://chat.openai.com/c/abcd1234-5678-90ef-1234-567890abcdef'
      const id = extractConversationId(url)
      expect(id).toBe('abcd1234-5678-90ef-1234-567890abcdef')
    })

    test('returns null for URLs without conversation ID', () => {
      const url = 'https://chatgpt.com/auth/login'
      const id = extractConversationId(url)
      expect(id).toBe(null)
    })

    test('returns null for invalid URLs', () => {
      const url = 'https://example.com'
      const id = extractConversationId(url)
      expect(id).toBe(null)
    })
  })

  describe('generateFilename', () => {
    test('generates filename with current date by default', () => {
      const filename = generateFilename()
      const currentTimestamp = Math.floor(Date.now() / 1000)
      expect(filename).toMatch(/^ChatGPT-\d+\.md$/)

      // Extract timestamp from filename and verify it's close to current time
      const match = filename.match(/ChatGPT-(\d+)\.md/)
      const fileTimestamp = parseInt(match[1])
      expect(Math.abs(fileTimestamp - currentTimestamp)).toBeLessThan(2) // Within 2 seconds
    })

    test('generates filename with specific date', () => {
      const specificDate = new Date('2024-01-15T10:30:00Z')
      const expectedTimestamp = Math.floor(specificDate.getTime() / 1000)
      const filename = generateFilename(specificDate)
      expect(filename).toBe(`ChatGPT-${expectedTimestamp}.md`)
    })

    test('generates filename with conversation ID', () => {
      const specificDate = new Date('2024-01-15T10:30:00Z')
      const expectedTimestamp = Math.floor(specificDate.getTime() / 1000)
      const conversationId = 'abc12345-6789-def0-1234-567890abcdef'
      const filename = generateFilename(specificDate, conversationId)
      expect(filename).toBe(`ChatGPT-abc12345-${expectedTimestamp}.md`)
    })

    test('handles edge dates correctly', () => {
      const newYear = new Date('2024-01-01T00:00:00Z')
      const expectedTimestamp = Math.floor(newYear.getTime() / 1000)
      const filename = generateFilename(newYear)
      expect(filename).toBe(`ChatGPT-${expectedTimestamp}.md`)
    })

    test('formats epoch timestamps correctly', () => {
      const specificDate = new Date('2024-03-05T12:00:00Z')
      const expectedTimestamp = Math.floor(specificDate.getTime() / 1000)
      const filename = generateFilename(specificDate)
      expect(filename).toBe(`ChatGPT-${expectedTimestamp}.md`)
    })
  })

  describe('triggerDownload', () => {
    test('creates download link and triggers click', async () => {
      const content = 'Test markdown content'
      const filename = 'test-file.md'

      // Mock createElement and appendChild
      const mockAnchor = {
        download: '',
        href: '',
        style: { display: '' },
        click: () => {},
      }

      document.createElement = () => mockAnchor
      document.body.appendChild = () => {}
      document.body.removeChild = () => {}

      await triggerDownload(content, filename)

      expect(mockAnchor.download).toBe(filename)
      expect(mockAnchor.href).toBe('blob:mock-url')
      expect(mockAnchor.style.display).toBe('none')
    })

    test('handles empty content', async () => {
      const content = ''
      const filename = 'empty-file.md'

      const mockAnchor = {
        download: '',
        href: '',
        style: { display: '' },
        click: () => {},
      }

      document.createElement = () => mockAnchor
      document.body.appendChild = () => {}
      document.body.removeChild = () => {}

      await expect(triggerDownload(content, filename)).resolves.toBeUndefined()
    })
  })

  describe('validateContent', () => {
    test('passes validation for valid content', () => {
      const content = 'Valid markdown content'
      expect(() => validateContent(content)).not.toThrow()
    })

    test('throws error for empty string', () => {
      expect(() => validateContent('')).toThrow(
        'No content extracted from conversation'
      )
    })

    test('throws error for null content', () => {
      expect(() => validateContent(null)).toThrow(
        'No content extracted from conversation'
      )
    })

    test('throws error for undefined content', () => {
      expect(() => validateContent(undefined)).toThrow(
        'No content extracted from conversation'
      )
    })

    test('throws error for whitespace-only content', () => {
      expect(() => validateContent('   \n\t   ')).toThrow(
        'No content extracted from conversation'
      )
    })

    test('passes validation for content with leading/trailing whitespace', () => {
      const content = '  Valid content  '
      expect(() => validateContent(content)).not.toThrow()
    })
  })
})
