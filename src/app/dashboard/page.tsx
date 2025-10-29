import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import CreateNoteDialog from '@/components/CreateNoteDialog'
import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { db } from '@/lib/db'
import { notes as notesTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Image from 'next/image'

type Props = {}

const DashboardPage = async (props: Props) => {
  const user = await currentUser()
  
  if (!user) {
    return null
  }

  const notes = await db.select().from(notesTable).where(eq(notesTable.userId, user.id))

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center gap-4'>
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className='text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                >
                  <ArrowLeft className='mr-2 w-4 h-4' />
                  Back
                </Button>
              </Link>
              <div className='h-6 w-px bg-gray-300' />
              <h1 className='text-xl font-semibold text-gray-900'>My Notes</h1>
            </div>
            <UserButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Search Bar */}
        <div className='mb-8'>
          <div className='max-w-md'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Search notes...'
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F74851] focus:border-[#F74851] bg-white'
              />
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          <CreateNoteDialog />
          {notes.map((note) => (
            <Link key={note.id} href={`/notebook/${note.id}`}>
              <div className='bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col'>
                {note.imageUrl && (
                  <div className='relative w-full h-32 bg-gray-100'>
                    <Image 
                      src={note.imageUrl} 
                      alt={note.name}
                      fill
                      className='object-cover'
                    />
                  </div>
                )}
                <div className='p-4 flex-1 flex flex-col'>
                  <h3 className='font-medium text-gray-900 mb-2 line-clamp-2'>{note.name}</h3>
                  <p className='text-sm text-gray-500 mb-4'>
                    {new Date(note.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <div className='mt-auto'>
                    <Button variant="ghost" size="sm" className='w-full'>Open</Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        {notes.length > 0 && (
          <div className='mt-12 pt-8 border-t border-gray-200'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Quick Actions</h3>
            <div className='flex gap-3'>
              <Button variant="outline" className='border-gray-300 text-gray-700 hover:bg-gray-50'>
                Export All Notes
              </Button>
              <Button variant="outline" className='border-gray-300 text-gray-700 hover:bg-gray-50'>
                Share Notes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage