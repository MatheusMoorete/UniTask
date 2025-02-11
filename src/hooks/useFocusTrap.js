import { useEffect, useRef } from 'react'

export function useFocusTrap(active = true) {
  const elementRef = useRef(null)

  useEffect(() => {
    if (!active) return

    function handleFocus(e) {
      const focusableElements = elementRef.current?.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      )
      
      if (!focusableElements?.length) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Se pressionar Shift + Tab
      if (e.shiftKey && e.key === 'Tab') {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      }
      // Se pressionar Tab
      else if (e.key === 'Tab') {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    const element = elementRef.current
    if (element) {
      element.addEventListener('keydown', handleFocus)
      // Foca no primeiro elemento quando o componente montar
      const firstFocusable = element.querySelector(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      )
      if (firstFocusable) {
        firstFocusable.focus()
      }
    }

    return () => {
      if (element) {
        element.removeEventListener('keydown', handleFocus)
      }
    }
  }, [active])

  return elementRef
} 