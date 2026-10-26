import DOMPurify from 'dompurify'

/** Lọc HTML (mô tả sản phẩm, nội dung blog) trước khi hiển thị để chống XSS. */
export function safeHtml(html) {
  return { __html: DOMPurify.sanitize(html || '', { USE_PROFILES: { html: true } }) }
}
