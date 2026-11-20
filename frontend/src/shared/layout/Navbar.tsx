import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/shared/ui/Button'
import { clasesBoton } from '@/shared/ui/buttonStyles'

function claseLink({ isActive }: { isActive: boolean }): string {
  return `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand/15 text-brand-soft' : 'text-muted hover:bg-surface-2 hover:text-ink'
  }`
}

export function Navbar() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidadCarrito = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0))

  async function cerrarSesion() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Link to="/" className="mr-4 flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-strong text-base">🍽️</span>
            <span>
              Food<span className="text-brand">Store</span>
            </span>
          </Link>
          <NavLink to="/" end className={claseLink}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseLink}>
            Carrito
            {cantidadCarrito > 0 && (
              <span className="ml-1.5 rounded-full bg-brand-strong px-1.5 py-0.5 text-xs font-bold text-white">
                {cantidadCarrito}
              </span>
            )}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseLink}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === 'admin' && (
            <NavLink to="/admin/resumen" className={claseLink}>
              Panel de administración
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right leading-tight">
                <p className="text-sm font-medium">{usuario.full_name}</p>
                <p className="text-xs capitalize text-brand-soft">{usuario.role}</p>
              </div>
              <Button variante="secundario" pequeno onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className={clasesBoton('contorno')}>
                Ingresar
              </Link>
              <Link to="/register" className={clasesBoton('primario')}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>

      {usuario?.role === 'admin' && (
        <nav className="border-t border-line bg-surface/60">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-1 px-4 py-1.5">
            <NavLink to="/admin/resumen" className={claseLink}>
              Resumen
            </NavLink>
            <NavLink to="/admin/categorias" className={claseLink}>
              Categorías
            </NavLink>
            <NavLink to="/admin/productos" className={claseLink}>
              Productos
            </NavLink>
            <NavLink to="/admin/pedidos" className={claseLink}>
              Pedidos
            </NavLink>
            <NavLink to="/admin/usuarios" className={claseLink}>
              Usuarios
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  )
}
