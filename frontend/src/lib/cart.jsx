import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'
import { useAuth } from './auth'

/**
 * Giỏ hàng:
 *  - Đã đăng nhập: lưu ở server (/api/cart/user/*).
 *  - Chưa đăng nhập: lưu tạm trong trình duyệt, tự gộp lên server khi đăng nhập.
 * Mỗi item: { product, color, size, quantity }
 */
const CartContext = createContext(null)
const GUEST_KEY = 'guest_cart'
const SELECT_KEY = 'cart_selected'

function readSelected() {
  try { return new Set(JSON.parse(sessionStorage.getItem(SELECT_KEY) || '[]')) } catch { return new Set() }
}

function readGuest() {
  try { return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]') } catch { return [] }
}
function writeGuest(items) {
  try { localStorage.setItem(GUEST_KEY, JSON.stringify(items)) } catch { /* ignore */ }
}

export function CartProvider({ children }) {
  const { isLoggedIn, isAdmin } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  // Các món được tích chọn để thanh toán (giống ô tích trong giỏ hàng các app mua sắm)
  const [selected, setSelected] = useState(readSelected)
  useEffect(() => {
    try { sessionStorage.setItem(SELECT_KEY, JSON.stringify([...selected])) } catch { /* ignore */ }
  }, [selected])
  const serverMode = isLoggedIn && !isAdmin

  const refresh = useCallback(async () => {
    if (!serverMode) {
      setItems(readGuest())
      setLoading(false)
      return
    }
    try {
      setItems((await api.get('/api/cart/user/my-cart')) || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [serverMode])

  // Gộp giỏ tạm vào tài khoản ngay sau khi đăng nhập
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (serverMode) {
        const guest = readGuest()
        for (const it of guest) {
          try {
            await api.post('/api/cart/user/add', { productSizeId: it.size.id, quantity: it.quantity })
          } catch { /* hết hàng: bỏ qua */ }
        }
        if (guest.length) writeGuest([])
      }
      if (!cancelled) await refresh()
    })()
    return () => { cancelled = true }
  }, [serverMode, refresh])

  const add = useCallback(async (product, color, size, quantity) => {
    if (serverMode) {
      await api.post('/api/cart/user/add', { productSizeId: size.id, quantity })
      await refresh()
      return
    }
    const list = readGuest()
    const found = list.find((i) => i.size.id === size.id)
    const next = (found?.quantity || 0) + quantity
    if (next > size.quantity) throw new Error(`Size ${size.sizeName} chỉ còn ${size.quantity} sản phẩm`)
    if (found) found.quantity = next
    else list.push({ product: slim(product), color: { id: color.id, colorName: color.colorName, linkImage: color.linkImage }, size, quantity })
    writeGuest(list)
    setItems(list)
  }, [serverMode, refresh])

  const update = useCallback(async (sizeId, quantity) => {
    if (quantity < 1) return
    if (serverMode) {
      await api.post('/api/cart/user/update', { productSizeId: sizeId, quantity })
      await refresh()
      return
    }
    const list = readGuest()
    const it = list.find((i) => i.size.id === sizeId)
    if (it) {
      if (quantity > it.size.quantity) throw new Error(`Chỉ còn ${it.size.quantity} sản phẩm`)
      it.quantity = quantity
    }
    writeGuest(list)
    setItems(list)
  }, [serverMode, refresh])

  const remove = useCallback(async (sizeId) => {
    if (serverMode) {
      await api.del('/api/cart/user/remove', { productSizeId: sizeId })
      await refresh()
      return
    }
    const list = readGuest().filter((i) => i.size.id !== sizeId)
    writeGuest(list)
    setItems(list)
  }, [serverMode, refresh])

  const toggle = useCallback((sizeId) => setSelected((s) => {
    const n = new Set(s)
    n.has(sizeId) ? n.delete(sizeId) : n.add(sizeId)
    return n
  }), [])
  const selectAll = useCallback((on) => setSelected(on ? new Set(items.filter((i) => i.size.quantity > 0).map((i) => i.size.id)) : new Set()), [items])
  const selectOnly = useCallback((ids) => setSelected(new Set(ids)), [])

  const value = useMemo(() => {
    const count = items.length
    const subtotal = items.reduce((s, i) => s + i.quantity * (i.product?.price || 0), 0)
    const selectedItems = items.filter((i) => selected.has(i.size.id))
    const selectedSubtotal = selectedItems.reduce((s, i) => s + i.quantity * (i.product?.price || 0), 0)
    return { items, loading, count, subtotal, add, update, remove, refresh, selected, selectedItems, selectedSubtotal, toggle, selectAll, selectOnly }
  }, [items, loading, add, update, remove, refresh, selected, toggle, selectAll, selectOnly])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

function slim(p) {
  return { id: p.id, name: p.name, price: p.price, oldPrice: p.oldPrice, imageBanner: p.imageBanner }
}

export function useCart() {
  return useContext(CartContext)
}
