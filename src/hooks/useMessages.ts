import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ChannelType, MessageWithProfile, InsertTables } from '@/types/database.types'

export function useMessages(channelType: ChannelType, channelId: string) {
  const queryClient = useQueryClient()
  const [isSubscribed, setIsSubscribed] = useState(false)

  const query = useQuery({
    queryKey: ['messages', channelType, channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(id, username, full_name, avatar_url)')
        .eq('channel_type', channelType)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100)
      if (error) throw error
      return data as MessageWithProfile[]
    },
    enabled: !!channelId,
  })

  // Supabase Realtime subscription
  useEffect(() => {
    if (!channelId) return

    const channel = supabase
      .channel(`messages:${channelType}:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          if (payload.new.channel_id !== channelId) return
          // Fetch the new message with profile join
          const { data } = await supabase
            .from('messages')
            .select('*, profiles(id, username, full_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          if (data) {
            queryClient.setQueryData(
              ['messages', channelType, channelId],
              (old: MessageWithProfile[] | undefined) => [...(old ?? []), data as MessageWithProfile]
            )
          }
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED')
      })

    return () => {
      void supabase.removeChannel(channel)
      setIsSubscribed(false)
    }
  }, [channelType, channelId, queryClient])

  return { ...query, isSubscribed }
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async (message: InsertTables<'messages'>) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single()
      if (error) throw error
      return data
    },
    // No invalidation needed — realtime handles updates
  })
}
