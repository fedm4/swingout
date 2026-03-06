# New Component

Scaffold a typed React component.

## Steps

1. Ask the user:
   - Component name (PascalCase, e.g., `EventCard`)
   - Which subfolder? (`ui/`, `layout/`, `events/`, `groups/`, `messages/`, `transport/`)
   - What props does it need? (brief description)

2. Create `src/components/<subfolder>/<ComponentName>.tsx`:

```tsx
interface <ComponentName>Props {
  // Define props here with types from @/types/database.types.ts when applicable
}

export function <ComponentName>({ /* props */ }: <ComponentName>Props) {
  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

## Guidelines

- Use types from `@/types/database.types.ts` for Supabase data shapes:
  ```ts
  import type { Tables } from '@/types/database.types'
  type Event = Tables<'events'>
  ```
- Prefer composition with small sub-components over large monolithic ones
- Use Tailwind classes for styling
- Use `lucide-react` for icons
- Export as named export (not default)
- Keep components focused on presentation; put data fetching in hooks or pages
