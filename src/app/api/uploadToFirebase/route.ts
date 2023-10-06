import { db } from "@/lib/db";
import { $notes } from "@/lib/db/schema";
import { uploadToFirebase } from "@/lib/firebase";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// This will get the dalle url and upload the image to firebase
export async function POST(req: Request) {
    try {
        const {noteId} = await req.json();
        // extract the URL
        const notes = await db.select().from($notes).where(eq($notes.id, parseInt( noteId)));
        if (!notes[0].imageUrl){
            return new NextResponse('No image URL', { status: 404 });
        }
        // Save it to Firebase
        const firebase_url = await uploadToFirebase(notes[0].imageUrl, notes[0].name);
        // save to persistent storage
        await db.update($notes).set({
            imageUrl: firebase_url,
        }).where(eq($notes.id, parseInt(noteId)));

        return new NextResponse('Success', { status: 200 });


    } catch (error) {
        console.error(error);
        return new NextResponse('Error saving to firebase', { status: 500 });
    }
}