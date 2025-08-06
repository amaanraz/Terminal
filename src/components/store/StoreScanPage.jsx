import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { QRCodeSVG } from 'qrcode.react';
import { extractQRFromBase64, generateQRString } from '../../utils/qrCodeUtils';
import { createItem, getItems, useQuery } from 'wasp/client/operations';
import axios from 'axios';

export const StoreScanPage = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [matchedItem, setMatchedItem] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [newItemForm, setNewItemForm] = useState({ name: '', type: '' });
  const [generatedQR, setGeneratedQR] = useState(null);
  const [step, setStep] = useState('scan'); // 'scan', 'confirm', 'new-item', 'create-direct', 'success'

  const { data: allItems } = useQuery(getItems);

  const captureAndScan = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc);
    setIsScanning(true);

    try {
      const qrCodes = await extractQRFromBase64(imageSrc);
      if (qrCodes.length > 0) {
        const qrString = qrCodes[0];
        setScanResult(qrString);
        const matchedItem = allItems?.find(item => item.qrCode === qrString);
        if (matchedItem) {
          setMatchedItem(matchedItem);
          setStep('confirm');
        } else {
          setStep('new-item');
        }
      } else {
        alert('No QR code found in the image. Please try again.');
      }
    } catch (error) {
      alert('Error scanning QR code. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const confirmStoreExistingItem = async () => {
    if (!matchedItem) return;
    setIsStoring(true);
    try {
      alert(`Item ${matchedItem.name} stored successfully!`);
      resetScan();
    } catch (error) {
      alert('Error storing item. Please try again.');
    } finally {
      setIsStoring(false);
    }
  };

  const createNewItem = async () => {
    if (!newItemForm.name.trim()) {
      alert('Please enter an item name.');
      return;
    }
    setIsStoring(true);
    try {
      const qrString = generateQRString(newItemForm.name);
      let imageToSave = capturedImage;
      if (imageToSave) {
        imageToSave = await downscaleImage(imageToSave, 400, 0.7);
      }
      await createItem({
        name: newItemForm.name,
        image: imageToSave,
        qrCode: qrString
      });
      setGeneratedQR(qrString);
      setStep('success');
    } catch (error) {
      alert('Error creating new item. Please try again.');
    } finally {
      setIsStoring(false);
    }
  };

  const createDirectItem = async () => {
    if (!newItemForm.name.trim()) {
      alert('Please enter an item name.');
      return;
    }
    setIsStoring(true);
    try {
      const qrString = generateQRString(newItemForm.name);
      await createItem({
        name: newItemForm.name,
        image: null,
        qrCode: qrString
      });
      setGeneratedQR(qrString);
      setStep('success');
    } catch (error) {
      alert('Error creating new item. Please try again.');
    } finally {
      setIsStoring(false);
    }
  };

  function downscaleImage(base64, maxWidth = 400, quality = 0.7) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxWidth / img.width, 1);
        const width = img.width * scale;
        const height = img.height * scale;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(base64);
        }
      };
      img.src = base64;
    });
  }

  const resetScan = () => {
    setCapturedImage(null);
    setScanResult(null);
    setMatchedItem(null);
    setNewItemForm({ name: '', type: '' });
    setGeneratedQR(null);
    setStep('scan');
  };

  const goToCreateDirect = () => {
    setStep('create-direct');
  };

  return (
    <div className="store-scan-root">
      <div className="store-scan-content">
        {step === 'scan' && (
          <div className="store-scan-card">
            <div className="store-scan-card-header">
              <span className="store-scan-card-title">
                QR Code Scanner
              </span>
            </div>
            <div className="store-scan-card-content">
              <div className="store-scan-webcam-container">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="store-scan-webcam"
                />
                <div className="store-scan-btn-row">
                  <button
                    className="hero-btn store-scan-btn"
                    onClick={captureAndScan}
                    disabled={isScanning}
                  >
                    {isScanning ? 'Scanning...' : 'Capture & Scan QR'}
                  </button>
                  <button
                    className="hero-btn store-scan-btn store-scan-btn-outline"
                    onClick={goToCreateDirect}
                  >
                    Create New Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'confirm' && matchedItem && (
          <div className="store-scan-card">
            <div className="store-scan-card-header">
              <span className="store-scan-card-title">Item Found!</span>
            </div>
            <div className="store-scan-card-content">
              <div className="store-scan-item-details">
                {matchedItem.image && (
                  <img
                    src={matchedItem.image}
                    alt={matchedItem.name}
                    className="store-scan-item-image"
                  />
                )}
                <div>
                  <h3 className="store-scan-item-name">{matchedItem.name}</h3>
                  <p className="store-scan-item-meta">Shelf: {matchedItem.shelf}, Box: {matchedItem.box}</p>
                  <p className="store-scan-item-meta">QR: {scanResult}</p>
                </div>
              </div>
              <div className="store-scan-btn-row">
                <button
                  className="hero-btn store-scan-btn"
                  onClick={confirmStoreExistingItem}
                  disabled={isStoring}
                >
                  {isStoring ? 'Storing...' : 'Confirm Store'}
                </button>
                <button
                  className="hero-btn store-scan-btn store-scan-btn-outline"
                  onClick={resetScan}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'new-item' && (
          <div className="store-scan-card">
            <div className="store-scan-card-header">
              <span className="store-scan-card-title">New Item Registration</span>
            </div>
            <div className="store-scan-card-content">
              <p className="store-scan-item-meta">QR code not found in database. Register new item:</p>
              <div className="store-scan-form-row">
                <label htmlFor="itemName" className="store-scan-label">Item Name</label>
                <input
                  id="itemName"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter item name..."
                  className="store-scan-input"
                />
              </div>
              <div className="store-scan-btn-row">
                <button
                  className="hero-btn store-scan-btn"
                  onClick={createNewItem}
                  disabled={isStoring || !newItemForm.name.trim()}
                >
                  {isStoring ? 'Creating...' : 'Create & Store Item'}
                </button>
                <button
                  className="hero-btn store-scan-btn store-scan-btn-outline"
                  onClick={resetScan}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'create-direct' && (
          <div className="store-scan-card">
            <div className="store-scan-card-header">
              <span className="store-scan-card-title">Create New Item</span>
            </div>
            <div className="store-scan-card-content">
              <p className="store-scan-item-meta">Create a new item and generate QR code:</p>
              <div className="store-scan-form-row">
                <label htmlFor="directItemName" className="store-scan-label">Item Name</label>
                <input
                  id="directItemName"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter item name..."
                  className="store-scan-input"
                />
              </div>
              <div className="store-scan-btn-row">
                <button
                  className="hero-btn store-scan-btn"
                  onClick={createDirectItem}
                  disabled={isStoring || !newItemForm.name.trim()}
                >
                  {isStoring ? 'Creating...' : 'Create Item & Generate QR'}
                </button>
                <button
                  className="hero-btn store-scan-btn store-scan-btn-outline"
                  onClick={resetScan}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="store-scan-card">
            <div className="store-scan-card-header">
              <span className="store-scan-card-title" style={{ color: "#16a34a" }}>Success!</span>
            </div>
            <div className="store-scan-card-content store-scan-success-content">
              <p>Item "{newItemForm.name}" has been created and stored successfully!</p>
              {generatedQR && (
                <div className="store-scan-qr-section">
                  <p className="store-scan-item-meta">Generated QR Code:</p>
                  <div className="store-scan-qr-image">
                    <QRCodeSVG value={generatedQR} size={128} />
                  </div>
                  <p className="store-scan-item-meta">{generatedQR}</p>
                  <p className="store-scan-qr-note">Print or save this QR code for future scanning!</p>
                </div>
              )}
              <div className="store-scan-btn-row">
                <button
                  className="hero-btn store-scan-btn"
                  onClick={resetScan}
                >
                  Create Another Item
                </button>
                <button
                  className="hero-btn store-scan-btn store-scan-btn-outline"
                  onClick={() => window.location.href = '/'}
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};