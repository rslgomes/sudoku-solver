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
