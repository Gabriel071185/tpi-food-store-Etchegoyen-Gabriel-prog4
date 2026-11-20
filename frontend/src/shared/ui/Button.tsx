import type { ButtonHTMLAttributes } from 'react'
import { clasesBoton } from './buttonStyles'
import type { Variante } from './buttonStyles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  pequeno?: boolean
}

export function Button({
  variante = 'primario',
  pequeno = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return <button type={type} className={`${clasesBoton(variante, pequeno)} ${className}`} {...props} />
}
