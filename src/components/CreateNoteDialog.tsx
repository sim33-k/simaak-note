'use client'
import React from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import { Input } from './ui/input'

type Props = {}

const CreateNoteDialog = (props: Props) => {
    const [input, setInput] = React.useState('')
    const [isOpen, setIsOpen] = React.useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim()) {
            // TODO: Handle note creation
            console.log('Creating note:', input)
            setInput('')
            setIsOpen(false)
        }
    }

    const handleCancel = () => {
        setInput('')
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className='border-dashed border-2 border-[#F74851] h-full rounded-lg items-center justify-center sm:flex-col hover:shadow-xl transition hover:-translate-y-1 flex-row p-4 cursor-pointer group'>
                    <Plus className='w-6 h-6 text-[#F74851] group-hover:scale-110 transition-transform' strokeWidth={3}/>
                    <h2 className='font-semibold text-[#F74851] sm:mt-2 text-center'>New Note</h2>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create a new note</DialogTitle>
                    <DialogDescription>
                        Give your note a title to get started
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        placeholder='Enter the title of the note' 
                        className='border-[#F74851] focus:ring-[#F74851] focus:border-[#F74851]'
                        autoFocus
                    />
                    <div className="flex items-center gap-2 justify-end">
                        <Button type='button' variant='secondary' onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button 
                            className='bg-[#F74851] hover:bg-[#F74851]/90' 
                            type='submit' 
                            disabled={!input.trim()}
                        >
                            Create Note
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateNoteDialog