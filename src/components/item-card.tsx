"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "../components/ui/button"
import { Card, CardFooter } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Package } from "lucide-react"
import axios from 'axios';
import { deleteItem, updateItem } from 'wasp/client/operations'

const RPI_BASE_URL = "http://192.168.1.107:5000";

interface Item {
  id: number
  name: string
  quantity: number
  shelf: number
  box: number
  image: string | undefined
  qrCode: string
}

export default function ItemCard({ item, allItems }: { item: Item, allItems: Item[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [requestQuantity, setRequestQuantity] = useState(1)
  const [isRequested, setIsRequested] = useState(false)
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [retrievalInfo, setRetrievalInfo] = useState<{
    qrImage?: string,
    qrResults?: { [qr: string]: number },
    qrTypes?: { [qr: string]: string },
    metadata?: any
  } | null>(null)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [finalInfo, setFinalInfo] = useState<{ qrImage?: string, qrResults?: { [qr: string]: number }, qrTypes?: { [qr: string]: string }, metadata?: any } | null>(null)

  const waitForCompletion = async (command: string) => {
    // Poll for completion
      const pollForCompletion = async () => {
        try {
          const response = await axios.get(`${RPI_BASE_URL}/motor-completion`)
          
          if (response.data.status === 'completed' && response.data.command === command) {
            console.log("Task completed! Metadata:", response.data)
            console.log("QR Code:", response.data["qr-results"])
            let qrResults = {}
            let qrTypes = {}
            if (response.data["qr-results"]) {
              qrResults = response.data["qr-results"]
            }
            if (response.data["qr-types"]) {
              qrTypes = response.data["qr-types"]
            }
            setRetrievalInfo({
              qrImage: response.data.qr_image_b64
                ? `data:image/png;base64,${response.data.qr_image_b64}`
                : undefined,
              qrResults,
              qrTypes,
              metadata: response.data.metadata
            })
            setIsRequested(false)
            return true
          } else if (response.data.status === 'error') {
            console.error("Task failed! Error:", response.data.error || 'Unknown error')
            alert(`Task failed: ${response.data.error || 'Unknown error'}`)
            setIsRequested(false)
            setIsDialogOpen(false)
            window.location.reload()
            return true
          } 
          return false // Continue polling
        } catch (err) {
          console.error("Error checking task status:", err)
          return false
        }
      }

      // Poll every 5 seconds, max 30 attempts (2.5 minutes)
      let attempts = 0
      const maxAttempts = 30
      const pollInterval = setInterval(async () => {
        attempts++
        const completed = await pollForCompletion()
        
        if (completed || attempts >= maxAttempts) {
          clearInterval(pollInterval)
          if (attempts >= maxAttempts) {
            alert("Task timeout - please check manually")
          }
        }
      }, 5000)
  }

  const handleConfirmRetrieval = async () => {
    if (!retrievalInfo) return;

    setIsFinalizing(true); // Show finalizing state

    // Send the store command to the robot
    handleRequest("store");

    // Find if this item's QR code is among the detected
    // const detectedCount = retrievalInfo.qrResults?.[item.qrCode];
    // const newQuantity = detectedCount ? detectedCount : 0;
    // const qrImageUrl = retrievalInfo.qrImage?.startsWith('data:')
    //   ? retrievalInfo.qrImage
    //   : `data:image/png;base64,${retrievalInfo.qrImage}`;

    // Poll for store completion
    let attempts = 0;
    const maxAttempts = 30;
    const pollInterval = setInterval(async () => {
      attempts++;
      try {
        const response = await axios.get(`${RPI_BASE_URL}/motor-completion`);
        if (response.data.status === 'completed' && response.data.command === "store") {
            await updateItem({
            id: item.id,
            image: response.data.qr_image_b64
              ? `data:image/png;base64,${response.data.qr_image_b64}`
              : "",
            quantity: response.data["qr-results"]?.[item.qrCode] ?? 0
            });
          clearInterval(pollInterval);
          window.location.reload();
        }
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          alert("Finalization timeout - please check manually");
          setIsFinalizing(false);
        }
      } catch (err) {
        // Optionally handle error
      }
    }, 5000);
  }

  const handleRequest = async (command: string) => {

    setIsRequested(true)

    try {
      // Send the command
      await axios.post(`${RPI_BASE_URL}/send-command`, {
        command,
        shelf: item.shelf,
        box: item.box
      })

      console.log("Command sent. Waiting for completion..." + command)
      
      waitForCompletion(command)

    } catch (err) {
      console.error("Failed to send command:" + command, err)
      window.alert("Could not reach the robot system.")
      setIsRequested(false)
      setIsDialogOpen(false)
      window.location.reload()
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=400')
    printWindow?.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
        </head>
        <body style="display:flex;align-items:center;justify-content:center;height:100vh;">
          <div style="text-align:center;">
            <div id="qrcode"></div>
            <p style="margin-top:16px;font-size:18px;">${item.name}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `)
    setTimeout(() => {
      const qrDiv = printWindow?.document.getElementById('qrcode')
      if (qrDiv) {
        qrDiv.innerHTML = document.getElementById(`qrcode-svg-${item.id}`)?.outerHTML || ''
      }
    }, 100)
  }

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200 w-full relative">
        {/* QR Code in top right, clickable */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            background: "white",
            borderRadius: 12,
            padding: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18), 0 1.5px 4px rgba(0,0,0,0.10)"
          }}
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => setShowQrDialog(true)}
          title="Show QR Code"
        >
          <QRCodeSVG value={item.qrCode} size={48} id={`qrcode-svg-${item.id}`} />
        </div>
        <div className="relative pt-4 px-4 flex-grow">
          <div className="relative h-40 w-full mb-4">
            <img
              src={item.image || ""}
              alt={item.name}
              className="object-contain"
              style={{ width: "100%", height: "100%", objectFit: "contain", position: "absolute", top: 0, left: 0 }}
            />
          </div>
          <h3 className="font-medium text-lg mb-2">{item.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Shelf: <strong className="mr-1">{item.shelf}</strong>
              Box: <strong className="mr-1" >{item.box}</strong>
              Quantity: <strong>{item.quantity}</strong>
            </span>
          </div>
        </div>
        <CardFooter className="border-t p-4">
          <Button onClick={() => setIsDialogOpen(true)} className="w-full" disabled={item.quantity === 0}>
            {item.quantity === 0 ? "Out of Stock" : "Request Item"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog
        open={isDialogOpen || isFinalizing}
        onOpenChange={(open) => {
          // Prevent closing while finalizing or waiting for request/confirmation
          if (!isRequested && !retrievalInfo && !isFinalizing) {
            setIsDialogOpen(open);
          }
        }}
      >
        <DialogContent>
          {isFinalizing ? (
            <div className="py-6 text-center">
              <div className="mb-4 text-blue-500 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Please wait...</h3>
              <p className="text-muted-foreground">
                The system is resetting for the next operation/request. This may take a moment.
              </p>
            </div>
          ) : retrievalInfo ? (
            <div className="py-4 flex flex-col items-center">
              {retrievalInfo.qrImage && (
                <img
                  src={retrievalInfo.qrImage}
                  alt="Detected QR"
                  className="mb-4 rounded border shadow"
                  style={{ maxWidth: 220 }}
                />
              )}
              <div className="mb-2 w-full">
                <h4 className="font-semibold mb-1">Detected Items:</h4>
                {retrievalInfo.qrResults && Object.keys(retrievalInfo.qrResults).length > 0 ? (
                  <ul className="text-sm bg-gray-100 rounded p-2">
                    {Object.entries(retrievalInfo.qrResults).map(([qr, count]) => {
                      const matchedItem = allItems.find(i => i.qrCode === qr);
                      return (
                        <li key={qr}>
                          <span className="font-semibold">
                            {matchedItem ? matchedItem.name : <span className="text-gray-400 italic">Unknown Item</span>}
                          </span>
                          {retrievalInfo.qrTypes && retrievalInfo.qrTypes[qr] && (
                            <span className="ml-2 text-xs text-blue-600">({retrievalInfo.qrTypes[qr]})</span>
                          )}
                          <span className="ml-2 text-red-700">x {count}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <span className="text-muted-foreground">No items detected.</span>
                )}
              </div>
              <Button className="mt-4" onClick={handleConfirmRetrieval}>
                Confirm Retrieval
              </Button>
            </div>
          ) : !isRequested ? (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="item-name" className="text-right">
                    Item
                  </Label>
                  <div className="col-span-3">
                    <Badge variant="outline" className="px-3 py-1">
                      {item.name}
                    </Badge>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => handleRequest("retrieve")}>Submit Request</Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="mb-4 text-green-500 flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Request Submitted!</h3>
              <p className="text-muted-foreground">
                Your request for {requestQuantity} {item.name}
                {requestQuantity > 1 ? "s" : ""} has been submitted, please wait...
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="flex flex-col items-center justify-center">
          <DialogHeader>
            <DialogTitle>QR Code for {item.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <QRCodeSVG value={item.qrCode} size={180} />
            <p className="mt-2 text-center text-muted-foreground break-all">{item.qrCode}</p>
            <Button className="mt-4" onClick={handlePrint}>Print</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

