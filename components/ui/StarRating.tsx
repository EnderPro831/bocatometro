'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  label?: string
}

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showValue = true,
  label,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  const sizeClass = {
    sm: 'w-5 h-5 text-base',
    md: 'w-7 h-7 text-xl',
    lg: 'w-9 h-9 text-2xl',
  }[size]

  const valueSizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size]

  // Convertimos la nota de 10 a 5 para las estrellitas
  const starsValue = value / 2
  const starsHovered = hovered / 2

  const getStarFill = (starIndex: number) => {
    const active = hovered > 0 ? starsHovered : starsValue
    if (active >= starIndex) return 'full'
    if (active >= starIndex - 0.5) return 'half'
    return 'empty'
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="input-label">{label}</span>
      )}
      <div className="flex items-center gap-2">
        {/* Estrellas */}
        <div
          className="flex items-center gap-0.5"
          onMouseLeave={() => !readOnly && setHovered(0)}
        >
          {[2, 4, 6, 8, 10].map((starValue) => {
            const fill = getStarFill(starValue / 2)
            return (
              <button
                key={starValue}
                type="button"
                disabled={readOnly}
                className={cn(
                  sizeClass,
                  'relative flex items-center justify-center transition-transform duration-100',
                  !readOnly && 'cursor-pointer hover:scale-110',
                  readOnly && 'cursor-default'
                )}
                onClick={() => !readOnly && onChange?.(starValue)}
                onMouseEnter={() => !readOnly && setHovered(starValue)}
              >
                {fill === 'full' && (
                  <span className="text-bocata-mustard drop-shadow-sm" style={{ fontSize: 'inherit' }}>★</span>
                )}
                {fill === 'half' && (
                  <span className="relative" style={{ fontSize: 'inherit' }}>
                    <span className="text-cream-300 dark:text-cream-600">★</span>
                    <span
                      className="absolute inset-0 text-bocata-mustard overflow-hidden"
                      style={{ width: '50%' }}
                    >★</span>
                  </span>
                )}
                {fill === 'empty' && (
                  <span className="text-cream-300 dark:text-cream-600" style={{ fontSize: 'inherit' }}>★</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Valor numérico */}
        {showValue && (
          <span
            className={cn(
              'font-display font-bold',
              valueSizeClass,
              value >= 8
                ? 'text-green-600 dark:text-green-400'
                : value >= 6
                ? 'text-bocata-mustard'
                : value >= 4
                ? 'text-orange-500'
                : 'text-bocata-red'
            )}
          >
            {value > 0 ? value.toFixed(1) : '—'}
          </span>
        )}
      </div>
    </div>
  )
}

// Versión interactiva para formularios (nota 1-10, pasos de 0.5)
interface ScoreInputProps {
  label: string
  emoji?: string
  value: number
  onChange: (value: number) => void
}

export function ScoreInput({ label, emoji, value, onChange }: ScoreInputProps) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-cream-50 dark:bg-bocata-dark border border-cream-200 dark:border-bocata-brown/30">
      <div className="flex items-center justify-between">
        <span className="text-sm font-body font-medium text-bocata-brown dark:text-cream-300 flex items-center gap-1.5">
          {emoji && <span>{emoji}</span>}
          {label}
        </span>
        <span
          className={cn(
            'font-display font-bold text-xl',
            value >= 8
              ? 'text-green-600 dark:text-green-400'
              : value >= 6
              ? 'text-bocata-mustard'
              : value >= 4
              ? 'text-orange-500'
              : 'text-bocata-red'
          )}
        >
          {value.toFixed(1)}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--color-red) 0%, var(--color-red) ${(value - 1) / 9 * 100}%, var(--color-border) ${(value - 1) / 9 * 100}%, var(--color-border) 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-bocata-brown dark:text-cream-500">
        <span>1 — Criminal</span>
        <span>10 — Legendario</span>
      </div>
    </div>
  )
}
