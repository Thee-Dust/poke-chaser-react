import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { DataProvider } from './providers/DataProviderContext'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <DataProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </DataProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
