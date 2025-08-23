'use client'
import React from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import { Input } from './ui/input'

type Props = {}

const CreateNoteDialog = (props: Props) => {
    const [input, setInput] = React.useState('')
  return (
    <Dialog>
        <DialogTrigger>
            <div className='border-dashed border-2 flex border-green-600 h-full roundedl-lg items-center justify-center sm:flex-col hover:shadow-xl transition hover: -translate-y-1 flex-row y-4'>
                <Plus className='w-6 h-6 text-green-600' strokeWidth={3}/>
                <h2 className='font-semibold text-green-600 sm:mt-2'>New Note Book</h2>
            </div>
        </DialogTrigger>

        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create a new note</DialogTitle>
                <DialogDescription>
                    Create a new note to get started
                </DialogDescription>
            </DialogHeader>
            <form>
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder='Enter the title of the note' className='border-green-600'/>
                <div className='h-4'></div>
                <div className="flex items-center gap-2">
                    <Button type='reset' variant={'secondary'}>Cancel</Button>
                    <Button className='bg-green-600' type='submit' variant={'default'}>Create</Button>
                </div>
            </form>

        </DialogContent>
    </Dialog>
  )
}

export default CreateNoteDialog