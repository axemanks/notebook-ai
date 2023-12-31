'use client';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Loader2, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { uploadToFirebase } from '@/lib/firebase';

type Props = {};
// Create notebook dialog
const CreateNoteDialog = (props: Props) => {
  const router = useRouter();
  const [input, setInput] = React.useState('');
  // upload to firebase - pass in note id
  const uploadToFirebase = useMutation({
    mutationFn: async (noteId: string) => {
      const response = await axios.post('/api/uploadToFirebase', {
        noteId: noteId,
      });
      return response.data;
    },
  });

  // create notebook
  const createNotebook = useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/create-notebook', {
        name: input,
      });
      console.log('Response from /api/create-notebook:', response.data);
      return response.data;
    },
  });

  // handle submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input === '') {
      window.alert('Please enter a name for the notebook');
      return;
    }
    createNotebook.mutate(undefined, {
      onSuccess: ({ note_id }) => {
        console.log('Created New Notebook:', { note_id });
        // Hit another endpoint to upload the temp dalle url to permanent storage
        uploadToFirebase.mutate(note_id);

        router.push(`/notebook/${note_id}`);
      },
      onError: (error) => {
        console.error(error);
        window.alert('Error creating notebook');
      },
    });
  };

  return (
    <Dialog>
      <DialogTrigger>
        <div className='border-dashed border-2 flex border-green-600 h-full rounded-lg items-center justify-center sm:flex-col hover:shadow-xl transition hover:-translate-y-1 flex-row p-4'>
          <Plus
            className='w-6 h-6 text-green-600'
            strokeWidth={3}
          />
          <h2 className='font-semibold text-green-600 sm:mt-2'>
            New Note Book
          </h2>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-center'>New Note Book</DialogTitle>
          <DialogDescription className='text-center'>
            You can create a new note by entering a name and clicking create.
            Thumbnail will be generated auto-magically
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Name...'
          />
          <div className='h-4'></div>
          <div className='flex items-center gap-2'>
            <Button
              type='reset'
              variant={'secondary'}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='bg-green-600'
              disabled={createNotebook.isLoading}
            >
              {createNotebook.isLoading && (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              )}
              Create
            </Button>
          </div>
        </form>
        
      </DialogContent>
    </Dialog>
  );
};

export default CreateNoteDialog;
