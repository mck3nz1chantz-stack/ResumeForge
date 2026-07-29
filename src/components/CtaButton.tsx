import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { usePressFlash, useActionLabel } from '../hooks/usePressFlash'

type Variant = 'default' | 'primary' | 'danger'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
  /** After async click, show done/error label briefly */
  actionLabels?: { busy: string; done: string; error?: string }
  onAsyncClick?: () => void | Promise<void>
}

const variantClass: Record<Variant, string> = {
  default: 'rf-btn',
  primary: 'rf-btn rf-btn-primary',
  danger: 'rf-btn rf-btn-danger',
}

/**
 * Button with press flash + optional busy/done/error label feedback.
 */
export function CtaButton({
  variant = 'default',
  className = '',
  children,
  actionLabels,
  onAsyncClick,
  onClick,
  disabled,
  type = 'button',
  ...rest
}: Props) {
  const { stateClass, pressProps, pulse } = usePressFlash()
  const idle =
    typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : null
  const labels = useActionLabel(
    idle ?? '',
    actionLabels?.busy ?? 'Working…',
    actionLabels?.done ?? 'Done',
    { error: actionLabels?.error },
  )

  const showLabelSwap = Boolean(actionLabels && idle != null)
  const phase = labels.phase

  return (
    <button
      type={type}
      disabled={disabled || phase === 'busy'}
      aria-busy={phase === 'busy' || undefined}
      aria-live={
        phase === 'error' ? 'assertive' : phase === 'done' ? 'polite' : undefined
      }
      className={`${variantClass[variant]} ${stateClass} ${className} ${
        phase === 'done' ? 'rf-is-flash' : ''
      } ${phase === 'error' ? 'border-red-700/70 text-red-100' : ''}`}
      {...rest}
      onPointerDown={(e) => {
        pressProps.onPointerDown()
        rest.onPointerDown?.(e)
      }}
      onPointerUp={(e) => {
        pressProps.onPointerUp()
        rest.onPointerUp?.(e)
      }}
      onPointerCancel={(e) => {
        pressProps.onPointerCancel()
        rest.onPointerCancel?.(e)
      }}
      onPointerLeave={(e) => {
        pressProps.onPointerLeave()
        rest.onPointerLeave?.(e)
      }}
      onClick={(e) => {
        pulse()
        if (onAsyncClick && actionLabels) {
          e.preventDefault()
          void labels.run(onAsyncClick)
          return
        }
        onClick?.(e)
      }}
    >
      {showLabelSwap ? labels.label : children}
    </button>
  )
}
