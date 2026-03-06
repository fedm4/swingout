import { Link, useNavigate } from 'react-router-dom'
import { Music, LogOut, User } from 'lucide-react'
import { useAuth, signOut } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-blue-700">
          <Music className="h-5 w-5" />
          <span>Grupos Swing</span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/profile">
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.full_name ?? profile?.username}
                  size="sm"
                  className="cursor-pointer hover:ring-2 hover:ring-blue-400"
                />
              </Link>
              <Button variant="ghost" size="icon" onClick={() => void handleSignOut()} title="Cerrar sesión">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" variant="outline">
                <User className="h-4 w-4" />
                Entrar
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
