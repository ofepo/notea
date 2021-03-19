import { useState, useCallback } from 'react'
import { createContainer } from 'unstated-next'
import { NoteTreeState } from './tree'
import { NoteModel } from './note'
import { useTrashAPI } from '../api/trash'
import { noteCache } from '../cache/note'
import { NOTE_DELETED } from 'libs/shared/meta'
import { searchNote } from './search'
import { NoteCacheItem } from '../cache'

function useTrashData() {
  const [keyword, setKeyword] = useState<string>()
  const [list, setList] = useState<NoteCacheItem[]>()
  const { restoreItem, deleteItem } = NoteTreeState.useContainer()
  const { mutate, loading } = useTrashAPI()

  const filterNotes = useCallback(async (keyword?: string) => {
    const data = await searchNote(keyword || '', NOTE_DELETED.DELETED)
    setKeyword(keyword)
    setList(data)
  }, [])

  const restoreNote = useCallback(
    async (note: NoteModel) => {
      // 父页面被删除时，恢复页面的 parent 改成 root
      if (
        !note.pid ||
        // !tree.items[note.pid] ||
        (await noteCache.getItem(note.pid))?.deleted === NOTE_DELETED.DELETED
      ) {
        note.pid = 'root'
      }

      await mutate({
        action: 'restore',
        data: {
          id: note.id,
          parentId: note.pid,
        },
      })
      await noteCache.mutateItem(note.id, {
        deleted: NOTE_DELETED.NORMAL,
      })
      restoreItem(note.id, note.pid)

      return note
    },
    [mutate, restoreItem]
  )

  const deleteNote = useCallback(
    async (id: string) => {
      await mutate({
        action: 'delete',
        data: {
          id,
        },
      })
      await noteCache.removeItem(id)
      deleteItem(id)
    },
    [deleteItem, mutate]
  )

  return {
    list,
    keyword,
    loading,
    filterNotes,
    restoreNote,
    deleteNote,
  }
}

function useFilterModal() {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  return { isOpen, openModal, closeModal }
}

function useTrash() {
  return {
    ...useFilterModal(),
    ...useTrashData(),
  }
}

export const TrashState = createContainer(useTrash)
