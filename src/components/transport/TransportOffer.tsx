import { Car, Clock, MapPin } from 'lucide-react'
import type { TransportOffer as TransportOfferType, Profile } from '@/types/database.types'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'

interface TransportOfferProps {
  offer: TransportOfferType & {
    profiles: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'> | null
  }
}

export function TransportOffer({ offer }: TransportOfferProps) {
  const departureTime = offer.departure_time
    ? new Date(offer.departure_time).toLocaleString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar
            src={offer.profiles?.avatar_url}
            name={offer.profiles?.full_name ?? offer.profiles?.username}
            size="md"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {offer.profiles?.full_name ?? offer.profiles?.username ?? 'Usuario'}
            </p>
            <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Desde {offer.origin}
              </span>
              {departureTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {departureTime}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Car className="h-3.5 w-3.5" />
                <Badge variant={offer.seats_available > 0 ? 'success' : 'secondary'}>
                  {offer.seats_available} {offer.seats_available === 1 ? 'plaza' : 'plazas'}
                </Badge>
              </span>
            </div>
            {offer.notes && (
              <p className="mt-2 text-sm text-gray-500">{offer.notes}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
