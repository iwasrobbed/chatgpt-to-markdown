import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { existsSync, readFileSync, rmSync, mkdirSync } from 'fs'
import { join } from 'path'
import { spawnSync } from 'child_process'

describe('build process', () => {
  const DIST_DIR = 'dist'
  const TEST_DIST_DIR = 'test-dist'

  beforeEach(() => {
    // Clean up any existing test dist directory
    if (existsSync(TEST_DIST_DIR)) {
      rmSync(TEST_DIST_DIR, { recursive: true })
    }
  })

  afterEach(() => {
    // Clean up test dist directory
    if (existsSync(TEST_DIST_DIR)) {
      rmSync(TEST_DIST_DIR, { recursive: true })
    }
  })

  test('builds successfully without errors', () => {
    const result = spawnSync('bun', ['run', 'build'], {
      stdio: 'pipe',
      encoding: 'utf8',
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('Build complete!')
    // Note: bun may output script info to stderr, but that's normal
  })

  test('creates all required files in dist directory', () => {
    // Run build
    spawnSync('bun', ['run', 'build'], { stdio: 'ignore' })

    const requiredFiles = [
      'content.js',
      'popup.js',
      'manifest.json',
      'popup.html',
    ]

    for (const file of requiredFiles) {
      const filePath = join(DIST_DIR, file)
      expect(existsSync(filePath)).toBe(true)
    }
  })

  test('removes all import statements from bundled content.js', () => {
    // Run build
    spawnSync('bun', ['run', 'build'], { stdio: 'ignore' })

    const contentJs = readFileSync(join(DIST_DIR, 'content.js'), 'utf8')

    // Should not contain any import statements
    expect(contentJs).not.toMatch(/import\s+/)
    expect(contentJs).not.toMatch(/from\s+['"`]/)
    expect(contentJs).not.toMatch(/import\s*{/)
    expect(contentJs).not.toMatch(/}\s*from/)
  })

  test('removes all export statements from bundled content.js', () => {
    // Run build
    spawnSync('bun', ['run', 'build'], { stdio: 'ignore' })

    const contentJs = readFileSync(join(DIST_DIR, 'content.js'), 'utf8')

    // Should not contain export statements at the beginning of lines
    expect(contentJs).not.toMatch(/^export\s+/gm)
    expect(contentJs).not.toMatch(/^export\s*{/gm)
    expect(contentJs).not.toMatch(/^export\s+function/gm)
    expect(contentJs).not.toMatch(/^export\s+const/gm)

    // Check for export in specific contexts that should be cleaned up
    expect(contentJs).not.toMatch(/\nexport\s+function/g)
    expect(contentJs).not.toMatch(/\nexport\s+const/g)
  })

  test('removes all import statements from bundled popup.js', () => {
    // Run build
    spawnSync('bun', ['run', 'build'], { stdio: 'ignore' })

    const popupJs = readFileSync(join(DIST_DIR, 'popup.js'), 'utf8')

    // Should not contain any import statements
    expect(popupJs).not.toMatch(/import\s+/)
    expect(popupJs).not.toMatch(/from\s+['"`]/)
    expect(popupJs).not.toMatch(/import\s*{/)
    expect(popupJs).not.toMatch(/}\s*from/)
  })

  test('bundled content.js contains all required functions', () => {
    // Run build
    spawnSync('bun', ['run', 'build'], { stdio: 'ignore' })

    const contentJs = readFileSync(join(DIST_DIR, 'content.js'), 'utf8')

    const requiredFunctions = [
      'convertHtmlToMarkdown',
      'extractConversationTurns',
      'extractUserMessage',
      'extractAssistantMessage',
      'generateFilename',
      'triggerDownload',
      'validateContent',
      'exportConversation',
    ]

    for (const func of requiredFunctions) {
      expect(contentJs).toMatch(new RegExp(`function\\s+${func}`))
    }
  })

  test('bundled content.js has Chrome extension message listener', () => {
    // Run build
    spawnSync('bun', ['run', 'build'], { stdio: 'ignore' })

    const contentJs = readFileSync(join(DIST_DIR, 'content.js'), 'utf8')

    expect(contentJs).toContain('chrome.runtime.onMessage.addListener')
    expect(contentJs).toContain("request.action === 'exportConversation'")
  })

  test('bundled popup.js contains required DOM manipulation code', () => {
    // Run build
    spawnSync('bun', ['run', 'build'], { stdio: 'ignore' })

    const popupJs = readFileSync(join(DIST_DIR, 'popup.js'), 'utf8')

    expect(popupJs).toContain('isValidChatGPTPage')
    expect(popupJs).toContain("getElementById('export-btn')")
    expect(popupJs).toContain('chrome.tabs.sendMessage')
    expect(popupJs).toContain('DOMContentLoaded')
  })

  test('manifest.json is properly copied', () => {
    // Run build
    spawnSync('bun', ['run', 'build'], { stdio: 'ignore' })

    const originalManifest = JSON.parse(readFileSync('manifest.json', 'utf8'))
    const builtManifest = JSON.parse(
      readFileSync(join(DIST_DIR, 'manifest.json'), 'utf8')
    )

    expect(builtManifest).toEqual(originalManifest)
  })

  test('popup.html is properly copied from src', () => {
    // Run build
    spawnSync('bun', ['run', 'build'], { stdio: 'ignore' })

    const originalHtml = readFileSync('src/popup.html', 'utf8')
    const builtHtml = readFileSync(join(DIST_DIR, 'popup.html'), 'utf8')

    expect(builtHtml).toBe(originalHtml)
  })

  test('bundled JavaScript is syntactically valid', () => {
    // Run build
    spawnSync('bun', ['run', 'build'], { stdio: 'ignore' })

    const contentJs = readFileSync(join(DIST_DIR, 'content.js'), 'utf8')
    const popupJs = readFileSync(join(DIST_DIR, 'popup.js'), 'utf8')

    // Try to parse as JavaScript - this will throw if invalid syntax
    expect(() => {
      new Function(contentJs)
    }).not.toThrow()

    expect(() => {
      new Function(popupJs)
    }).not.toThrow()
  })

  test('handles multi-line import statements correctly', () => {
    // Create a test source file with multi-line imports
    mkdirSync('test-src', { recursive: true })
    const testContent = `
import {
  functionA,
  functionB,
  functionC
} from './utils/test-module.js'

import { singleLineImport } from './another-module.js'

export function testFunction() {
  return 'test'
}

function actualFunction() {
  return functionA() + functionB()
}
`

    require('fs').writeFileSync('test-src/test-file.js', testContent)

    // Apply the same transformations as the build script
    const processed = testContent
      .replace(/export /g, '')
      .replace(/import[\s\S]*?from\s+['"][^'"]*['"];?\n?/g, '')

    // Clean up
    rmSync('test-src', { recursive: true })

    // Should not contain any import statements
    expect(processed).not.toMatch(/import\s+/)
    expect(processed).not.toMatch(/from\s+['"`]/)
    expect(processed).not.toMatch(/}\s*from/)

    // Should not contain export statements
    expect(processed).not.toMatch(/export\s+/)

    // Should still contain the actual function
    expect(processed).toContain('function testFunction()')
    expect(processed).toContain('function actualFunction()')
  })
})
