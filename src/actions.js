// export const createItem = async (args, context) => {
//     return context.entities.Item.create({
//       data: { name: args.name, quantity: args.quantity, location: "TBD", status: "Available" },
//     })
//   }

// This one is like good for picking up box from random all location
// export const createItem = async (args, context) => {
//   const totalShelves = 4;
//   const boxesPerShelf = 6;

//   console.log("Creating item:", args.name);

//   // Step 1: Get all items with known positions
//   const existingItems = await context.entities.Item.findMany({
//     where: {
//       NOT: [{ location: "TBD" }]  // Ignore unassigned items
//     }
//   });

//   // Step 2: Build a map of occupied slots
//   const occupied = new Set();
//   existingItems.forEach(item => {
//     const key = `${item.shelf}-${item.box}`;
//     occupied.add(key);
//   });

//   console.log("Occupied slots:");
//   for (let key of occupied) {
//     console.log(" ", key);
//   }

//   // Step 3: Find the first free slot
//   let assignedShelf = null;
//   let assignedBox = null;

//   outer: for (let shelf = 1; shelf <= totalShelves; shelf++) {
//     for (let box = 1; box <= boxesPerShelf; box++) {
//       const key = `${shelf}-${box}`;
//       if (!occupied.has(key)) {
//         assignedShelf = shelf;
//         assignedBox = box;
//         console.log(`Found available slot: Shelf ${shelf}, Box ${box}`);
//         break outer;
//       } else {
//         console.log(`Slot taken: Shelf ${shelf}, Box ${box}`);
//       }
//     }
//   }

//   // Step 4: Create the item or throw an error
//   if (assignedShelf !== null) {
//     console.log(`Assigning item "${args.name}" to Shelf ${assignedShelf}, Box ${assignedBox}`);
//     return context.entities.Item.create({
//       data: {
//         name: args.name,
//         quantity: args.quantity,
//         shelf: assignedShelf,
//         box: assignedBox,
//         status: "Available",
//         location: "null",
//       }
//     });
//   } else {
//     console.error("No available slots found.");
//     throw new Error("No available slots for storage.");
//   }
// }

export const createItem = async (args, context) => {
  console.log("Creating item:", args.name);

  // Step 1: Get all items with known positions
  const existingItems = await context.entities.Item.findMany({
    where: {
      NOT: [{ location: "TBD" }]
    }
  });

  // Step 2: Mark occupied slots
  const occupied = new Set();
  existingItems.forEach(item => {
    const key = `${item.shelf}-${item.box}`;
    occupied.add(key);
  });

  console.log("Occupied slots:");
  for (let key of occupied) {
    console.log(" ", key);
  }

  // Step 3: Check only the allowed slots
  const allowedSlots = [
    { shelf: 1, box: 3 },
    // { shelf: 2, box: 4 },
    { shelf: 3, box: 2 },
    { shelf: 4, box: 4 }
  ];

  let assignedSlot = null;

  for (let slot of allowedSlots) {
    const key = `${slot.shelf}-${slot.box}`;
    if (!occupied.has(key)) {
      assignedSlot = slot;
      console.log(`Found available slot: Shelf ${slot.shelf}, Box ${slot.box}`);
      break;
    } else {
      console.log(`Slot taken: Shelf ${slot.shelf}, Box ${slot.box}`);
    }
  }

  // Step 4: Create the item
  if (assignedSlot) {
    const newitem = await context.entities.Item.create({
      data: {
        name: args.name,
        quantity: 1,
        shelf: assignedSlot.shelf,
        box: assignedSlot.box,
        status: "Available",
        location: "null",
      }
    });
    return newitem
  } else {
    console.error("No available slots in predefined options.");
    throw new Error("No available predefined slots for storage.");
  }
}

export const deleteItem = async (args, context) => {
  return await context.entities.Item.delete({
    where: { id: args.id },
  })
}

