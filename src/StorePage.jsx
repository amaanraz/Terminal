import React, { useState } from 'react'
import { ArrowLeft } from "lucide-react"
import ItemCatalog from './components/item-catalog'
import { StoreScanPage } from './components/store/StoreScanPage.jsx'

export const StorePage = () => {
  const [mode, setMode] = useState('scan') // 'scan' or 'manual'

  const RPI_BASE_URL = "http://172.16.26.205:5000";
  

  return (
    <div className="store-page-root">
      {/* Back button */}
      <div className="store-page-back-btn">
        <button className="hero-btn" onClick={() => window.location.href = '/'}>
          <ArrowLeft className="hero01-icon" /> Back
        </button>
      </div>

      <div className="store-page-content">
        <div className="store-page-mode-toggle">
          <button
            className={`hero-btn${mode === 'scan' ? ' store-page-btn-active' : ' store-page-btn-outline'}`}
            onClick={() => setMode('scan')}
          >
            QR Scan & Store
          </button>
          <button
            className={`hero-btn${mode === 'manual' ? ' store-page-btn-active' : ' store-page-btn-outline'}`}
            onClick={() => setMode('manual')}
          >
            Select from Catalog
          </button>
        </div>

        {mode === 'scan' && <StoreScanPage />}
        {mode === 'manual' && (
          <div className="store-page-catalog">
            <h2 className="store-page-title">Select an Item to Store</h2>
            <p className="store-page-desc">
              Please print and affix the QR code to the top making sure it is visible via overhead camera before storing it.
            </p>
            <ItemCatalog mode="store" />
          </div>
        )}
      </div>
    </div>
  )
}