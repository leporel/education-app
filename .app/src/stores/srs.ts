import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'

export const useSrs = defineStore('srs', () => {
  const dueCount = ref(0)

  async function refresh() {
    try {
      const cards = await api.due()
      dueCount.value = cards.length
    } catch {
      dueCount.value = 0
    }
  }

  return { dueCount, refresh }
})
