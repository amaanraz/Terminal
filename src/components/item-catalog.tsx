"use client"

import { useState, useEffect } from "react"
import ItemCard from "./item-card"
import { Search } from "lucide-react"
import { Input } from "../components/ui/input"
import { getItems, useQuery } from 'wasp/client/operations'
import { set } from "react-hook-form"

// Mock data to simulate database items
const mockItems = [
  { id: 1, name: "Office Chair", quantity: 12, shelf: 1, box: 7, image: "https://example.com/chair.jpg", qrCode: "QR12345" },
]

export default function ItemCatalog() {
  const { data: itemsFromDb, isLoading, error } = useQuery(getItems)
  const [items, setItems] = useState(mockItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

    // Simulate loading data from a database
    useEffect(() => {
        if (itemsFromDb) {
            console.log(itemsFromDb)
            setItems(itemsFromDb)
        } else{
            console.log("No items found")
        }
    const timer = setTimeout(() => {
        setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
    // setLoading(isLoading) 
    }, [isLoading])

  // Filter items based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setItems(itemsFromDb)
    } else {
      const filteredItems = itemsFromDb.filter((item: { name: string }) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setItems(filteredItems)
    }
  }, [searchTerm])

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-2 w-10/12">
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="Search items..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(100vh-200px)] p-2 w-full">
        {items.length > 0 ? (
          items.map((item: { id: number; name: string; quantity: number; shelf: number; box: number; image: string, qrCode: string}) => (
            <ItemCard key={item.id} item={item} allItems={items} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No items found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}

