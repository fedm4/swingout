import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { InsertTables, UpdateTables } from '@/types/database.types'

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .order('start_date', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: ['event_attendees', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('*, profiles(id, username, full_name, avatar_url)')
        .eq('event_id', eventId)
      if (error) throw error
      return data
    },
    enabled: !!eventId,
  })
}

export function useEventGroups(eventId: string) {
  return useQuery({
    queryKey: ['groups', 'event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!eventId,
  })
}

export function useUpsertAttendee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (attendee: InsertTables<'event_attendees'>) => {
      const { data, error } = await supabase
        .from('event_attendees')
        .upsert(attendee, { onConflict: 'event_id,user_id' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['event_attendees', data.event_id] })
    },
  })
}

export function useRemoveAttendee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['event_attendees', variables.eventId] })
    },
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (event: InsertTables<'events'>) => {
      const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTables<'events'> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['events', data.id] })
      void queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
