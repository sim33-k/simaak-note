import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import CreateNoteDialog from '@/components/CreateNoteDialog'
import { UserButton } from '@clerk/nextjs'
import { ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {}

const DashboardPage = (props: Props) => {
  // Mock data - replace with actual notes data
  const notes = [] // This will be populated from your database

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
        {notes.length === 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            <CreateNoteDialog />
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            <CreateNoteDialog />
            {/* Note cards would go here */}
            {/* Example note card structure:
            <div className='bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer'>
              <h3 className='font-medium text-gray-900 mb-2'>Note Title</h3>
              <p className='text-sm text-gray-500 mb-4'>Last edited 2 hours ago</p>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-gray-400'>Created 3 days ago</span>
                <Button variant="ghost" size="sm">Open</Button>
              </div>
            </div>
            */}
          </div>
        )}

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