import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const BASE =
  'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40'

interface CampoProps {
  label: string
  error?: string
}

function Etiqueta({ label, error, children }: CampoProps & { children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-soft">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  )
}

export function Input({ label, error, ...props }: CampoProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Etiqueta label={label} error={error}>
      <input className={BASE} {...props} />
    </Etiqueta>
  )
}

export function Textarea({
  label,
  error,
  ...props
}: CampoProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Etiqueta label={label} error={error}>
      <textarea rows={3} className={BASE} {...props} />
    </Etiqueta>
  )
}

export function Select({ label, error, ...props }: CampoProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Etiqueta label={label} error={error}>
      <select className={BASE} {...props} />
    </Etiqueta>
  )
}
