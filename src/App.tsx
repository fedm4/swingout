import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { EventPage } from '@/pages/EventPage'
import { NewEventPage } from '@/pages/NewEventPage'
import { GroupPage } from '@/pages/GroupPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { AuthPage } from '@/pages/AuthPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/events/new" element={<ProtectedRoute><NewEventPage /></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><EventPage /></ProtectedRoute>} />
          <Route path="/groups/:id" element={<ProtectedRoute><GroupPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
