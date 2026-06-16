import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Card } from '../api/types'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { useAuth } from '../context/AuthContext'
import { useData } from '../providers/DataProviderContext'

function formatVariant(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase())
}

const ENERGY_ABBR: Record<string, string> = {
  Grass: 'G', Fire: 'R', Water: 'W', Lightning: 'L', Psychic: 'P',
  Fighting: 'F', Darkness: 'D', Metal: 'M', Colorless: 'C', Dragon: 'N', Fairy: 'Y',
}

export function CardDetailPage() {
  const data = useData()
  const { cardId = '' } = useParams()
  const { user, isInCollection, addToCollection, removeFromCollection, openAuthModal } = useAuth()
  const [card, setCard] = useState<Card | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const inCollection = card ? isInCollection(card.id) : false

  useEffect(() => {
    let cancelled = false

    async function loadCard() {
      setLoading(true)
      setError(null)

      try {
        const result = await data.getCard(cardId)
        if (!cancelled) {
          setCard(result)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load card details.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (cardId) {
      loadCard()
    }

    return () => {
      cancelled = true
    }
  }, [data, cardId])

  if (loading) {
    return (
      <div className="page">
        <p className="page__message">Loading card...</p>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="page">
        <Breadcrumb items={[{ label: 'Browse Sets', to: '/' }, { label: 'Card' }]} />
        <p className="page__error">{error ?? 'Card not found.'}</p>
        <Link to="/" className="btn">
          Back to sets
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <Breadcrumb
        items={[
          { label: 'Browse Sets', to: '/' },
          ...(card.set_id && card.set_name
            ? [{ label: card.set_name, to: `/sets/${card.set_id}` }]
            : []),
          { label: card.name },
        ]}
      />

      <div className="card-detail">
        <div className="card-detail__image-col">
          {card.images?.large ?? card.images?.small ? (
            <img
              src={card.images?.large ?? card.images?.small}
              alt={card.name}
              className="card-detail__image"
            />
          ) : (
            <div className="card-detail__image" />
          )}

          <div className="card-detail__cta">
            {user ? (
              inCollection ? (
                <button
                  type="button"
                  className="btn"
                  onClick={() => removeFromCollection(card.id)}
                >
                  Remove from collection
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => addToCollection(card.id)}
                >
                  Add to collection
                </button>
              )
            ) : (
              <p className="page__message">
                <button
                  type="button"
                  className="btn btn--link"
                  onClick={() => openAuthModal('login')}
                >
                  Sign in
                </button>{' '}
                to track this card in your collection.
              </p>
            )}
          </div>
        </div>

        <div className="card-detail__meta">
          <h1>
            {card.name}
            {card.number && <span className="card-detail__title-number"> ({card.number})</span>}
            {card.set_name && (
              <span className="card-detail__title-set">
                {' — '}
                {card.set_id ? (
                  <Link to={`/sets/${card.set_id}`}>{card.set_name}</Link>
                ) : (
                  card.set_name
                )}
              </span>
            )}
          </h1>

          <section className="card-detail__details">
            <h2 className="card-detail__details-heading">Card Details</h2>

            <dl className="card-detail__details-grid">
              {(card.number || card.rarity) && (
                <>
                  <dt>Card Number / Rarity</dt>
                  <dd>{[card.number, card.rarity].filter(Boolean).join(' / ')}</dd>
                </>
              )}

              {(card.types?.length || card.hp || card.subtypes?.length) && (
                <>
                  <dt>Card Type / HP / Stage</dt>
                  <dd>
                    {[
                      card.types?.join(', '),
                      card.hp,
                      card.subtypes?.join(', '),
                    ]
                      .filter(Boolean)
                      .join(' / ')}
                  </dd>
                </>
              )}

              {card.abilities?.map((ability) => (
                <>
                  <dt key={`ability-dt-${ability.name}`}>Card Text</dt>
                  <dd key={`ability-dd-${ability.name}`}>
                    <strong>{ability.type}: {ability.name}</strong>
                    {ability.text && <p className="card-detail__detail-text">{ability.text}</p>}
                  </dd>
                </>
              ))}

              {card.attacks?.map((attack, i) => (
                <>
                  <dt key={`attack-dt-${i}`}>Attack {card.attacks!.length > 1 ? i + 1 : ''}</dt>
                  <dd key={`attack-dd-${i}`}>
                    <strong>
                      {attack.cost && attack.cost.length > 0 && (
                        <span>[{attack.cost.map((t) => ENERGY_ABBR[t] ?? t[0] ?? '').join('')}] </span>
                      )}
                      {attack.name}
                      {attack.damage && ` (${attack.damage})`}
                    </strong>
                    {attack.text && <p className="card-detail__detail-text">{attack.text}</p>}
                  </dd>
                </>
              ))}

              {(card.weaknesses?.length !== undefined || card.resistances?.length !== undefined || card.converted_retreat_cost !== undefined) && (
                <>
                  <dt>Weakness / Resistance / Retreat Cost</dt>
                  <dd>
                    {[
                      card.weaknesses?.map((w) => `${ENERGY_ABBR[w.type] ?? w.type[0]}${w.value}`).join(', ') ?? '',
                      card.resistances?.map((r) => `${ENERGY_ABBR[r.type] ?? r.type[0]}${r.value}`).join(', ') ?? '',
                      card.converted_retreat_cost !== undefined ? String(card.converted_retreat_cost) : '',
                    ].join(' / ')}
                  </dd>
                </>
              )}

              {card.artist && (
                <>
                  <dt>Artist</dt>
                  <dd>{card.artist}</dd>
                </>
              )}
            </dl>
          </section>

          {card.flavor_text && (
            <p className="card-detail__flavor">{card.flavor_text}</p>
          )}

          {card.tcgplayer?.prices && (() => {
            const variants = Object.entries(card.tcgplayer.prices).filter(
              ([, v]) => typeof v?.market === 'number'
            )
            if (variants.length === 0) return null
            return (
              <div className="card-detail__prices">
                <h2 className="card-detail__prices-heading">Market Prices</h2>
                <ul className="card-detail__prices-list">
                  {variants.map(([key, v]) => (
                    <li key={key} className="card-detail__prices-row">
                      <span className="card-detail__prices-label">{formatVariant(key)}</span>
                      <span className="card-detail__prices-value">${(v!.market as number).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                {card.tcgplayer?.updatedAt && (
                  <p className="card-detail__prices-updated">Updated {card.tcgplayer.updatedAt}</p>
                )}
              </div>
            )
          })()}

          {(card.tcgplayer?.url || card.name) && (
            <div className="card-detail__actions">
              {card.tcgplayer?.url && (
                <a
                  href={card.tcgplayer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--tcgplayer"
                >
                  <img src="https://www.tcgplayer.com/favicon.ico" alt="" className="card-detail__btn-logo" />
                  Buy on TCGplayer
                </a>
              )}
              <a
                href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.name + ' ' + card.set_name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ebay"
              >
                <img src="https://www.ebay.com/favicon.ico" alt="" className="card-detail__btn-logo" />
                Search on eBay
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
