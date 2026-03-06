import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { AttendeeStatus } from '@/types/database.types'

interface Attendee {
  id: string
  status: AttendeeStatus
  profiles: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface AttendeeListProps {
  attendees: Attendee[]
}

export function AttendeeList({ attendees }: AttendeeListProps) {
  const going = attendees.filter((a) => a.status === 'going')
  const interested = attendees.filter((a) => a.status === 'interested')

  return (
    <div className="space-y-4">
      {going.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            Van ({going.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {going.map((a) => (
              <div key={a.id} className="flex items-center gap-1.5">
                <Avatar
                  src={a.profiles?.avatar_url}
                  name={a.profiles?.full_name ?? a.profiles?.username}
                  size="sm"
                />
                <span className="text-sm text-gray-700">
                  {a.profiles?.full_name ?? a.profiles?.username ?? 'Usuario'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {interested.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            Interesados ({interested.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {interested.map((a) => (
              <div key={a.id} className="flex items-center gap-1.5">
                <Avatar
                  src={a.profiles?.avatar_url}
                  name={a.profiles?.full_name ?? a.profiles?.username}
                  size="sm"
                />
                <span className="text-sm text-gray-500">
                  {a.profiles?.full_name ?? a.profiles?.username ?? 'Usuario'}
                </span>
                <Badge variant="secondary">Interesado</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      {attendees.length === 0 && (
        <p className="text-sm text-gray-400">Aún no hay asistentes confirmados.</p>
      )}
    </div>
  )
}
