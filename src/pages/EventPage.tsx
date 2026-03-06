import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Calendar, Globe, Ticket, CheckCircle, Star, Plus } from 'lucide-react'
import { isSafeUrl } from '@/lib/utils'
import {
  useEvent,
  useEventAttendees,
  useEventGroups,
  useUpsertAttendee,
  useRemoveAttendee,
} from '@/hooks/useEvents'
import { useCreateGroup } from '@/hooks/useGroups'
import { useAuth } from '@/hooks/useAuth'
import type { AttendeeStatus, GroupType, PriceEntry } from '@/types/database.types'
import { Layout } from '@/components/layout/Layout'
import { AttendeeList } from '@/components/events/AttendeeList'
import { GroupCard } from '@/components/groups/GroupCard'
import { ChatRoom } from '@/components/messages/ChatRoom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDateRange } from '@/lib/utils'

export function EventPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: event, isLoading } = useEvent(id ?? '')
  const { data: attendees } = useEventAttendees(id ?? '')
  const { data: groups } = useEventGroups(id ?? '')
  const upsertAttendee = useUpsertAttendee()
  const removeAttendee = useRemoveAttendee()
  const createGroup = useCreateGroup()

  const [activeTab, setActiveTab] = useState<'info' | 'groups' | 'chat'>('info')
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', description: '', type: 'general' as GroupType })

  const myAttendance = attendees?.find((a) => a.user_id === user?.id)

  async function handleAttend(status: AttendeeStatus) {
    if (!user || !id) return
    if (myAttendance?.status === status) {
      await removeAttendee.mutateAsync({ eventId: id, userId: user.id })
    } else {
      await upsertAttendee.mutateAsync({ event_id: id, user_id: user.id, status })
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !id) return
    await createGroup.mutateAsync({
      ...newGroup,
      event_id: id,
      created_by: user.id,
    })
    setShowGroupForm(false)
    setNewGroup({ name: '', description: '', type: 'general' })
    setActiveTab('groups')
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        </div>
      </Layout>
    )
  }

  if (!event) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-8 text-center text-gray-500">
          Evento no encontrado.{' '}
          <Link to="/" className="text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </Layout>
    )
  }

  const prices = Array.isArray(event.prices) ? (event.prices as unknown as PriceEntry[]) : []

  return (
    <Layout>
      {/* Cover */}
      {event.cover_url && (
        <div className="h-56 overflow-hidden sm:h-72">
          <img src={event.cover_url} alt={event.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
              {(event.city || event.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {[event.venue, event.city, event.country].filter(Boolean).join(', ')}
                </span>
              )}
              {event.start_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateRange(event.start_date, event.end_date)}
                </span>
              )}
              {event.website && isSafeUrl(event.website) && (
                <a
                  href={event.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  Sitio web
                </a>
              )}
            </div>
          </div>

          {/* Attendance buttons */}
          {user && (
            <div className="flex gap-2">
              <Button
                variant={myAttendance?.status === 'going' ? 'default' : 'outline'}
                size="sm"
                onClick={() => void handleAttend('going')}
                disabled={upsertAttendee.isPending || removeAttendee.isPending}
              >
                <CheckCircle className="h-4 w-4" />
                Voy
              </Button>
              <Button
                variant={myAttendance?.status === 'interested' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => void handleAttend('interested')}
                disabled={upsertAttendee.isPending || removeAttendee.isPending}
              >
                <Star className="h-4 w-4" />
                Me interesa
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-gray-200">
          {(['info', 'groups', 'chat'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'info' ? 'Info' : tab === 'groups' ? 'Grupos' : 'Chat'}
            </button>
          ))}
        </div>

        {/* Tab: Info */}
        {activeTab === 'info' && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {event.description && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold">Descripción</h2>
                  <p className="whitespace-pre-line text-gray-700">{event.description}</p>
                </div>
              )}
              {event.classes_info && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold">Clases</h2>
                  <p className="whitespace-pre-line text-gray-700">{event.classes_info}</p>
                </div>
              )}
              {attendees && (
                <div>
                  <h2 className="mb-3 text-lg font-semibold">Asistentes</h2>
                  <AttendeeList attendees={attendees} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {prices.length > 0 && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 flex items-center gap-1.5 font-semibold">
                    <Ticket className="h-4 w-4" />
                    Precios
                  </h3>
                  <ul className="space-y-2">
                    {prices.map((p, i) => (
                      <li key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{p.type}</span>
                        <Badge variant="default">{p.amount}{p.currency ?? '€'}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Groups */}
        {activeTab === 'groups' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Grupos de coordinación</h2>
              {user && (
                <Button size="sm" onClick={() => setShowGroupForm(!showGroupForm)}>
                  <Plus className="h-4 w-4" />
                  Crear grupo
                </Button>
              )}
            </div>

            {showGroupForm && (
              <form
                onSubmit={(e) => void handleCreateGroup(e)}
                className="mb-6 rounded-lg border border-gray-200 bg-white p-4 space-y-3"
              >
                <h3 className="font-medium">Nuevo grupo</h3>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup((g) => ({ ...g, name: e.target.value }))}
                  required
                  placeholder="Nombre del grupo"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup((g) => ({ ...g, description: e.target.value }))}
                  placeholder="Descripción (opcional)"
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
                <select
                  value={newGroup.type}
                  onChange={(e) => setNewGroup((g) => ({ ...g, type: e.target.value as GroupType }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="general">General</option>
                  <option value="transport">Transporte</option>
                  <option value="accommodation">Alojamiento</option>
                </select>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={createGroup.isPending}>
                    {createGroup.isPending ? 'Creando...' : 'Crear'}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowGroupForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}

            {groups && groups.length === 0 && (
              <p className="text-gray-400">No hay grupos para este evento todavía.</p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {groups?.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </div>
        )}

        {/* Tab: Chat */}
        {activeTab === 'chat' && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">Chat del evento</h2>
            <ChatRoom channelType="event" channelId={id ?? ''} />
          </div>
        )}
      </div>
    </Layout>
  )
}
