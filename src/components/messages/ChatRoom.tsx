import { useRef, useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { useMessages, useSendMessage } from '@/hooks/useMessages'
import { useAuth } from '@/hooks/useAuth'
import type { ChannelType } from '@/types/database.types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

interface ChatRoomProps {
  channelType: ChannelType
  channelId: string
}

export function ChatRoom({ channelType, channelId }: ChatRoomProps) {
  const { user } = useAuth()
  const { data: messages, isLoading } = useMessages(channelType, channelId)
  const sendMessage = useSendMessage()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !user) return
    const content = text.trim()
    setText('')
    await sendMessage.mutateAsync({
      content,
      user_id: user.id,
      channel_type: channelType,
      channel_id: channelId,
    })
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Inicia sesión para participar en el chat.
      </div>
    )
  }

  return (
    <div className="flex h-96 flex-col rounded-lg border border-gray-200 bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <p className="text-center text-sm text-gray-400">Cargando mensajes...</p>
        )}
        {messages?.map((msg) => {
          const isOwn = msg.user_id === user.id
          return (
            <div
              key={msg.id}
              className={`mb-3 flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar
                src={msg.profiles?.avatar_url}
                name={msg.profiles?.full_name ?? msg.profiles?.username}
                size="sm"
              />
              <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && (
                  <span className="text-xs text-gray-400">
                    {msg.profiles?.full_name ?? msg.profiles?.username ?? 'Usuario'}
                  </span>
                )}
                <div
                  className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => void handleSend(e)}
        className="flex items-center gap-2 border-t border-gray-200 p-3"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!text.trim() || sendMessage.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
