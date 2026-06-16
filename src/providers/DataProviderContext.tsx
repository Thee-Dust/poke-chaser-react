/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react'
import { dataProvider, type DataProvider } from './dataProvider'

const DataContext = createContext<DataProvider | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  return <DataContext.Provider value={dataProvider}>{children}</DataContext.Provider>
}

export function useData(): DataProvider {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
