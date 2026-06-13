import { Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { CardDetailPage } from '../pages/CardDetailPage'
import { CollectionPage } from '../pages/CollectionPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { SearchPage } from '../pages/SearchPage'
import { SetDetailPage } from '../pages/SetDetailPage'
import { SignupPage } from '../pages/SignupPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="sets/:setId" element={<SetDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="cards/:cardId" element={<CardDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="collection" element={<CollectionPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
