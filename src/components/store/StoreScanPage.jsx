import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Camera, Package, QrCode, Plus } from 'lucide-react';
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
      
      console.log('Extracted QR Codes:', qrCodes);

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
      console.error('Error scanning QR code:', error);
      alert('Error scanning QR code. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const confirmStoreExistingItem = async () => {
    if (!matchedItem) return;
    
    setIsStoring(true);
    try {
      // await axios.post("http://172.20.10.10:5000/send-command", {
      //   command: "store",
      //   shelf: matchedItem.shelf,
      //   box: matchedItem.box,
      //   itemId: matchedItem.id
      // });
      
      alert(`Item ${matchedItem.name} stored successfully!`);
      resetScan();
    } catch (error) {
      console.error('Error storing item:', error);
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
      
      const newItem = await createItem({
        name: newItemForm.name,
        image: imageToSave,
        qrCode: qrString
      });

      // await axios.post("http://172.20.10.10:5000/send-command", {
      //   command: "store",
      //   shelf: newItem.shelf,
      //   box: newItem.box,
      //   itemId: newItem.id
      // });

      setGeneratedQR(qrString);
      setStep('success');
    } catch (error) {
      console.error('Error creating new item:', error);
      alert('Error creating new item. Please try again.');
    } finally {
      setIsStoring(false);
    }
  };

  // NEW: Create item directly without scanning
  const createDirectItem = async () => {
    if (!newItemForm.name.trim()) {
      alert('Please enter an item name.');
      return;
    }

    setIsStoring(true);
    try {
      const qrString = generateQRString(newItemForm.name);
      
      const newItem = await createItem({
        name: newItemForm.name,
        image: null, // No image since we're not capturing
        qrCode: qrString
      });

      // await axios.post("http://172.20.10.10:5000/send-command", {
      //   command: "store",
      //   shelf: newItem.shelf,
      //   box: newItem.box,
      //   itemId: newItem.id
      // });

      setGeneratedQR(qrString);
      setStep('success');
    } catch (error) {
      console.error('Error creating new item:', error);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 w-full relative">
      

      <div className="flex flex-col items-center space-y-6 w-full max-w-4xl p-6">
        {step === 'scan' && (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-6 w-6" />
                QR Code Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="rounded-lg border"
                />
                <div className="flex gap-3 mt-4">
                  <Button 
                    onClick={captureAndScan}
                    disabled={isScanning}
                    size="lg"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    {isScanning ? 'Scanning...' : 'Capture & Scan QR'}
                  </Button>
                  <Button 
                    onClick={goToCreateDirect}
                    variant="outline"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'confirm' && matchedItem && (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Item Found!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {matchedItem.image && (
                  <img 
                    src={matchedItem.image} 
                    alt={matchedItem.name}
                    className="w-20 h-20 object-contain border rounded"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{matchedItem.name}</h3>
                  <p className="text-gray-600">Shelf: {matchedItem.shelf}, Box: {matchedItem.box}</p>
                  <p className="text-sm text-gray-500">QR: {scanResult}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={confirmStoreExistingItem}
                  disabled={isStoring}
                  className="flex-1"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {isStoring ? 'Storing...' : 'Confirm Store'}
                </Button>
                <Button variant="outline" onClick={resetScan}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'new-item' && (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>New Item Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">QR code not found in database. Register new item:</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={newItemForm.name}
                    onChange={(e) => setNewItemForm(prev => ({...prev, name: e.target.value}))}
                    placeholder="Enter item name..."
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={createNewItem}
                  disabled={isStoring || !newItemForm.name.trim()}
                  className="flex-1"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {isStoring ? 'Creating...' : 'Create & Store Item'}
                </Button>
                <Button variant="outline" onClick={resetScan}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NEW: Direct item creation without scanning */}
        {step === 'create-direct' && (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Create New Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Create a new item and generate QR code:</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="directItemName">Item Name</Label>
                  <Input
                    id="directItemName"
                    value={newItemForm.name}
                    onChange={(e) => setNewItemForm(prev => ({...prev, name: e.target.value}))}
                    placeholder="Enter item name..."
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={createDirectItem}
                  disabled={isStoring || !newItemForm.name.trim()}
                  className="flex-1"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {isStoring ? 'Creating...' : 'Create Item & Generate QR'}
                </Button>
                <Button variant="outline" onClick={resetScan}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-green-600">Success!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p>Item "{newItemForm.name}" has been created and stored successfully!</p>
              
              {generatedQR && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Generated QR Code:</p>
                  <div className="flex justify-center">
                    <QRCodeSVG value={generatedQR} size={128} />
                  </div>
                  <p className="text-xs text-gray-500 break-all">{generatedQR}</p>
                  <p className="text-sm text-blue-600">Print or save this QR code for future scanning!</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button onClick={resetScan} className="flex-1">
                  Create Another Item
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};