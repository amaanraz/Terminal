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
import CustomModal from "./CustomModal"; // Adjust path as needed

const RPI_BASE_URL = "http://127.0.0.1:5000";

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
        return false
      } catch (err) {
        console.error("Error checking task status:", err)
        return false
      }
    }

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

    setIsFinalizing(true);

    handleRequest("store");

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
      }
    }, 5000);
  }

  const handleRequest = async (command: string) => {
    console.log("Sending command:", command)
    setIsRequested(true)

    try {
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
      <Card className="item-card">
        <div
          className="item-card-qr-btn"
          onClick={() => setShowQrDialog(true)}
          title="Show QR Code"
        >
          <QRCodeSVG value={item.qrCode} size={48} id={`qrcode-svg-${item.id}`} />
        </div>
        <div className="item-card-content">
          <div className="item-card-image-container">
            <img
              src={item.image || ""}
              alt={item.name}
              className="item-card-image"
            />
          </div>
          <h3 className="item-card-title">{item.name}</h3>
          <div className="item-card-details">
            <Package className="item-card-details-icon" />
            <span className="item-card-details-text">
              Shelf: <strong>{item.shelf}</strong>
              Box: <strong>{item.box}</strong>
              Quantity: <strong>{item.quantity}</strong>
            </span>
          </div>
          {/* Show scanned QR codes if available */}
          {retrievalInfo?.qrResults && Object.keys(retrievalInfo.qrResults).length > 0 && (
            <div className="scanned-contents">
              <div className="scanned-contents-title">Scanned Contents:</div>
              <ul className="scanned-contents-list">
                {Object.entries(retrievalInfo.qrResults).map(([qr, count]) => {
                  const matchedItem = allItems.find(i => i.qrCode === qr);
                  const isUnexpected = qr !== item.qrCode;
                  return (
                    <li key={qr}>
                      <span className={isUnexpected ? "scanned-contents-unexpected" : ""}>
                        {matchedItem ? matchedItem.name : <span className="scanned-contents-unknown">Unknown Item</span>}
                        <span className="scanned-contents-qty">x {count}</span>
                        {isUnexpected && " (Unexpected)"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        <CardFooter className="item-card-footer">
          <button
            className="item-card-btn"
            onClick={() => setIsDialogOpen(true)}
          >
            Request Item
          </button>
        </CardFooter>
      </Card>

      <CustomModal open={isDialogOpen || isFinalizing} onClose={() => setIsDialogOpen(false)}>
        {isFinalizing ? (
          <div>
            <h3 className="item-card-dialog-header">Please wait...</h3>
            <p className="item-card-details-text">
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
              <h4 className="item-card-dialog-header">Detected Items:</h4>
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
                          <span className="ml-2 text-xs" style={{ color: "#2563eb" }}>({retrievalInfo.qrTypes[qr]})</span>
                        )}
                        <span className="ml-2" style={{ color: "#dc2626" }}>x {count}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <span className="item-card-details-text">No items detected.</span>
              )}
            </div>
            <button className="item-card-btn mt-4" onClick={handleConfirmRetrieval}>Confirm Retrieval</button>
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
            <div className="item-card-dialog-footer">
              <button className="item-card-btn" onClick={() => handleRequest("retrieve")}>Submit Request</button>
            </div>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="mb-4 item-card-success">
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
            <h3 className="item-card-dialog-header">Request Submitted!</h3>
            <p className="item-card-details-text">
              Your request for {item.name}
              {requestQuantity > 1 ? "s" : ""} has been submitted, please wait...
            </p>
          </div>
        )}
      </CustomModal>

      <CustomModal open={showQrDialog} onClose={() => setShowQrDialog(false)}>
        <h3 className="item-card-dialog-header">QR Code for {item.name}</h3>
        <div style={{ textAlign: "center" }}>
          <QRCodeSVG value={item.qrCode} size={180} />
          <p className="item-card-details-text break-all">{item.qrCode}</p>
          <button className="item-card-btn mt-4" onClick={handlePrint}>Print</button>
        </div>
      </CustomModal>
    </>
  )
}

