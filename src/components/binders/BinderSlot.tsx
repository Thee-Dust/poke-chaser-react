import type { Card } from '../../api/types'

type BinderSlotProps = {
  position: number
  card: Card | null
}

export function BinderSlot({ card }: BinderSlotProps) {
  if (card) {
    return (
      <div className="binder-slot binder-slot--filled">
        <img
          className="binder-slot__img"
          src={card.images?.small}
          alt={card.name}
          loading="lazy"
        />
      </div>
    )
  }

  return <div className="binder-slot binder-slot--empty" />
}
