export const getNeighbors = (index: number) => {
  const onFirstRow = index < 9
  const onLastRow = index >= 72
  const onFirstCol = index % 9 === 0
  const onLastCol = index % 9 === 8

  return {
    up: onFirstRow ? index + 72 : index - 9,
    down: onLastRow ? index - 72 : index + 9,
    left: onFirstCol ? index + 8 : index - 1,
    right: onLastCol ? index - 8 : index + 1,
  }
}

const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

export const getCellLabel = (colIndex: number, rowIndex: number) => {
  return `Cell ${colLetters[colIndex]}${rowIndex + 1}`
}

export const getBorders = (rowIndex: number, colIndex: number) => {
  return [
    rowIndex % 3 === 0 && 'border-t',
    colIndex % 3 === 0 && 'border-l',
    colIndex % 3 === 2 && 'border-r',
    rowIndex % 3 === 2 && 'border-b',
  ]
    .filter(Boolean)
    .join(' ')
}
