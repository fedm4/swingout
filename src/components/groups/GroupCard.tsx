import { Link } from 'react-router-dom'
import { Car, Home, Users } from 'lucide-react'
import type { Group } from '@/types/database.types'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface GroupCardProps {
  group: Group
}

const typeConfig = {
  transport: { icon: Car, label: 'Transporte', variant: 'default' as const },
  accommodation: { icon: Home, label: 'Alojamiento', variant: 'success' as const },
  general: { icon: Users, label: 'General', variant: 'secondary' as const },
}

export function GroupCard({ group }: GroupCardProps) {
  const config = typeConfig[group.type]
  const Icon = config.icon

  return (
    <Link to={`/groups/${group.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium text-gray-900">{group.name}</h3>
            </div>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          {group.description && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{group.description}</p>
          )}
          {group.max_members && (
            <p className="mt-2 text-xs text-gray-400">Máx. {group.max_members} personas</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
