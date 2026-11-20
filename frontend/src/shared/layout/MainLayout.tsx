import { Outlet, useLocation } from 'react-router-dom'
import { Toast } from '@/shared/components/Toast'
import { Footer } from './Footer'
import { FondoCollage } from './FondoCollage'
import { Navbar } from './Navbar'

export function MainLayout() {
  const { pathname } = useLocation()

  return (
    <div className="relative isolate flex min-h-screen flex-col text-ink">
      <FondoCollage tenue={pathname.startsWith('/admin')} />
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  )
}
