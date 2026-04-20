import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'

export const useProgress = defineStore('progress', () => {
  const statuses = ref<Record<string, 'todo' | 'learning' | 'known'>>({})

  async function load() {
    statuses.value = await api.statuses()
  }

  async function set(docId: string, state: 'todo' | 'learning' | 'known') {
    await api.setStatus(docId, state)
    statuses.value[docId] = state
  }

  function get(docId: string, fallback: 'todo' | 'learning' | 'known' = 'todo') {
    return statuses.value[docId] ?? fallback
  }

  return { statuses, load, set, get }
})
