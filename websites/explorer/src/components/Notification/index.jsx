import React from 'react'
import { Toaster } from 'react-hot-toast'

export default function Notification() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{}}
      containerClassName="inset-4 md:inset-6"
      toastOptions={{
        // Define default options
        className: 'text-black bg-white shadow-lg',
        duration: 5000,
        // style: {
        //   background: '#363636',
        //   color: '#fff',
        // },
        // Default options for specific types
        success: {
          duration: 3000,
          theme: {
            primary: 'green',
            secondary: 'black',
          },
        },
      }}
    />
  )
}
