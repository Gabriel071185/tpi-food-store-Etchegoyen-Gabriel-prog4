import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(valor: T, demoraMs: number): T {
  const [debounced, setDebounced] = useState(valor)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(valor), demoraMs)
    return () => clearTimeout(timer)
  }, [valor, demoraMs])

  return debounced
}
