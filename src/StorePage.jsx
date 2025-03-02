import React, { useState } from 'react'
import { createItem } from 'wasp/client/operations'
import { ArrowBigLeftDashIcon, ArrowLeft, GalleryVerticalEnd } from "lucide-react"
import { Form } from './components/ui/form'
import StoreForm from './components/StoreForm'
import { Button } from './components/ui/button'

export const StorePage = () => {
    
    return (
      // <div className="flex flex-col justify-center items-center h-screen space-y-0">
      //   <Button className='absolute left-[35%] top-1/4' onClick={() => window.location.href = '/'}>
      //     <ArrowLeft className="!h-5 !w-5" /> Back
      //   </Button>
      //   <StoreForm/>
      // </div>
      <div className="flex items-center justify-center h-screen bg-gray-100 w-full">
      <div className="flex flex-col items-center space-y-4 w-full">
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-white text-xl font-bold">
          <StoreForm/>
        </div>
        <div className="w-full h-2 bg-gray-100 flex items-center justify-center text-white text-xl font-bold">
          <Button className='' onClick={() => window.location.href = '/'} size={"lg"}>
            <ArrowLeft className="!h-5 !w-6" /> Back
          </Button>
        </div>
      </div>
    </div>
    );
}