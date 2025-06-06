/**
 * Popup script for ChatGPT to Markdown extension UI
 */

import { isValidChatGPTPage } from './utils/dom-extractor.js'

document.addEventListener('DOMContentLoaded', function () {
  const exportBtn = document.getElementById('export-btn')
  const openDownloadsBtn = document.getElementById('open-downloads-btn')
  const status = document.getElementById('status')
  const downloadInfo = document.getElementById('download-info')
  const filenameEl = document.getElementById('filename')

  function showStatus(message, type = 'info') {
    status.textContent = message
    status.className = `status ${type}`
    status.style.display = 'block'

    if (type === 'success') {
      setTimeout(() => {
        status.style.display = 'none'
      }, 3000)
    }
  }

  function showDownloadInfo(filename) {
    filenameEl.textContent = filename
    downloadInfo.style.display = 'block'
    openDownloadsBtn.style.display = 'block'
  }

  function hideDownloadInfo() {
    downloadInfo.style.display = 'none'
    openDownloadsBtn.style.display = 'none'
  }

  // Handle "Open Downloads" button click
  openDownloadsBtn.addEventListener('click', function () {
    chrome.tabs.create({ url: 'chrome://downloads/' })
  })

  exportBtn.addEventListener('click', async function () {
    exportBtn.disabled = true
    exportBtn.textContent = 'Exporting...'
    hideDownloadInfo()

    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })

      // Check if we're on a ChatGPT page
      if (!isValidChatGPTPage(tab.url)) {
        throw new Error('Please navigate to a ChatGPT conversation page first')
      }

      // Send message to content script to trigger export
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'exportConversation',
      })

      if (response.success) {
        showStatus(`✓ Exported ${response.messageCount} messages`, 'success')
        showDownloadInfo(response.filename)
      } else {
        throw new Error(response.error || 'Failed to export conversation')
      }
    } catch (error) {
      console.error('Export failed:', error)
      showStatus(`× ${error.message}`, 'error')
    } finally {
      exportBtn.disabled = false
      exportBtn.textContent = 'Export Conversation'
    }
  })

  // Check if we're on a valid page on load
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0]
    if (!isValidChatGPTPage(tab.url)) {
      exportBtn.disabled = true
      exportBtn.textContent = '⚠ ChatGPT page required'
      showStatus('Navigate to chat.openai.com or chatgpt.com first', 'error')
    }
  })
})
