import { Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { BinderBuilderPage } from '../pages/BinderBuilderPage'
import { BindersPage } from '../pages/BindersPage'
import { CardDetailPage } from '../pages/CardDetailPage'
import { CollectionPage } from '../pages/CollectionPage'
import { CollectionsPage } from '../pages/CollectionsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { SearchPage } from '../pages/SearchPage'
import { SetDetailPage } from '../pages/SetDetailPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="sets/:setId" element={<SetDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="cards/:cardId" element={<CardDetailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="collections/:collectionId" element={<CollectionPage />} />
          <Route path="binders" element={<BindersPage />} />
          <Route path="binders/:binderId" element={<BinderBuilderPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
