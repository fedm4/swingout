import { Music } from 'lucide-react'
import { useEvents } from '@/hooks/useEvents'
import { Layout } from '@/components/layout/Layout'
import { EventCard } from '@/components/events/EventCard'

export function HomePage() {
  const { data: events, isLoading, error } = useEvents()

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-500 py-16 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 flex justify-center">
            <Music className="h-12 w-12 opacity-80" />
          </div>
          <h1 className="mb-3 text-4xl font-bold">Grupos Swing</h1>
          <p className="mx-auto max-w-xl text-lg text-blue-100">
            Organiza viajes a eventos de Lindy Hop con tu comunidad. Coordina transporte,
            alojamiento y mantente en contacto.
          </p>
        </div>
      </div>

      {/* Events list */}
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Próximos eventos</h2>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-center text-red-500">Error al cargar eventos. Inténtalo de nuevo.</p>
        )}

        {events && events.length === 0 && (
          <p className="text-center text-gray-400">No hay eventos publicados todavía.</p>
        )}

        {events && events.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
