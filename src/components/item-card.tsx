"use client"

import { useState } from "react"
// import Image from "next/image"
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

interface Item {
  id: number
  name: string
  quantity: number
  // image: string
}

export default function ItemCard({ item }: { item: Item }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [requestQuantity, setRequestQuantity] = useState(1)
  const [isRequested, setIsRequested] = useState(false)

  const handleRequest = () => {
    // Here you would typically send a request to your backend
    console.log(`Requested ${requestQuantity} of ${item.name}`)
    if (item.quantity < requestQuantity) {
      console.error("Requested quantity exceeds available quantity")
      window.alert('Requested quantity exceeds available quantity')
      return
    }
    setIsRequested(true)

    // Reset after 3 seconds
    setTimeout(() => {
      setIsRequested(false)
      setIsDialogOpen(false)
      setRequestQuantity(1)
    }, 3000)
  }

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200 w-full">
        <div className="relative pt-4 px-4 flex-grow">
          <div className="relative h-40 w-full mb-4">
            {/* <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain" /> */}
          </div>
          <h3 className="font-medium text-lg mb-2">{item.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Available: <strong>{item.quantity}</strong>
            </span>
          </div>
        </div>
        <CardFooter className="border-t p-4">
          <Button onClick={() => setIsDialogOpen(true)} className="w-full" disabled={item.quantity === 0}>
            {item.quantity === 0 ? "Out of Stock" : "Request Item"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Item</DialogTitle>
            <DialogDescription>Please specify the quantity you would like to request.</DialogDescription>
          </DialogHeader>

          {!isRequested ? (
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={item.quantity}
                    value={requestQuantity}
                    onChange={(e) => setRequestQuantity(Number.parseInt(e.target.value) || 1)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleRequest}>Submit Request</Button>
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
                {requestQuantity > 1 ? "s" : ""} has been submitted.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

