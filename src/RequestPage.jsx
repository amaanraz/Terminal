import { getItems, useQuery } from 'wasp/client/operations'
import ItemCatalog  from '../src/components/item-catalog'
import { Button } from '../src/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const RequestPage = () => {

    return (
        <main className="container mx-auto px-4 py-8">
            <Button className='mb-5' onClick={() => window.location.href = '/'} size={"lg"}>
                <ArrowLeft className="!h-5 !w-6" /> Back
            </Button>
            <h1 className="text-3xl font-bold mb-8 text-center">Item Catalog</h1>
            {/* <p className="mt-6 text-[17px] md:text-lg">
                
            </p> */}
            <ItemCatalog />
      </main>
    );
}