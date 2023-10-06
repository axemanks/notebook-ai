'use client';
import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import TipTapMenuBar from './TipTapMenuBar';
import { Button } from './ui/button';
import { useDebounce } from '@/lib/useDebounce';
import { useMutation } from '@tanstack/react-query';
import Text from '@tiptap/extension-text';
import axios from 'axios';
import { NoteType } from '@/lib/db/schema';
import { useCompletion } from 'ai/react';

type Props = { note: NoteType };

/**
 * TipTapEditor component
 *
 * Renders a Tiptap editor instance for editing note content.
 *
 * Handles saving note content to the database when editor content changes.
 * Enables AI autocompletion via OpenAI API when Shift+A is pressed.
 */
const TipTapEditor = ({ note }: Props) => {
  const [editorState, setEditorState] = React.useState(
    note.editorState ||
      `  
  <h1>${note.name}</h1>
  <p>Start writing your note here...</p>
  
  `
  );
  // Completion hook - complete is the trigger function, completion is the result
  const { complete, completion } = useCompletion({
    api: '/api/completion',
  });
  const saveNote = useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/saveNote', {
        noteId: note.id,
        editorState,
      });
      return response.data;
    },
  });
  // custom keyboard shortcut Shift+A
  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        'Shift-a': () => {
          // take the last 30 words
          const prompt = this.editor.getText().split(' ').slice(-30).join(' ');
          complete(prompt);
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit, customText],
    content: editorState,
    onUpdate: ({ editor }) => {
      setEditorState(editor.getHTML());
    },
  });
  // keep track of the last completion
  const lastCompletion = React.useRef('');
  // individual tokens
  const token = React.useMemo(() => {
    if (!completion) return;
    const diff = completion.slice(lastCompletion.current.length);
    return diff;
  }, [completion]);

  React.useEffect(() => {
    if (!completion || !editor) return;
    // get the difference between the last completion and the current one
    const diff = completion.slice(lastCompletion.current.length);
    // update the last completion
    lastCompletion.current = completion;
    // insert the difference into the editor
    editor.commands.insertContent(diff);
  }, [completion, editor]);

  const debouncedEditorState = useDebounce(editorState, 500);
  React.useEffect(() => {
    console.log('Editor State:', editorState); // TS
    // save to db
    if (debouncedEditorState === '') return;
    saveNote.mutate(undefined, {
      onSuccess: (data) => {
        console.log('success update!', data);
      },
      onError: (err) => {
        console.error(err);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedEditorState]);
  return (
    <>
      <div className='flex justify-between'>
        <div >
          {editor && <TipTapMenuBar editor={editor} />}
        </div>
        {/* Save Button */}
        <Button
          disabled
          variant={'outline'}
        >
          {/* Saving | Saved - depends on isLoading */}
          {saveNote.isLoading ? 'Saving...' : 'Saved'}
        </Button>
      </div>

      <div className='prose prose-sm w-full mt-4'>
        <EditorContent editor={editor} />
      </div>
      <div className='h-4'></div>
      <span className='text-sm'>
        Tip: Press{' '}
        <kbd className='px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg'>
          Shift + A
        </kbd>{' '}
        for AI autocomplete
      </span>
    </>
  );
};

export default TipTapEditor;
