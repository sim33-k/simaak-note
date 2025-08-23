"use client";
import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import TipTapMenuBar from "./TipTapMenuBar";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { NoteType } from "@/lib/db/schema";
import { useDebounce } from "@/lib/useDebounce";

type Props = { note: NoteType };

const TipTapEditor = ({ note }: Props) => {
  const [editorState, setEditorState] = React.useState(() => {
    // Check if editorState is valid HTML content, not just "{}" or empty
    if (note.editorState && note.editorState !== "{}" && note.editorState.trim() !== "") {
      return note.editorState;
    }
    return `<h1>${note.name}</h1>`;
  });
  
  const hasInitialized = React.useRef(false);
  const lastSavedContent = React.useRef(editorState);
  
  const saveNote = useMutation({
    mutationFn: async (content: string) => {
      const response = await axios.post("/api/saveNote", {
        noteId: note.id,
        editorState: content,
      });
      return response.data;
    },
  });
  
  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit],
    content: editorState,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setEditorState(editor.getHTML());
    },
  });

  const debouncedEditorState = useDebounce(editorState, 1000)
  
  React.useEffect(() => {
    // Skip initial render
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      lastSavedContent.current = debouncedEditorState;
      return;
    }
    
    // Skip if content hasn't changed
    if (debouncedEditorState === lastSavedContent.current) {
      return;
    }
    
    // Skip if it's empty or just the default heading
    if (debouncedEditorState === "" || debouncedEditorState === `<h1>${note.name}</h1>`) {
      return;
    }
    
    console.log("Saving note:", debouncedEditorState);
    lastSavedContent.current = debouncedEditorState;
    
    saveNote.mutate(debouncedEditorState, {
      onSuccess: (data) => {
        console.log("success update!", data);
      },
      onError: (err) => {
        console.error(err);
      },
    });
  }, [debouncedEditorState, saveNote, note.name]);

  return (
    <>
      <div className="flex">
        {editor && <TipTapMenuBar editor={editor} />}
        <Button disabled variant={"outline"}>
          {saveNote.isPending ? "Saving..." : "Saved"}
        </Button>
      </div>

      <div className="prose prose-sm w-full mt-4">
        <EditorContent editor={editor} />
      </div>
    </>
  );
};

export default TipTapEditor;