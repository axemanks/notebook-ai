// This route will save a note
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { $notes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  //save the note
  try {
    const body = await req.json();
    let { noteId, editorState } = body;
    // Check for missing fields
    if (!editorState || !noteId) {
      return new NextResponse('Missing editorState or noteId', { status: 400 });
    }
    // parse noteId to integer
    noteId = parseInt(noteId);
    // get the existing note from the database
    const notes = await db.select().from($notes).where(eq($notes.id, noteId));
    // check if the note exists
    if (notes.length != 1) {
      return new NextResponse('Failed to update', { status: 404 });
    }
    // select the first note
    const note = notes[0];
    // check see if there are any differences before saving
    if (note.editorState !== editorState) {
      // if different, update the note in db
      await db
        .update($notes)
        .set({
          editorState: editorState,
        })
        .where(eq($notes.id, noteId));
    }
    // return success
    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}
