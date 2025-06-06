import { describe, test, expect } from 'bun:test'
import {
  convertHtmlToMarkdown,
  cleanHtmlEntities,
  normalizeWhitespace,
} from '../src/utils/markdown-converter.js'

describe('markdown-converter', () => {
  describe('convertHtmlToMarkdown', () => {
    test('converts basic HTML tags to markdown', () => {
      const html = '<p>Hello <b>world</b> and <i>universe</i></p>'
      const result = convertHtmlToMarkdown(html)
      expect(result).toBe('Hello **world** and _universe_')
    })

    test('converts headers to markdown', () => {
      const html = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>'
      const result = convertHtmlToMarkdown(html)
      expect(result).toBe('# Title\n\n## Subtitle\n\n### Section')
    })

    test('converts lists to markdown', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
      const result = convertHtmlToMarkdown(html)
      expect(result).toBe('- Item 1\n- Item 2')
    })

    test('converts code blocks correctly', () => {
      const html =
        '<pre><code class="language-javascript">const x = 1;</code></pre>'
      const result = convertHtmlToMarkdown(html)
      expect(result).toContain('```javascript')
      expect(result).toContain('const x = 1;')
    })

    test('converts inline code', () => {
      const html = 'Use <code>console.log</code> to debug'
      const result = convertHtmlToMarkdown(html)
      expect(result).toBe('Use `console.log` to debug')
    })

    test('converts tables to markdown format', () => {
      const html =
        '<table><thead><tr><th>Platform</th><th>Description</th></tr></thead><tbody><tr><td>Mayo Clinic</td><td>Hospital</td></tr></tbody></table>'
      const result = convertHtmlToMarkdown(html)
      expect(result).toContain('| Platform | Description |')
      expect(result).toContain('| --- | --- |')
      expect(result).toContain('| Mayo Clinic | Hospital |')
      // Verify proper table structure
      const lines = result.split('\n')
      expect(lines[0]).toBe('| Platform | Description |')
      expect(lines[1]).toBe('| --- | --- |')
      expect(lines[2]).toBe('| Mayo Clinic | Hospital |')
    })

    test('removes unwanted content', () => {
      const html = 'Code example Copy code const x = 1;'
      const result = convertHtmlToMarkdown(html)
      expect(result).not.toContain('Copy code')
    })

    test('handles empty input', () => {
      expect(convertHtmlToMarkdown('')).toBe('')
    })

    test('handles complex nested HTML', () => {
      const html = '<p>Here is <strong>bold <em>italic</em> text</strong></p>'
      const result = convertHtmlToMarkdown(html)
      expect(result).toBe('Here is **bold _italic_ text**')
    })
  })

  describe('cleanHtmlEntities', () => {
    test('converts HTML entities to characters', () => {
      const text = '&amp; &lt; &gt; &quot; &#39;'
      const result = cleanHtmlEntities(text)
      expect(result).toBe('& < > " \'')
    })

    test('handles text without entities', () => {
      const text = 'Plain text'
      const result = cleanHtmlEntities(text)
      expect(result).toBe('Plain text')
    })

    test('handles mixed content', () => {
      const text = 'Hello &amp; goodbye &quot;world&quot;'
      const result = cleanHtmlEntities(text)
      expect(result).toBe('Hello & goodbye "world"')
    })
  })

  describe('normalizeWhitespace', () => {
    test('removes excessive newlines', () => {
      const text = 'Line 1\n\n\n\nLine 2'
      const result = normalizeWhitespace(text)
      expect(result).toBe('Line 1\n\nLine 2')
    })

    test('cleans up bullet point spacing', () => {
      const text = '- Item 1\n\n\n- Item 2\n\n\n\n- Item 3'
      const result = normalizeWhitespace(text)
      expect(result).toBe('- Item 1\n- Item 2\n- Item 3')
    })

    test('trims whitespace from ends', () => {
      const text = '   \n\nContent\n\n   '
      const result = normalizeWhitespace(text)
      expect(result).toBe('Content')
    })

    test('preserves single newlines', () => {
      const text = 'Line 1\nLine 2\nLine 3'
      const result = normalizeWhitespace(text)
      expect(result).toBe('Line 1\nLine 2\nLine 3')
    })

    test('preserves double newlines for paragraphs', () => {
      const text = 'Paragraph 1\n\nParagraph 2'
      const result = normalizeWhitespace(text)
      expect(result).toBe('Paragraph 1\n\nParagraph 2')
    })
  })
})
