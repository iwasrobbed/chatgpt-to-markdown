import { describe, test, expect, beforeEach } from 'bun:test'
import { JSDOM } from 'jsdom'
import {
  generateFilename,
  triggerDownload,
  validateContent,
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

  describe('generateFilename', () => {
    test('generates filename with current date by default', () => {
      const filename = generateFilename()
      const today = new Date().toISOString().split('T')[0]
      expect(filename).toBe(`ChatGPT-Conversation-${today}.md`)
    })

    test('generates filename with specific date', () => {
      const specificDate = new Date('2024-01-15T10:30:00Z')
      const filename = generateFilename(specificDate)
      expect(filename).toBe('ChatGPT-Conversation-2024-01-15.md')
    })

    test('handles edge dates correctly', () => {
      const newYear = new Date('2024-01-01T00:00:00Z')
      const filename = generateFilename(newYear)
      expect(filename).toBe('ChatGPT-Conversation-2024-01-01.md')
    })

    test('formats single digit months and days correctly', () => {
      const earlyDate = new Date('2024-03-05T12:00:00Z')
      const filename = generateFilename(earlyDate)
      expect(filename).toBe('ChatGPT-Conversation-2024-03-05.md')
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
