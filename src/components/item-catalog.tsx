"use client"

import { useState, useEffect } from "react"
import ItemCard from "./item-card"
import { Search } from "lucide-react"
import { Input } from "../components/ui/input"
import { getItems, useQuery } from 'wasp/client/operations'

// Mock data to simulate database items
const mockItems = [
  { id: 1, name: "Office Chair", quantity: 12, shelf: 1, box: 7, image: "https://example.com/chair.jpg", qrCode: "QR12345" },
]

export default function ItemCatalog({ mode = "default" }) {
  const { data: itemsFromDb, isLoading, error } = useQuery(getItems)
  const [items, setItems] = useState(mockItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  // Simulate loading data from a database
  useEffect(() => {
    if (itemsFromDb) {
      setItems(itemsFromDb)
    }
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [isLoading, itemsFromDb])

  // Filter items based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setItems(itemsFromDb)
    } else if (itemsFromDb) {
      const filteredItems = itemsFromDb.filter((item: { name: string }) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setItems(filteredItems)
    }
  }, [searchTerm, itemsFromDb])

  if (error) {
    return <div className="item-card-error">Error: {error.message}</div>
  }

  if (loading || isLoading) {
    return (
      <div className="item-card-loading">
        <div
          style={{
            width: "3rem",
            height: "3rem",
            border: "0.25rem solid #221822",
            borderTop: "0.25rem solid #ccc",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto"
          }}
        ></div>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  return (
    <div className="item-catalog-root">
      <div className="item-catalog-search-container">
        <div className="item-catalog-search-icon">
          <Search className="item-catalog-search-svg" />
        </div>
        <Input
          type="text"
          placeholder="Search items..."
          className="item-catalog-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="item-catalog-grid">
        {items && items.length > 0 ? (
          items.map((item) => (
            <ItemCard key={item.id} item={item} allItems={items} mode={mode} />
          ))
        ) : (
          <div className="item-catalog-empty">
            No items found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}

