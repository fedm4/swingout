# New Page

Scaffold a new React page with routing and TanStack Query.

## Steps

1. Ask the user:
   - Page name (PascalCase, e.g., `SettingsPage`)
   - Route path (e.g., `/settings`, `/events/:id/edit`)
   - Does it require authentication? (yes/no)
   - What data does it need from Supabase? (brief description)

2. Create `src/pages/<PageName>.tsx`:

```tsx
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Layout } from '@/components/layout/Layout'

export function <PageName>() {
  // const { id } = useParams()  // if route has params

  const { data, isLoading, error } = useQuery({
    queryKey: ['<resource>', /* id */],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('<table>')
        .select('*')
        // .eq('id', id)
      if (error) throw error
      return data
    },
  })

  if (isLoading) return <Layout><div className="p-8 text-center">Cargando...</div></Layout>
  if (error) return <Layout><div className="p-8 text-center text-red-500">Error al cargar</div></Layout>

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6"><PageTitle></h1>
        {/* Content here */}
      </div>
    </Layout>
  )
}
```

3. Add the route in `src/App.tsx`:
```tsx
<Route path="<path>" element={<PageName />} />
```
And add the import at the top.

4. If auth-protected, wrap with the `<ProtectedRoute>` component (or redirect to `/auth` if not authenticated).

5. If it needs a custom hook, create `src/hooks/use<Resource>.ts` following the pattern in existing hooks.
