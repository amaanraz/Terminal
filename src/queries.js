
export const getItems = async (args, context) => {
    return context.entities.Item.findMany({
      orderBy: { id: 'asc' },
    })
  }