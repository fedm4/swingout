# Grupos Swing — CLAUDE.md

## Proyecto

App para organizar viajes a eventos de **Lindy Hop** (swing dance). Permite coordinar transporte, alojamiento, ver info del evento y chatear en grupos.

## Stack

| Capa | Tech |
|------|------|
| Frontend | React 18 + Vite + TypeScript |
| Estilos | Tailwind CSS v4 + componentes shadcn/ui (manuales) |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Deploy | Vercel (FE) + Supabase Cloud (BE) |

## Convenciones

- **Componentes**: PascalCase (`EventCard.tsx`, `ChatRoom.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useEvents.ts`, `useAuth.ts`)
- **Páginas**: PascalCase con sufijo `Page` (`EventPage.tsx`)
- **Rutas**: kebab-case en URL, camelCase en código
- Imports con alias `@/` para `src/` (configurado en tsconfig y vite)
- Siempre usar tipos de `@/types/database.types.ts` para datos de Supabase

## Estructura

```
src/
├── components/
│   ├── ui/           ← Componentes base (Button, Card, etc.)
│   ├── layout/       ← Header, Layout
│   ├── events/       ← EventCard, EventDetail, AttendeeList
│   ├── groups/       ← GroupCard, MemberList
│   ├── messages/     ← ChatRoom, MessageBubble
│   └── transport/    ← TransportOffer, AccommodationOffer
├── pages/            ← Una por ruta
├── hooks/            ← Lógica de negocio + Supabase queries
├── lib/
│   ├── supabase.ts   ← Cliente Supabase singleton
│   └── utils.ts      ← cn() helper y utilidades
└── types/
    └── database.types.ts  ← Generado desde Supabase
```

## Variables de entorno

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Archivo local: `.env.local` (en `.gitignore`). Ver `.env.example` para estructura.

## Row Level Security (RLS)

Cada tabla tiene RLS habilitado. Políticas principales:

| Tabla | Leer | Crear | Modificar | Borrar |
|-------|------|-------|-----------|--------|
| `profiles` | todos | propio | propio | — |
| `events` | published | authenticated | creator | creator |
| `event_attendees` | event members | authenticated | propio | propio |
| `groups` | members | authenticated | admin | admin |
| `group_members` | group members | authenticated | — | propio/admin |
| `messages` | channel members | authenticated | propio | — |
| `transport_offers` | group members | group member | propio | propio |
| `accommodation_offers` | group members | group member | propio | propio |

## Regenerar tipos TypeScript desde Supabase

```bash
npx supabase gen types typescript --project-id <project-id> \
  --schema public > src/types/database.types.ts
```

## Workflow de desarrollo local

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Desarrollo
npm run dev           # http://localhost:5173

# Build de producción
npm run build
npm run preview
```

## Skills disponibles

| Skill | Descripción |
|-------|-------------|
| `/new-migration` | Crea un nuevo archivo SQL en `supabase/migrations/` |
| `/new-page` | Scaffoldea una página React con routing |
| `/new-component` | Scaffoldea un componente TypeScript tipado |
| `/deploy-check` | Verifica entorno antes de deployar |

## Páginas y rutas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | `HomePage` | Lista eventos próximos |
| `/events/:id` | `EventPage` | Detalle del evento |
| `/groups/:id` | `GroupPage` | Grupo de coordinación |
| `/profile` | `ProfilePage` | Perfil del usuario |
| `/auth` | `AuthPage` | Login / Registro |

## Dominio: Lindy Hop

- **Lindy Hop**: baile de swing originado en Harlem en los años 20-30
- Los **eventos** suelen durar un fin de semana (viernes a domingo)
- Incluyen competencias, clases, milongas nocturnas
- Los **grupos** coordinan quién va en qué auto, dónde se quedan
- Vocabulario: pase, social, workshop, exchange, competencia
