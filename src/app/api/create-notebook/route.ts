// api/createNoteBook
// Takes POST and generates an image prompt for the user

import { db } from '@/lib/db';
import { $notes } from '@/lib/db/schema';
import { generateImage, generateImagePrompt } from '@/lib/openai';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

// Vercel Edge function
export const runtime = 'edge';

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  // get the name of the notebook from the request body
  const body = await req.json();
  const { name } = body;
  // Generate the image generation prompt
  const image_description = await generateImagePrompt(name);
  // check if the prompt was generated
  if (!image_description) {
    return new NextResponse('Error generating image prompt', { status: 500 });
  }
  // Generate the image
  const image_url = await generateImage(image_description);
  // Check for url to image
  if (!image_url) {
    return new NextResponse('Error with generated image URL', { status: 500 });
  }
  // Insert note to db - return id of new doc
  const note_ids = await db
    .insert($notes)
    .values({
      name,
      userId,
      imageUrl: image_url,
    })
    .returning({
      insertedId: $notes.id,
    });
  console.log('Note ID from DB:', note_ids[0].insertedId); //TS
  console.log(note_ids);
  return NextResponse.json({
    note_id: note_ids[0].insertedId,
  });
}
