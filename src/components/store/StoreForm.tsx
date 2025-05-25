'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import React from 'react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { createItem } from 'wasp/client/operations'
import { Package } from 'lucide-react'
import axios from 'axios';

// Schema for password validation
const formSchema = z.object({
    name: z.string().min(2, {
      message: "Item name must be at least 2 characters.",
    }),
    image: z.string().optional(), // <-- Add this line
    // quantity: z.number().min(1, {
    //     message: "Item quanity should be > 0.",
    //   }),
  })

interface StoreFormProps {
  capturedImage: string | null;
}

export default function StoreForm({ capturedImage }: StoreFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      image: capturedImage || '', // <-- Add this line
      // quantity: 0,
    },
  })

  React.useEffect(() => {
    // Update form value if capturedImage changes
    form.setValue('image', capturedImage || '');
  }, [capturedImage]);

  async function onSubmit(values: z.infer<typeof formSchema>){
    try {
      // Send image as part of the item
      const newitem = await createItem({ name: values.name, image: values.image })
      

      // get new item shelf and box number
      console.log(newitem)

      // store item
      // await axios.post("http://172.20.10.10:5000/send-command", {
      //   command: "store",
      //   shelf: newitem.shelf,
      //   box: newitem.box
      // })
      alert(`Item ${values.name} has been stored in shelf ${newitem.shelf} and box ${newitem.box}.`)
      window.location.href = "/"
      // window.alert('A box will be provided , please place the item in it')
    
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
          {/* Show captured image if available */}
          {capturedImage && (
            <div className="mb-4 flex flex-col items-center">
              <img
                src={capturedImage}
                alt="Captured"
                className="rounded-lg max-h-48 object-contain border"
              />
              <span className="text-xs text-gray-500 mt-1">Captured image</span>
            </div>
          )}
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
                        <Input
                          placeholder="Arduino, Photoresistor, ..."
                          {...field}
                          onDrop={e => {
                            e.preventDefault();
                            const text = e.dataTransfer.getData("text/plain");
                            field.onChange(field.value ? field.value + " " + text : text);
                          }}
                          onDragOver={e => e.preventDefault()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                {/*<FormField
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
                />*/}

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
