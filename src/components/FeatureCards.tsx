'use client'

import { Truck, Headphones, Shield, CreditCard } from 'lucide-react'

interface FeatureCard {
  id: string
  title: string
  description?: string | null
  icon: string
}

interface FeatureCardsProps {
  cards: FeatureCard[]
}

const iconMap: { [key: string]: any } = {
  truck: Truck,
  headphones: Headphones,
  shield: Shield,
  'credit-card': CreditCard,
}

export default function FeatureCards({ cards }: FeatureCardsProps) {
  if (cards.length === 0) {
    return null
  }

  return (
    <section className="bg-slate-100 py-10">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(card => {
            const IconComponent = iconMap[card.icon] || Shield

            return (
              <div
                key={card.id}
                className="flex flex-col items-center text-center p-6 bg-white border border-gray-200 transition-all"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {card.title}
                </h3>
                {card.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
