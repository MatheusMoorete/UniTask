import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock do ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
}

window.localStorage = localStorageMock

// Mock do Notification
window.Notification = {
  requestPermission: vi.fn().mockResolvedValue('granted'),
  permission: 'granted'
}

// Mock do Worker
class WorkerMock {
  constructor(stringUrl) {
    this.url = stringUrl
    this.onmessage = () => {}
  }
  
  postMessage(msg) {
    if (msg.type === 'start') {
      this.interval = setInterval(() => {
        this.onmessage({ data: { type: 'tick', timeLeft: msg.timeLeft - 1 } })
      }, msg.interval)
    } else if (msg.type === 'stop') {
      clearInterval(this.interval)
    }
  }
  
  terminate() {
    clearInterval(this.interval)
  }
}

window.Worker = WorkerMock 