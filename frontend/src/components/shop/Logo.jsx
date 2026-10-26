import { Link } from 'react-router-dom'

export const BRAND = 'MADU'

export default function Logo({ to = '/', light = false, className = '' }) {
  return (
    <Link to={to} className={'inline-flex items-center ' + className} aria-label="MADU — về trang chủ">
      <span className={'text-[22px] font-semibold leading-none tracking-[0.28em] ' + (light ? 'text-white' : 'text-brand')}>MADU</span>
    </Link>
  )
}
