import { useStorage } from '@vueuse/core'

const MAX = 15

// Singleton storage shared across composable calls
const recent = useStorage<string[]>('edu.recent', [])

export function useRecent() {
  function push(docId: string) {
    recent.value = [docId, ...recent.value.filter((id) => id !== docId)].slice(0, MAX)
  }

  return { recent, push }
}
