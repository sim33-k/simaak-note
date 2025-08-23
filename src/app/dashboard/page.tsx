import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import CreateNoteDialog from '@/components/CreateNoteDialog'
import { UserButton } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {}

const DashboardPage = (props: Props) => {
  return (
    <>
    <div className='grainy min-h-screen'>
        <div className='max-w-7xl mx-auto p-10'>
            <div className="h-14"></div>
            <div className="flex justify-between items-center md:flex-row flex-col">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        
                        <Button className='bg-[#F74851]'><ArrowLeft className='mr-1 w-4 h-4' size="sm"/>Back</Button>
                    </Link>
                    <div className="w-4"></div>
                    <h1 className='text-3xl font-bold text-gray-900'>My Notes</h1>
                    <div className="w-4"></div>
                    
                    <UserButton/>

                </div>
            </div>

            <div className="h-8"></div>
            <Separator/>

            <div className="h-8"></div>
            {/* im going to add the notes here */}

            <div className='text-center'>
                <h2 className='text-2xl font-bold text-gray-900'>No notes found</h2>
                <p className='text-gray-500'>Create a note to get started</p>
                <Button className='bg-[#F74851] mt-4'>Create Note</Button>
            </div>


            {/* All the notes here */}

            <div className='grid sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-1 gap-3'>
                {/* Note card */}
                <CreateNoteDialog/>
            </div>

        </div>
    </div>
    </>
  )
}

export default DashboardPage