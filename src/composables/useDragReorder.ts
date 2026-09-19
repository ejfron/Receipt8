import { ref } from 'vue'

export function useDragReorder<T>(getList: () => T[]) {
  const dragIndex = ref<number | null>(null)
  const overIndex = ref<number | null>(null)

  function dragStart(i: number, e: DragEvent) {
    dragIndex.value = i
    e.dataTransfer?.setData('text/plain', String(i))
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
  }

  function dragEnter(i: number) {
    if (dragIndex.value === null) return
    overIndex.value = i
  }

  function dragOver(e: DragEvent) {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  }

  function drop(i: number) {
    const from = dragIndex.value
    dragIndex.value = null
    overIndex.value = null
    if (from === null || from === i) return
    const list = getList()
    const [moved] = list.splice(from, 1)
    list.splice(from < i ? i - 1 : i, 0, moved)
  }

  function dragEnd() {
    dragIndex.value = null
    overIndex.value = null
  }

  return { dragIndex, overIndex, dragStart, dragEnter, dragOver, drop, dragEnd }
}
