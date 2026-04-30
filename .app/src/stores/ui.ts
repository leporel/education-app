import { defineStore } from 'pinia'
import { ref } from 'vue'

const PIN_KEY = 'edu.ui.notesPinned'
const LEFT_COLLAPSED_KEY = 'edu.ui.leftCollapsed'

export const useUi = defineStore('ui', () => {
  const notesOpen = ref(false)
  const selectedNoteId = ref<string | null>(null)
  const notesPinned = ref<boolean>(
    typeof localStorage !== 'undefined' && localStorage.getItem(PIN_KEY) === '1',
  )

  function toggleNotes() {
    notesOpen.value = !notesOpen.value
  }

  function openNote(id: string) {
    selectedNoteId.value = id
    notesOpen.value = true
  }

  function closeNotes() {
    notesOpen.value = false
  }

  function togglePin() {
    notesPinned.value = !notesPinned.value
    try {
      localStorage.setItem(PIN_KEY, notesPinned.value ? '1' : '0')
    } catch {
      /* noop */
    }
  }

  const leftCollapsed = ref<boolean>(
    typeof localStorage !== 'undefined' && localStorage.getItem(LEFT_COLLAPSED_KEY) === '1',
  )
  const treeCollapsed = ref(false)

  function toggleLeftCollapsed() {
    leftCollapsed.value = !leftCollapsed.value
    try {
      localStorage.setItem(LEFT_COLLAPSED_KEY, leftCollapsed.value ? '1' : '0')
    } catch {
      /* noop */
    }
  }

  return {
    notesOpen,
    selectedNoteId,
    notesPinned,
    leftCollapsed,
    treeCollapsed,
    toggleNotes,
    openNote,
    closeNotes,
    togglePin,
    toggleLeftCollapsed,
  }
})
