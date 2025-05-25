import React, { useState } from 'react'
import { createItem } from 'wasp/client/operations'
import { ArrowBigLeftDashIcon, ArrowLeft, GalleryVerticalEnd } from "lucide-react"
import { Form } from './components/ui/form'
import StoreForm from './components/store/StoreForm'
import { Button } from './components/ui/button'
import StoreCamera from './components/store/StoreCamera'

export const StorePage = () => {
    const [capturedImage, setCapturedImage] = useState(null);

    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 w-full relative">
      {/* Back button in top left */}
      <div className="absolute top-6 left-6">
        <Button className='' onClick={() => window.location.href = '/'} size={"lg"}>
        <ArrowLeft className="!h-5 !w-6" /> Back
        </Button>
      </div>
      <div className="flex flex-col items-center space-y-4 w-full">
        <div className="w-full flex flex-row items-stretch justify-center gap-8">
        <div className="flex-1 flex items-center justify-end">
          <StoreForm capturedImage={capturedImage} />
        </div>
        <div className="flex-1 flex items-center justify-start">
          <StoreCamera setCapturedImage={setCapturedImage} />
        </div>
        </div>
      </div>
      </div>
    );
}