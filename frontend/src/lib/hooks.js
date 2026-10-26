import { useCallback, useEffect, useRef, useState } from 'react'

/** Tải dữ liệu bất đồng bộ: const { data, loading, error, reload } = useFetch(() => api.get(...), [deps]) */
export function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const fnRef = useRef(fn)
  fnRef.current = fn
  const seq = useRef(0)

  const reload = useCallback(async () => {
    const id = ++seq.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await fnRef.current()
      if (id === seq.current) setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      if (id === seq.current) setState({ data: null, loading: false, error })
    }
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload() }, deps)
  return { ...state, reload, setData: (data) => setState((s) => ({ ...s, data })) }
}

export function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | MADU` : 'MADU — Quần áo mặc hằng ngày'
  }, [title])
}
