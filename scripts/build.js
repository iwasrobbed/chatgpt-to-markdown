#!/usr/bin/env bun

/**
 * Build script for Chrome extension
 * Bundles the modular source code into Chrome-compatible files
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs'
import { join } from 'path'

const SRC_DIR = 'src'
const DIST_DIR = 'dist'
const ROOT_DIR = '.'

// Create dist directory
mkdirSync(DIST_DIR, { recursive: true })

console.log('Building Chrome Extension...')

// Read source files
const markdownConverter = readFileSync(
  join(SRC_DIR, 'utils/markdown-converter.js'),
  'utf8'
)
const domExtractor = readFileSync(
  join(SRC_DIR, 'utils/dom-extractor.js'),
  'utf8'
)
const fileUtils = readFileSync(join(SRC_DIR, 'utils/file-utils.js'), 'utf8')
const conversationExporter = readFileSync(
  join(SRC_DIR, 'conversation-exporter.js'),
  'utf8'
)
const popupSource = readFileSync(join(SRC_DIR, 'popup.js'), 'utf8')
const contentSource = readFileSync(join(SRC_DIR, 'content.js'), 'utf8')

// Bundle content.js - inline all modules since Chrome extensions don't support ES modules in content scripts
const contentScript = `
// Content script for ChatGPT to Markdown extension
// This runs on ChatGPT pages and handles the conversion
// Built from modular source files

${markdownConverter
  .replace(/import[\s\S]*?from\s+['"][^'"]*['"];?\n?/g, '')
  .replace(/^export\s+/gm, '')}

${domExtractor
  .replace(/import[\s\S]*?from\s+['"][^'"]*['"];?\n?/g, '')
  .replace(/^export\s+/gm, '')}

${fileUtils
  .replace(/import[\s\S]*?from\s+['"][^'"]*['"];?\n?/g, '')
  .replace(/^export\s+/gm, '')}

${conversationExporter
  .replace(/import[\s\S]*?from\s+['"][^'"]*['"];?\n?/g, '')
  .replace(/^export\s+/gm, '')}

${contentSource
  .replace(/import[\s\S]*?from\s+['"][^'"]*['"];?\n?/g, '')
  .replace(/^export\s+/gm, '')}
`

// Bundle popup.js - inline the DOM utility functions
const popupScript = `
// Popup script for ChatGPT to Markdown extension UI
// Built from modular source files

${domExtractor
  .replace(/import[\s\S]*?from\s+['"][^'"]*['"];?\n?/g, '')
  .replace(/^export\s+/gm, '')}

${popupSource
  .replace(/import[\s\S]*?from\s+['"][^'"]*['"];?\n?/g, '')
  .replace(/^export\s+/gm, '')}
`

// Write bundled files
writeFileSync(join(DIST_DIR, 'content.js'), contentScript)
writeFileSync(join(DIST_DIR, 'popup.js'), popupScript)

// Copy other required files
copyFileSync(join(ROOT_DIR, 'manifest.json'), join(DIST_DIR, 'manifest.json'))
copyFileSync(join(SRC_DIR, 'popup.html'), join(DIST_DIR, 'popup.html'))

console.log('✓ Built content.js')
console.log('✓ Built popup.js')
console.log('✓ Copied manifest.json')
console.log('✓ Copied popup.html')
console.log('\nBuild complete! Extension files are in the dist/ directory.')
console.log("Load the dist/ directory in Chrome's Developer Mode.")
