// api/createNoteBook/
import { db } from "@/lib/db"
import { notes } from "@/lib/db/schema"
import { generateImage, generateImagePrompt } from "@/lib/openai"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const {userId} = await auth()
    if (!userId) {
        return new Response("Unauthorized", {status: 401})
    }
    const body = await req.json()
    const name = body.name
    const image_description = await generateImagePrompt(name)
    console.log({image_description})
    const image_url = await generateImage(image_description)
    console.log({image_url})

    const note_ids = await db.insert(notes).values({
        userId,
        name,
        imageUrl: image_url,
        editorState: "{}",
    }).returning({insertedId: notes.id})
    return new NextResponse(JSON.stringify({
        note_id: note_ids[0].insertedId,
    }), {status: 200})


}