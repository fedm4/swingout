import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { InsertTables } from '@/types/database.types'

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ['group_members', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('*, profiles(id, username, full_name, avatar_url)')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!groupId,
  })
}

export function useTransportOffers(groupId: string) {
  return useQuery({
    queryKey: ['transport_offers', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transport_offers')
        .select('*, profiles(id, username, full_name, avatar_url)')
        .eq('group_id', groupId)
        .order('departure_time', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!groupId,
  })
}

export function useAccommodationOffers(groupId: string) {
  return useQuery({
    queryKey: ['accommodation_offers', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accommodation_offers')
        .select('*, profiles(id, username, full_name, avatar_url)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!groupId,
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (group: InsertTables<'groups'>) => {
      const { data, error } = await supabase
        .from('groups')
        .insert(group)
        .select()
        .single()
      if (error) throw error
      // Auto-join as admin
      if (data && group.created_by) {
        await supabase.from('group_members').insert({
          group_id: data.id,
          user_id: group.created_by,
          role: 'admin',
        })
      }
      return data
    },
    onSuccess: (_data, variables) => {
      if (variables.event_id) {
        void queryClient.invalidateQueries({ queryKey: ['groups', 'event', variables.event_id] })
      }
    },
  })
}

export function useJoinGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('group_members')
        .insert({ group_id: groupId, user_id: userId, role: 'member' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['group_members', variables.groupId] })
    },
  })
}

export function useLeaveGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['group_members', variables.groupId] })
    },
  })
}

export function useCreateTransportOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (offer: InsertTables<'transport_offers'>) => {
      const { data, error } = await supabase
        .from('transport_offers')
        .insert(offer)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['transport_offers', data.group_id] })
    },
  })
}

export function useCreateAccommodationOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (offer: InsertTables<'accommodation_offers'>) => {
      const { data, error } = await supabase
        .from('accommodation_offers')
        .insert(offer)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['accommodation_offers', data.group_id] })
    },
  })
}
