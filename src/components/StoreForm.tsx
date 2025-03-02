'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Input } from '../components/ui/input'
import { createItem } from 'wasp/client/operations'
import { Package } from 'lucide-react'

// Schema for password validation
const formSchema = z.object({
    name: z.string().min(2, {
      message: "Item name must be at least 2 characters.",
    }),
    quantity: z.number().min(1, {
        message: "Item quanity should be > 0.",
      }),
  })

export default function StoreForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      quantity: 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>){
    try {
      // Assuming an async create item function
      console.log(values)
      await createItem({ name: values.name, quantity: values.quantity })
      window.alert('Item created successfully')
    window.location.href = "/"
    } catch (error) {
      console.error('Error creating item', error)
    //   toast.error('Failed to reset the password. Please try again.')
    }
  }

  return (
    <div className="flex min-h-[50vh] h-full w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Item</CardTitle>
          <CardDescription>
            Enter item details below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                {/* New Password Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Item name:</FormLabel>
                      <FormControl>
                      <Input placeholder="Ardunio, Photoresistor, ..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel >Quantity:</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder="0" {...field} onChange={event => field.onChange(+event.target.value)}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                    Store Item
                    <Package className="!h-5 !w-5" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
