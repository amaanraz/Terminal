import { getItems, useQuery } from 'wasp/client/operations'
import ItemCatalog  from '../src/components/item-catalog'
import { ArrowLeft } from 'lucide-react'

export const RequestPage = () => {
    return (
        <main className="container">
            <button className="hero-btn mb-5" onClick={() => window.location.href = '/'}>
                <ArrowLeft className="hero01-icon" /> Back
            </button>
            <h1 className="request-title">Item Catalog</h1>
            {/* <p className="request-desc"></p> */}
            <ItemCatalog />
        </main>
    );
}