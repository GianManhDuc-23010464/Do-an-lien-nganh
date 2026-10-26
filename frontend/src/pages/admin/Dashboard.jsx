import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js'
import { AlertTriangle } from 'lucide-react'
import { api } from '../../lib/api'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import { formatMoney } from '../../lib/format'
import { PageHeader, Panel } from '../../components/admin/kit'
import { ErrorState, PageLoader } from '../../components/ui'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
const short = new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 })

export default function Dashboard() {
  useDocumentTitle('Tổng quan')
  const thisYear = new Date().getFullYear()
  const [year, setYear] = useState(thisYear)
  const stats = useFetch(() => api.get('/api/statistic/admin/dashboard'), [])
  const revenue = useFetch(() => api.get('/api/statistic/admin/revenue-year', { year }), [year])

  if (stats.loading) return <PageLoader />
  if (stats.error) return <ErrorState error={stats.error} onRetry={stats.reload} />
  const s = stats.data
  const yearTotal = (revenue.data || []).reduce((a, b) => a + (b || 0), 0)

  return (
    <>
      <PageHeader title="Tổng quan" description="Số liệu cập nhật theo thời gian thực từ đơn hàng." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Doanh thu hôm nay" value={formatMoney(s.revenueToday)} />
        <Stat label="Doanh thu tháng này" value={formatMoney(s.revenueMonth)} />
        <Stat label="Đơn chờ xác nhận" value={s.ordersPending} to="/admin/orders?status=1" highlight={s.ordersPending > 0} />
        <Stat label="Đang giao" value={s.ordersShipping} to="/admin/orders?status=3" note={`${s.ordersAwaitingPayment} đơn chờ thanh toán online`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Panel title={`Doanh thu năm ${year}`} actions={
          <select className="field h-9 w-auto text-sm" value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="Chọn năm">
            {[thisYear, thisYear - 1, thisYear - 2].map((y) => <option key={y}>{y}</option>)}
          </select>
        }>
          <p className="text-3xl font-semibold">{formatMoney(yearTotal)}</p>
          <p className="text-sm text-muted">Tổng tiền hàng của các đơn đã thu tiền</p>
          <div className="mt-4 h-72">
            <Bar
              data={{ labels: MONTHS, datasets: [{ data: revenue.data || [], backgroundColor: '#8E2B2B', hoverBackgroundColor: '#6F1F1F', borderRadius: 4, borderSkipped: 'start', maxBarThickness: 28 }] }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => formatMoney(c.parsed.y) } } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: '#7A7A7A' } },
                  y: { border: { display: false }, grid: { color: '#EEEEEE' }, ticks: { color: '#7A7A7A', callback: (v) => short.format(v) } },
                },
              }}
            />
          </div>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-muted">Xem dạng bảng</summary>
            <table className="mt-2 w-full text-left">
              <tbody>{MONTHS.map((m, i) => <tr key={m} className="border-b border-line"><td className="py-1">{m}</td><td className="py-1 text-right">{formatMoney(revenue.data?.[i] || 0)}</td></tr>)}</tbody>
            </table>
          </details>
        </Panel>

        <div className="space-y-6">
          <Panel title="Bán chạy nhất" padded={false}>
            <ul className="divide-y divide-line">
              {(s.topProducts || []).map((p, i) => (
                <li key={p.id}>
                  <Link to={`/admin/products/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-mist/60">
                    <span className="w-4 text-sm font-bold text-muted">{i + 1}</span>
                    <img src={p.image || '/placeholder.svg'} alt="" className="size-10 rounded-sm object-cover" />
                    <span className="line-clamp-1 flex-1 text-sm font-medium">{p.name}</span>
                    <span className="text-sm text-ink-soft">{p.sold} đã bán</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Sắp hết hàng" padded={false}>
            {!s.lowStock?.length ? <p className="px-5 py-4 text-sm text-muted">Tất cả size đều còn trên 5 sản phẩm.</p> : (
              <ul className="divide-y divide-line">
                {s.lowStock.map((x) => (
                  <li key={x.productSizeId}>
                    <Link to={`/admin/imports?new=1&productId=${x.productId}`} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-mist/60">
                      <AlertTriangle className={x.quantity === 0 ? 'size-4 text-danger' : 'size-4 text-warning'} aria-hidden="true" />
                      <span className="min-w-0 flex-1"><span className="line-clamp-1 font-medium">{x.productName}</span><span className="text-muted">{x.color}, size {x.size}</span></span>
                      <span className={x.quantity === 0 ? 'font-bold text-danger' : 'font-semibold'}>{x.quantity === 0 ? 'Hết' : `Còn ${x.quantity}`}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  )
}

function Stat({ label, value, to, highlight, note }) {
  const body = (
    <div className={'h-full rounded-sm border p-5 ' + (highlight ? 'border-brand bg-brand-soft' : 'border-line bg-paper')}>
      <p className={highlight ? 'text-sm font-medium text-brand' : 'text-sm text-muted'}>{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  )
  return to ? <Link to={to} className="block">{body}</Link> : body
}
