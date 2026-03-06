import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCreateEvent, useEvents } from '@/hooks/useEvents'
import { formatDateRange, isSafeUrl } from '@/lib/utils'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { EventCard } from '@/components/events/EventCard'

export function NewEventPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const createEvent = useCreateEvent()
  const { data: existingEvents } = useEvents()

  const [form, setForm] = useState({
    title: '',
    description: '',
    venue: '',
    city: '',
    country: '',
    start_date: '',
    end_date: '',
    website: '',
    cover_url: '',
    classes_info: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const suggestions = existingEvents?.filter((e) =>
    form.title.trim().length > 1 &&
    e.title.toLowerCase().includes(form.title.toLowerCase().trim())
  ) ?? []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    if (form.website && !isSafeUrl(form.website)) {
      setError('El sitio web debe ser una URL válida (http/https)')
      return
    }
    if (form.cover_url && !isSafeUrl(form.cover_url)) {
      setError('La URL de la imagen debe ser válida (http/https)')
      return
    }
    try {
      const event = await createEvent.mutateAsync({
        ...form,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        website: form.website || null,
        cover_url: form.cover_url || null,
        description: form.description || null,
        venue: form.venue || null,
        city: form.city || null,
        country: form.country || null,
        classes_info: form.classes_info || null,
        created_by: user.id,
        is_published: true,
      })
      navigate(`/events/${event.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el evento')
    }
  }

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Agregar evento</h1>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          {/* Title with autocomplete */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nombre del evento <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={titleRef}
                type="text"
                value={form.title}
                onChange={(e) => {
                  setForm((f) => ({ ...f, title: e.target.value }))
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                required
                placeholder="ej. Stockholm Swing Smackdown 2026"
                className={inputClass}
                autoComplete="off"
              />

              {/* Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                  <li className="px-3 py-1.5 text-xs font-medium text-gray-400">
                    Eventos existentes — clickeá si ya existe
                  </li>
                  {suggestions.slice(0, 6).map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onMouseDown={() => navigate(`/events/${e.id}`)}
                        className="flex w-full flex-col px-3 py-2 text-left hover:bg-blue-50"
                      >
                        <span className="text-sm font-medium text-gray-900">{e.title}</span>
                        <span className="flex items-center gap-2 text-xs text-gray-400">
                          {(e.city || e.country) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {[e.city, e.country].filter(Boolean).join(', ')}
                            </span>
                          )}
                          {e.start_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateRange(e.start_date, e.end_date)}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                  <li className="border-t border-gray-100 px-3 py-2 text-xs text-gray-400">
                    Si no está en la lista, completá el formulario para crearlo
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha inicio</label>
              <input type="date" value={form.start_date} onChange={set('start_date')} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha fin</label>
              <input type="date" value={form.end_date} onChange={set('end_date')} className={inputClass} />
            </div>
          </div>

          {/* Location */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Venue</label>
              <input type="text" value={form.venue} onChange={set('venue')} placeholder="Sala o lugar" className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ciudad</label>
              <input type="text" value={form.city} onChange={set('city')} placeholder="Stockholm" className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">País</label>
              <input type="text" value={form.country} onChange={set('country')} placeholder="Sweden" className={inputClass} />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sitio web</label>
            <input
              type="url"
              value={form.website}
              onChange={set('website')}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">URL de imagen de portada</label>
            <input
              type="url"
              value={form.cover_url}
              onChange={set('cover_url')}
              placeholder="https://..."
              className={inputClass}
            />
            {form.cover_url && (
              <img
                src={form.cover_url}
                alt="preview"
                className="mt-2 h-32 w-full rounded-md object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={4}
              placeholder="Descripción del evento..."
              className={inputClass}
            />
          </div>

          {/* Classes */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Info de clases</label>
            <textarea
              value={form.classes_info}
              onChange={set('classes_info')}
              rows={3}
              placeholder="Profesores, niveles, horarios..."
              className={inputClass}
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? 'Guardando...' : 'Publicar evento'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
          </div>
        </form>

        {/* Preview */}
        {form.title && (
          <div className="mt-10 border-t border-gray-200 pt-6">
            <p className="mb-3 text-sm font-medium text-gray-500">Vista previa</p>
            <div className="max-w-xs">
              <EventCard
                event={{
                  id: 'preview',
                  title: form.title,
                  description: form.description || null,
                  venue: form.venue || null,
                  city: form.city || null,
                  country: form.country || null,
                  start_date: form.start_date || null,
                  end_date: form.end_date || null,
                  website: form.website || null,
                  cover_url: form.cover_url || null,
                  prices: [],
                  classes_info: form.classes_info || null,
                  is_published: true,
                  created_by: user?.id ?? null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
