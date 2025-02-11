import { useState, useEffect, useRef, useCallback } from 'react'

export function useVirtualList(items, options = {}) {
  const {
    itemHeight = 50,
    overscan = 3,
    windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  } = options

  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef(null)

  const totalHeight = items.length * itemHeight
  const visibleItems = Math.ceil(windowHeight / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + windowHeight) / itemHeight) + overscan
  )

  const visibleData = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return {
    containerProps: {
      ref: containerRef,
      style: {
        height: windowHeight,
        overflow: 'auto',
        position: 'relative'
      }
    },
    virtualItems: visibleData.map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute',
        top: 0,
        transform: `translateY(${offsetY + index * itemHeight}px)`,
        width: '100%',
        height: itemHeight
      }
    })),
    totalHeight
  }
} 