import { Link } from 'react-router-dom'
import { MapPin, Calendar } from 'lucide-react'
import type { Event } from '@/types/database.types'
import { formatDateRange } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link to={`/events/${event.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        {event.cover_url && (
          <div className="aspect-video overflow-hidden">
            <img
              src={event.cover_url}
              alt={event.title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        )}
        <CardContent className="p-4">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">{event.title}</h2>
          <div className="flex flex-col gap-1 text-sm text-gray-500">
            {(event.city || event.country) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {[event.city, event.country].filter(Boolean).join(', ')}
              </span>
            )}
            {event.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {formatDateRange(event.start_date, event.end_date)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
