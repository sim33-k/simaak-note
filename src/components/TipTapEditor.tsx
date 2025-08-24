"use client";
import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Text from "@tiptap/extension-text";
import TipTapMenuBar from "./TipTapMenuBar";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { NoteType } from "@/lib/db/schema";
import { useDebounce } from "@/lib/useDebounce";

type Props = { note: NoteType };

const TipTapEditor = ({ note }: Props) => {
  const [editorState, setEditorState] = React.useState(
    note.editorState && note.editorState !== "{}" && note.editorState.trim() !== ""
      ? note.editorState
      : `<h1>${note.name}</h1>`
  );

  const [completion, setCompletion] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  
  const hasInitialized = React.useRef(false);
  const lastSavedContent = React.useRef(editorState);
  const lastCompletion = React.useRef("");
  
  const saveNote = useMutation({
    mutationFn: async (content: string) => {
      const response = await axios.post("/api/saveNote", {
        noteId: note.id,
        editorState: content,
      });
      return response.data;
    },
  });

  // Handle streaming AI completion
  const handleCompletion = React.useCallback(async (prompt: string) => {
    try {
      console.log("Starting completion request...");
      setErrorMessage("");
      setCompletion("");

      const response = await fetch("/api/completion", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      console.log("Response received:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        console.error("No response body");
        throw new Error("No response body from API");
      }

      console.log("Starting to read stream...");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = "";
      let chunkCount = 0;

             while (!done) {
         const { value, done: readerDone } = await reader.read();
         done = readerDone;
         if (value) {
           chunkCount++;
           const chunk = decoder.decode(value);
           console.log(`Chunk ${chunkCount}:`, chunk);
           text += chunk;
           setCompletion(text);
           
           // Insert the chunk into the editor at cursor position
           if (editor) {
             editor.commands.insertContent(chunk);
           }
         }
       }
      
      console.log("Stream completed. Total chunks:", chunkCount);
    } catch (err: any) {
      console.error("AI completion error:", err);
      setErrorMessage(err.message || "Unknown error");
    }
  }, []);

  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit],
    content: editorState,
    onUpdate: ({ editor }) => setEditorState(editor.getHTML()),
    // Add this to fix SSR hydration issue
    immediatelyRender: false,
  });

  // Handle Shift+A for autocomplete
  React.useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the editor is focused
      if (!editor.isFocused) return;
      
      if (e.shiftKey && e.key === "A") {
        e.preventDefault();
        
        console.log("Shift+A detected, starting autocomplete...");
        
        const words = editor.getText().split(" ");
        const last30 = words.slice(-30).join(" ");
        
        console.log("Last 30 words:", last30);
        
        handleCompletion(last30);
      }
    };

    // Add event listener to the editor's DOM element instead of document
    const editorElement = editor.view.dom;
    editorElement.addEventListener("keydown", handleKeyDown);
    
    return () => {
      editorElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, handleCompletion]);

  const debouncedEditorState = useDebounce(editorState, 500); // Using 500ms like File 2
  
  // Auto-save when content changes
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
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{errorMessage}</div>
      )}

      <div className="flex items-center gap-2">
        {editor && <TipTapMenuBar editor={editor} />}
        <Button disabled variant={"outline"}>
          {saveNote.isPending ? "Saving..." : "Saved"}
        </Button>
      </div>

      <div className="prose prose-sm w-full mt-4">
        <EditorContent editor={editor} />
      </div>

      <div className="h-4"></div>
      <span className="text-sm">
        Tip: Press{" "}
        <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
          Shift + A
        </kbd>{" "}
        for AI autocomplete
      </span>
    </>
  );
};

export default TipTapEditor;