/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useState,
    type Dispatch,
    type SetStateAction,
} from 'react'
import type { CellData } from '../libs/types'

interface GridContext {
    gridData: CellData[]
    setGridData: Dispatch<SetStateAction<CellData[]>>
}

const GridContext = createContext<GridContext | undefined>(undefined)

export const GridProvider = ({ children }: { children: React.ReactNode }) => {
    const [gridData, setGridData] = useState<CellData[]>([])
    return (
        <GridContext.Provider value={{ gridData, setGridData }}>
            {children}
        </GridContext.Provider>
    )
}

export const useGrid = () => {
    const gridValue = useContext(GridContext)
    if (!gridValue) {
        throw new Error('useGrid must be used within a GridProvider')
    }
    return gridValue
}
