import { Home, BedDouble, MapPin } from 'lucide-react'
import type { AccommodationOffer as AccommodationOfferType, Profile } from '@/types/database.types'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'

interface AccommodationOfferProps {
  offer: AccommodationOfferType & {
    profiles: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'> | null
  }
}

export function AccommodationOffer({ offer }: AccommodationOfferProps) {
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
                {offer.address}
              </span>
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                <Badge variant={offer.beds_available > 0 ? 'success' : 'secondary'}>
                  {offer.beds_available} {offer.beds_available === 1 ? 'cama' : 'camas'}
                </Badge>
              </span>
              {offer.price_per_night !== null && (
                <span className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" />
                  {offer.price_per_night === 0
                    ? 'Gratis'
                    : `${offer.price_per_night}€/noche`}
                </span>
              )}
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
