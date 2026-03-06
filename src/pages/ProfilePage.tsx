import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEvents } from '@/hooks/useEvents'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { EventCard } from '@/components/events/EventCard'

export function ProfilePage() {
  const { user, profile, loading } = useAuth()
  const queryClient = useQueryClient()
  const { data: allEvents } = useEvents()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    username: profile?.username ?? '',
    bio: profile?.bio ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        </div>
      </Layout>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Start editing with fresh profile values
  function startEditing() {
    setForm({
      full_name: profile?.full_name ?? '',
      username: profile?.username ?? '',
      bio: profile?.bio ?? '',
    })
    setEditing(true)
    setError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('profiles')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    if (error) {
      setError(error.message)
    } else {
      setEditing(false)
      // Invalidate so useAuth re-fetches profile
      void queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
    }
    setSaving(false)
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Profile header */}
        <div className="mb-8 flex items-start gap-4">
          <Avatar
            src={profile?.avatar_url}
            name={profile?.full_name ?? profile?.username}
            size="lg"
          />
          <div className="flex-1">
            {!editing ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.full_name ?? 'Sin nombre'}
                </h1>
                {profile?.username && (
                  <p className="text-sm text-gray-500">@{profile.username}</p>
                )}
                {profile?.bio && (
                  <p className="mt-2 text-gray-700">{profile.bio}</p>
                )}
                <p className="mt-1 text-sm text-gray-400">{user.email}</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={startEditing}>
                  Editar perfil
                </Button>
              </>
            ) : (
              <form onSubmit={(e) => void handleSave(e)} className="space-y-3">
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Nombre completo"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="@usuario"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Bio"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* My events */}
        {allEvents && allEvents.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Eventos</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {allEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {(!allEvents || allEvents.length === 0) && (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">No hay eventos disponibles.</p>
            <Link to="/" className="mt-2 text-sm text-blue-600 hover:underline">
              Ver próximos eventos
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}
