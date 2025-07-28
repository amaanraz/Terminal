import React, { useState } from 'react'
import { ArrowLeft } from "lucide-react"
import { Button } from './components/ui/button'
import { StoreScanPage } from './components/store/StoreScanPage.jsx'
import ItemCatalog from './components/item-catalog'

export const StorePage = () => {
  const [mode, setMode] = useState('scan') // 'scan' or 'manual'

  return (
    <div className="min-h-screen bg-gray-100 w-full relative">
      {/* Back button */}
      <div className="absolute top-6 left-6">
        <Button onClick={() => window.location.href = '/'} size="lg">
          <ArrowLeft className="h-5 w-6" /> Back
        </Button>
      </div>

      <div className="flex flex-col items-center space-y-6 w-full max-w-5xl mx-auto pt-8">
        <div className="flex gap-4 mb-4">
          <Button
            variant={mode === 'scan' ? 'default' : 'outline'}
            onClick={() => setMode('scan')}
          >
            QR Scan & Store
          </Button>
          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            onClick={() => setMode('manual')}
          >
            Select from Catalog
          </Button>
        </div>

        {mode === 'scan' && <StoreScanPage />}
        {mode === 'manual' && (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">Select an Item to Store</h2>
            <p className="text-gray-600 mb-4">
              Please print and affix the QR code to the top making sure it is visible via overhead camera before storing it.
            </p>
            <ItemCatalog mode="store" />
            {/* 
              You can enhance ItemCatalog to accept a prop (e.g. mode="store") 
              and show a "Store" button on each item card that triggers the store logic.
            */}
          </div>
        )}
      </div>
    </div>
  )
}