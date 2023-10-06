// To Delete the notebook
"use client"
import React from 'react'
import { Button } from './ui/button'
import { Trash } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'

type Props = {
    noteId: number
}

const DeleteButton = ({noteId}: Props) => {
    const router = useRouter()
    const deleteNote = useMutation({
        mutationFn: async () => {
            const response = await axios.post('/api/delete-notebook', {
                noteId: noteId
            })
            return response.data
        }
    })


  return (
    <Button variant="destructive" size="sm" onClick={() => {
        const confirm = window.confirm("Are you sure you want to delete this notebook?")
        if (!confirm) return

        // Hit the delete notebook endpoint
        deleteNote.mutate(undefined, {
            onSuccess: () => {
                router.push('/dashboard')
            },
            onError: (error) => {
                console.error(error);
            }
        })
    }}>
        <Trash className="w-4 h-4 mr-1"/>
    </Button>
  )
}

export default DeleteButton