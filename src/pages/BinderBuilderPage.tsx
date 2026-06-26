import { useParams } from 'react-router-dom'
import { Breadcrumb } from '../components/layout/Breadcrumb'

export function BinderBuilderPage() {
  const { binderId } = useParams<{ binderId: string }>()

  return (
    <div className="page">
      <Breadcrumb
        items={[
          { label: 'Binders', to: '/binders' },
          { label: 'Binder' },
        ]}
      />
      <p className="page__message">Loading binder {binderId}…</p>
    </div>
  )
}
