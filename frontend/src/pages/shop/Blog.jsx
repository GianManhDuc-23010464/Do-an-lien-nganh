import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { api } from '../../lib/api'
import { useFetch, useDocumentTitle } from '../../lib/hooks'
import { formatDate } from '../../lib/format'
import { safeHtml } from '../../lib/sanitize'
import { Empty, ErrorState, PageLoader, Pagination } from '../../components/ui'

export function BlogList() {
  useDocumentTitle('Tạp chí')
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 0)
  const { data, loading, error, reload } = useFetch(() => api.get('/api/blog/public/findAll', { page, size: 9, sort: 'id,desc' }), [page])
  if (loading) return <PageLoader />
  if (error) return <ErrorState error={error} onRetry={reload} />
  const [first, ...rest] = data?.content || []
  return (
    <div className="container-x pt-8">
      <h1 className="text-2xl font-semibold md:text-[26px]">Tạp chí phối đồ</h1>
      <p className="mt-2 max-w-xl text-ink-soft">Mẹo chọn size, cách phối màu và những món nên có trong tủ đồ.</p>
      {!first ? <Empty icon={Newspaper} title="Chưa có bài viết" /> : (
        <>
          {page === 0 && (
            <Link to={`/blog/${first.id}`} className="group mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
              <div className="aspect-[16/10] overflow-hidden bg-mist"><img src={first.imageBanner || '/placeholder.svg'} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
              <div>
                <p className="text-sm text-muted">{formatDate(first.createdDate)}</p>
                <h2 className="mt-2 text-xl font-semibold group-hover:underline">{first.title}</h2>
                <p className="mt-3 line-clamp-3 text-ink-soft">{first.description}</p>
              </div>
            </Link>
          )}
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {(page === 0 ? rest : data.content).map((b) => (
              <Link key={b.id} to={`/blog/${b.id}`} className="group">
                <div className="aspect-[16/10] overflow-hidden bg-mist"><img src={b.imageBanner || '/placeholder.svg'} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /></div>
                <p className="mt-3 text-xs text-muted">{formatDate(b.createdDate)}</p>
                <h3 className="mt-1 text-lg font-bold group-hover:text-ink">{b.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{b.description}</p>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={data.totalPages} onChange={(p) => setParams({ page: p })} />
        </>
      )}
    </div>
  )
}

export function BlogDetail() {
  const { id } = useParams()
  const { data: b, loading, error, reload } = useFetch(() => api.get('/api/blog/public/findById', { id }), [id])
  useDocumentTitle(b?.title)
  if (loading) return <PageLoader />
  if (error) return <ErrorState error={error} onRetry={reload} />
  return (
    <article className="container-x max-w-3xl pt-8">
      <Link to="/blog" className="text-sm font-semibold text-ink hover:underline">Tạp chí</Link>
      <h1 className="mt-3 text-2xl font-semibold leading-snug md:text-3xl">{b.title}</h1>
      <p className="mt-3 text-sm text-muted">{formatDate(b.createdDate)}{b.user?.fullname ? `, bởi ${b.user.fullname}` : ''}</p>
      {b.imageBanner && <img src={b.imageBanner} alt="" className="mt-8 w-full object-cover" />}
      {b.description && <p className="mt-8 text-xl leading-relaxed text-ink">{b.description}</p>}
      <div className="prose-content mt-6 text-[17px]" dangerouslySetInnerHTML={safeHtml(b.content)} />
    </article>
  )
}
