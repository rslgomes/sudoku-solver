import React, { useRef } from 'react'
import { useGrid } from '../../contexts/GridContext'
import type { CellData } from '../../libs/types'
import {
  getBorders,
  getCellLabel,
  getNeighbors,
} from '../../libs/gridInputHelpers'

export default function GridInput() {
  const gridMeta = useGrid()
  const { setGridData } = gridMeta

  const refs = useRef<Array<HTMLInputElement | null>>([])
  const submitButtonRef = useRef<HTMLButtonElement | null>(null)

  const handleInputKeyDown = (event: React.KeyboardEvent, index: number) => {
    const neighbors = getNeighbors(index)

    const focusAndSelect = (input: HTMLInputElement | null) => {
      if (!input) return
      input?.focus()
      setTimeout(() => input.select(), 0)
    }

    switch (event.key) {
      case 'Enter':
        submitButtonRef.current?.click()
        break
      case 'ArrowRight':
        focusAndSelect(refs.current[neighbors.right])
        break
      case 'ArrowLeft':
        focusAndSelect(refs.current[neighbors.left])
        break
      case 'ArrowUp':
        focusAndSelect(refs.current[neighbors.up])
        break
      case 'ArrowDown':
        focusAndSelect(refs.current[neighbors.down])
        break
      case 'Backspace':
        setTimeout(() => focusAndSelect(refs.current[index - 1]))
        break
      case 'Delete':
        if (event.shiftKey) handleInputClear()
        else setTimeout(() => focusAndSelect(refs.current[index]))
        break
      case 'Tab':
        event.preventDefault()
        submitButtonRef.current?.focus()
        break
    }
  }

  const handleInputClear = () => {
    refs.current.forEach((input) => {
      if (input) input.value = ''
    })
    refs.current[0]?.focus()
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const values = refs.current.map((input) => input?.value.trim() || '')
    const parsed = values.map((value) => {
      const returnSquare: CellData = { pencilMarks: [] }
      const num = parseInt(value, 10)
      const isValid = value !== '0' && value !== '-' && !isNaN(num)
      if (isValid) returnSquare.penMark = num
      return returnSquare
    })

    setGridData(parsed)
  }

  return (
    <div className="px-8">
      <form onSubmit={handleSubmit}>
        <label className="text-fg1 font-bold text-lg" id="grid-input-label">
          Grid Input
        </label>
        <div
          className="mt-1 w-full max-w-56 aspect-square border border-secondary-border p-[1px] bg-secondary-border grid grid-rows-9 grid-cols-1 gap-[1px]"
          role="grid"
          aria-label="Sudoku input grid"
          aria-labelledby="grid-input-label"
          aria-colcount={9}
          aria-rowcount={9}
        >
          {Array.from({ length: 9 }).map((_, rowIndex) => {
            return (
              <div
                className="grid grid-cols-9 grid-rows-1 gap-[1px]"
                role="row"
                key={rowIndex}
              >
                {Array.from({ length: 9 }).map((_, colIndex) => {
                  const i = rowIndex * 9 + colIndex
                  const borderClasses = getBorders(rowIndex, colIndex)

                  return (
                    <input
                      key={i}
                      role="gridcell"
                      aria-readonly="false"
                      aria-colindex={colIndex + 1}
                      aria-rowindex={rowIndex + 1}
                      aria-label={`Cell ${getCellLabel(colIndex, rowIndex)}`}
                      ref={(el) => {
                        refs.current[i] = el
                      }}
                      defaultValue={''}
                      maxLength={1}
                      onBeforeInput={(e) => {
                        const ALLOWED_CHARS_REGEX = /^[1-9\s0-]$/
                        if (!ALLOWED_CHARS_REGEX.test(e.data || ''))
                          e.preventDefault()
                      }}
                      onKeyDown={(e) => handleInputKeyDown(e, i)}
                      onChange={() => {
                        const next = i + 1
                        if (next < 81) refs.current[next]?.focus()
                      }}
                      onFocus={(e) => {
                        e.target.select()
                      }}
                      className={`w-full aspect-square text-center bg-bg1 ${borderClasses} border-secondary-border text-fg1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-secondary`}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
        <div className="w-full max-w-56 flex justify-between gap-2 mt-4">
          <button
            ref={submitButtonRef}
            type="submit"
            className="px-4 py-1 bg-primary text-bg1 text-sm rounded hover:bg-primary-fg1 transition"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleInputClear}
            className="px-4 py-1 bg-secondary-fg1 text-bg1 text-sm rounded hover:bg-secondary-fg2 transition"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  )
}
