// export const createItem = async (args, context) => {
//     return context.entities.Item.create({
//       data: { name: args.name, quantity: args.quantity, location: "TBD", status: "Available" },
//     })
//   }

export const createItem = async (args, context) => {
  const totalShelves = 4;
  const boxesPerShelf = 6;

  console.log("Creating item:", args.name);

  // Step 1: Get all items with known positions
  const existingItems = await context.entities.Item.findMany({
    where: {
      NOT: [{ location: "TBD" }]  // Ignore unassigned items
    }
  });

  // Step 2: Build a map of occupied slots
  const occupied = new Set();
  existingItems.forEach(item => {
    const key = `${item.shelf}-${item.box}`;
    occupied.add(key);
  });

  console.log("Occupied slots:");
  for (let key of occupied) {
    console.log(" ", key);
  }

  // Step 3: Find the first free slot
  let assignedShelf = null;
  let assignedBox = null;

  outer: for (let shelf = 1; shelf <= totalShelves; shelf++) {
    for (let box = 1; box <= boxesPerShelf; box++) {
      const key = `${shelf}-${box}`;
      if (!occupied.has(key)) {
        assignedShelf = shelf;
        assignedBox = box;
        console.log(`Found available slot: Shelf ${shelf}, Box ${box}`);
        break outer;
      } else {
        console.log(`Slot taken: Shelf ${shelf}, Box ${box}`);
      }
    }
  }

  // Step 4: Create the item or throw an error
  if (assignedShelf !== null) {
    console.log(`Assigning item "${args.name}" to Shelf ${assignedShelf}, Box ${assignedBox}`);
    return context.entities.Item.create({
      data: {
        name: args.name,
        quantity: args.quantity,
        shelf: assignedShelf,
        box: assignedBox,
        status: "Available",
        location: "null",
      }
    });
  } else {
    console.error("No available slots found.");
    throw new Error("No available slots for storage.");
  }
}
