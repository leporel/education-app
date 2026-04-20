import { defineStore } from 'pinia'
import { ref } from 'vue'

const PIN_KEY = 'edu.ui.notesPinned'

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

  return { notesOpen, selectedNoteId, notesPinned, toggleNotes, openNote, closeNotes, togglePin }
})
