export const createItem = async (args, context) => {
    return context.entities.Item.create({
      data: { name: args.name, quantity: args.quantity, location: "TBD", status: "Available" },
    })
  }