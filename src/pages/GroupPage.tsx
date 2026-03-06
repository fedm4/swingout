import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Car, Home, Users, Plus, LogIn, LogOut } from 'lucide-react'
import {
  useGroup,
  useGroupMembers,
  useTransportOffers,
  useAccommodationOffers,
  useJoinGroup,
  useLeaveGroup,
  useCreateTransportOffer,
  useCreateAccommodationOffer,
} from '@/hooks/useGroups'
import { useAuth } from '@/hooks/useAuth'
import { Layout } from '@/components/layout/Layout'
import { ChatRoom } from '@/components/messages/ChatRoom'
import { TransportOffer } from '@/components/transport/TransportOffer'
import { AccommodationOffer } from '@/components/transport/AccommodationOffer'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function GroupPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: group, isLoading } = useGroup(id ?? '')
  const { data: members } = useGroupMembers(id ?? '')
  const { data: transportOffers } = useTransportOffers(id ?? '')
  const { data: accommodationOffers } = useAccommodationOffers(id ?? '')
  const joinGroup = useJoinGroup()
  const leaveGroup = useLeaveGroup()
  const createTransport = useCreateTransportOffer()
  const createAccommodation = useCreateAccommodationOffer()

  const [activeTab, setActiveTab] = useState<'offers' | 'chat'>('offers')
  const [showForm, setShowForm] = useState(false)
  const [transport, setTransport] = useState({ origin: '', seats_available: 1, departure_time: '', notes: '' })
  const [accommodation, setAccommodation] = useState({ address: '', beds_available: 1, price_per_night: '', notes: '' })

  const isMember = members?.some((m) => m.user_id === user?.id) ?? false

  async function handleJoinLeave() {
    if (!user || !id) return
    if (isMember) {
      await leaveGroup.mutateAsync({ groupId: id, userId: user.id })
    } else {
      await joinGroup.mutateAsync({ groupId: id, userId: user.id })
    }
  }

  async function handleSubmitTransport(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !id) return
    await createTransport.mutateAsync({
      group_id: id,
      user_id: user.id,
      origin: transport.origin,
      seats_available: transport.seats_available,
      departure_time: transport.departure_time || null,
      notes: transport.notes || null,
    })
    setShowForm(false)
    setTransport({ origin: '', seats_available: 1, departure_time: '', notes: '' })
  }

  async function handleSubmitAccommodation(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !id) return
    await createAccommodation.mutateAsync({
      group_id: id,
      user_id: user.id,
      address: accommodation.address,
      beds_available: accommodation.beds_available,
      price_per_night: accommodation.price_per_night ? parseFloat(accommodation.price_per_night) : null,
      notes: accommodation.notes || null,
    })
    setShowForm(false)
    setAccommodation({ address: '', beds_available: 1, price_per_night: '', notes: '' })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        </div>
      </Layout>
    )
  }

  if (!group) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-8 text-center text-gray-500">
          Grupo no encontrado.{' '}
          <Link to="/" className="text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </Layout>
    )
  }

  const typeIcons = { transport: Car, accommodation: Home, general: Users }
  const Icon = typeIcons[group.type]
  const typeLabels = { transport: 'Transporte', accommodation: 'Alojamiento', general: 'General' }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-gray-500" />
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              <Badge variant="secondary">{typeLabels[group.type]}</Badge>
            </div>
            {group.description && (
              <p className="mt-1 text-gray-600">{group.description}</p>
            )}
            {group.event_id && (
              <Link
                to={`/events/${group.event_id}`}
                className="mt-1 text-sm text-blue-600 hover:underline"
              >
                Ver evento
              </Link>
            )}
          </div>
          {user && (
            <Button
              variant={isMember ? 'outline' : 'default'}
              size="sm"
              onClick={() => void handleJoinLeave()}
              disabled={joinGroup.isPending || leaveGroup.isPending}
            >
              {isMember ? (
                <>
                  <LogOut className="h-4 w-4" />
                  Salir del grupo
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Unirse
                </>
              )}
            </Button>
          )}
        </div>

        {/* Members */}
        {members && members.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-medium text-gray-700">
              Miembros ({members.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-1.5">
                  <Avatar
                    src={m.profiles?.avatar_url}
                    name={m.profiles?.full_name ?? m.profiles?.username}
                    size="sm"
                  />
                  <span className="text-sm text-gray-700">
                    {m.profiles?.full_name ?? m.profiles?.username ?? 'Usuario'}
                  </span>
                  {m.role === 'admin' && (
                    <Badge variant="default" className="text-xs">Admin</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs (only for transport/accommodation) */}
        {group.type !== 'general' && (
          <div className="mb-6 flex gap-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'offers'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {group.type === 'transport' ? 'Viajes' : 'Alojamientos'}
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'chat'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chat
            </button>
          </div>
        )}

        {/* Offers tab */}
        {(group.type === 'general' || activeTab === 'offers') && (
          <>
            {group.type === 'transport' && (
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Viajes disponibles</h2>
                  {isMember && (
                    <Button size="sm" onClick={() => setShowForm(!showForm)}>
                      <Plus className="h-4 w-4" />
                      Ofrecer viaje
                    </Button>
                  )}
                </div>
                {showForm && (
                  <form
                    onSubmit={(e) => void handleSubmitTransport(e)}
                    className="mb-4 rounded-lg border border-gray-200 bg-white p-4 space-y-3"
                  >
                    <input
                      type="text"
                      value={transport.origin}
                      onChange={(e) => setTransport((t) => ({ ...t, origin: e.target.value }))}
                      required
                      placeholder="Ciudad de origen"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={transport.seats_available}
                        onChange={(e) => setTransport((t) => ({ ...t, seats_available: parseInt(e.target.value) }))}
                        min={1}
                        placeholder="Plazas disponibles"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                      />
                      <input
                        type="datetime-local"
                        value={transport.departure_time}
                        onChange={(e) => setTransport((t) => ({ ...t, departure_time: e.target.value }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                      />
                    </div>
                    <textarea
                      value={transport.notes}
                      onChange={(e) => setTransport((t) => ({ ...t, notes: e.target.value }))}
                      placeholder="Notas adicionales"
                      rows={2}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={createTransport.isPending}>Publicar</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
                    </div>
                  </form>
                )}
                <div className="space-y-3">
                  {transportOffers?.map((offer) => (
                    <TransportOffer key={offer.id} offer={offer} />
                  ))}
                  {(!transportOffers || transportOffers.length === 0) && (
                    <p className="text-gray-400">No hay viajes publicados todavía.</p>
                  )}
                </div>
              </div>
            )}

            {group.type === 'accommodation' && (
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Alojamientos disponibles</h2>
                  {isMember && (
                    <Button size="sm" onClick={() => setShowForm(!showForm)}>
                      <Plus className="h-4 w-4" />
                      Ofrecer alojamiento
                    </Button>
                  )}
                </div>
                {showForm && (
                  <form
                    onSubmit={(e) => void handleSubmitAccommodation(e)}
                    className="mb-4 rounded-lg border border-gray-200 bg-white p-4 space-y-3"
                  >
                    <input
                      type="text"
                      value={accommodation.address}
                      onChange={(e) => setAccommodation((a) => ({ ...a, address: e.target.value }))}
                      required
                      placeholder="Dirección"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={accommodation.beds_available}
                        onChange={(e) => setAccommodation((a) => ({ ...a, beds_available: parseInt(e.target.value) }))}
                        min={1}
                        placeholder="Camas disponibles"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                      />
                      <input
                        type="number"
                        value={accommodation.price_per_night}
                        onChange={(e) => setAccommodation((a) => ({ ...a, price_per_night: e.target.value }))}
                        min={0}
                        step={0.01}
                        placeholder="€/noche (0 = gratis)"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                      />
                    </div>
                    <textarea
                      value={accommodation.notes}
                      onChange={(e) => setAccommodation((a) => ({ ...a, notes: e.target.value }))}
                      placeholder="Notas adicionales"
                      rows={2}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={createAccommodation.isPending}>Publicar</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
                    </div>
                  </form>
                )}
                <div className="space-y-3">
                  {accommodationOffers?.map((offer) => (
                    <AccommodationOffer key={offer.id} offer={offer} />
                  ))}
                  {(!accommodationOffers || accommodationOffers.length === 0) && (
                    <p className="text-gray-400">No hay alojamientos publicados todavía.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Chat tab */}
        {(group.type === 'general' || activeTab === 'chat') && (
          <div>
            {group.type !== 'general' && <h2 className="mb-4 text-lg font-semibold">Chat del grupo</h2>}
            {group.type === 'general' && <h2 className="mb-4 text-lg font-semibold">Chat</h2>}
            <ChatRoom channelType="group" channelId={id ?? ''} />
          </div>
        )}
      </div>
    </Layout>
  )
}
