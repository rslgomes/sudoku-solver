export type CellData = {
  penMark?: number
  pencilMarks: number[]
  customBgColor?: string
  locked?: boolean
}

export type UIInputMode = 'pen' | 'pencil' | 'color' | 'clear' | 'lock'

export type ColorKey =
  | 'bg-red-02'
  | 'bg-orange-02'
  | 'bg-yellow-02'
  | 'bg-green-02'
  | 'bg-blue-02'
