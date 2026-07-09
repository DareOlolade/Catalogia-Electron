import { app } from 'electron'
import path from 'path'
import fs from 'fs'

const windowStatePath = path.join(app.getPath('userData'), 'window-state.json')

export function loadWindowState() {
  const defaults = { width: 900, height: 670, isMaximized: false }
  try {
    if (fs.existsSync(windowStatePath)) {
      return JSON.parse(fs.readFileSync(windowStatePath, 'utf8'))
    }
  } catch (error) {
    console.error('Failed to parse saved window state:', error)
  }
  return defaults
}

export function saveWindowState(win) {
  try {
    const isMaximized = win.isMaximized()
    let state = { isMaximized }

    if (!isMaximized) {
      const bounds = win.getBounds()
      state.width = bounds.width
      state.height = bounds.height
      state.x = bounds.x
      state.y = bounds.y
    } else {
      const oldState = loadWindowState()
      state.width = oldState.width
      state.height = oldState.height
      state.x = oldState.x
      state.y = oldState.y
    }

    fs.writeFileSync(windowStatePath, JSON.stringify(state, null, 2))
  } catch (error) {
    console.error('Failed to save window state configuration:', error)
  }
}
