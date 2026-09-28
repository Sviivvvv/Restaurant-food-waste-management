// shared sample data and helpers used by both seed_data.js and seed_trend_data.js

// picks a random number between min and max, used to spread sample entries across time and quantity
function random_between(min, max) {
  return Math.random() * (max - min) + min;
}

// picks one random item out of an array
function pick_random(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// rounds a quantity to 2 decimals for weight or volume, or a whole number for unit items
function round_quantity(value, unit) {
  return unit === "unit" ? Math.max(1, Math.round(value)) : Math.round(value * 100) / 100;
}

// standard items a restaurant would track, each with a realistic unit cost and the
// categories and reasons that realistically apply to it, used to generate believable entries
const item_catalog = [
  { name: "Chicken Breast", unit: "kg", cost: 6.5, categories: ["Prep Waste", "Expired Inventory"], reasons: ["Expired", "Dropped", "Quality Issue", "Burnt"], range: [0.3, 3.0], weight: 2 },
  { name: "Beef Mince", unit: "kg", cost: 9.0, categories: ["Prep Waste", "Expired Inventory"], reasons: ["Expired", "Dropped", "Quality Issue"], range: [0.2, 2.0], weight: 2 },
  { name: "Salmon Fillet", unit: "kg", cost: 18.0, categories: ["Prep Waste", "Expired Inventory"], reasons: ["Expired", "Quality Issue"], range: [0.2, 1.5], weight: 1 },
  { name: "Shrimp", unit: "kg", cost: 14.0, categories: ["Prep Waste", "Expired Inventory"], reasons: ["Expired", "Quality Issue"], range: [0.2, 1.2], weight: 1 },
  { name: "Mozzarella Cheese", unit: "kg", cost: 7.5, categories: ["Prep Waste", "Expired Inventory"], reasons: ["Expired", "Quality Issue"], range: [0.2, 1.5], weight: 1 },
  { name: "Milk", unit: "liter", cost: 1.1, categories: ["Expired Inventory"], reasons: ["Expired"], range: [0.5, 4.0], weight: 2 },
  { name: "Tomatoes", unit: "kg", cost: 2.2, categories: ["Prep Waste", "Overproduction"], reasons: ["Quality Issue", "Dropped", "Over Ordered"], range: [0.3, 3.0], weight: 2 },
  { name: "Lettuce", unit: "kg", cost: 1.8, categories: ["Prep Waste", "Overproduction"], reasons: ["Quality Issue", "Dropped", "Over Ordered"], range: [0.3, 2.5], weight: 2 },
  { name: "Onions", unit: "kg", cost: 1.2, categories: ["Prep Waste"], reasons: ["Quality Issue", "Dropped"], range: [0.3, 2.5], weight: 2 },
  { name: "Potatoes", unit: "kg", cost: 1.0, categories: ["Prep Waste", "Overproduction"], reasons: ["Quality Issue", "Over Ordered"], range: [0.5, 4.0], weight: 2 },
  { name: "Mushrooms", unit: "kg", cost: 5.0, categories: ["Prep Waste"], reasons: ["Quality Issue", "Dropped"], range: [0.2, 1.5], weight: 1 },
  { name: "Bell Peppers", unit: "kg", cost: 2.8, categories: ["Prep Waste"], reasons: ["Quality Issue", "Dropped"], range: [0.2, 1.8], weight: 1 },
  { name: "Avocados", unit: "unit", cost: 1.2, categories: ["Prep Waste", "Expired Inventory"], reasons: ["Quality Issue", "Expired"], range: [1, 8], weight: 1 },
  { name: "Rice", unit: "kg", cost: 1.5, categories: ["Overproduction", "Prep Waste"], reasons: ["Over Ordered", "Quality Issue"], range: [0.5, 3.0], weight: 1 },
  { name: "Pasta", unit: "kg", cost: 2.0, categories: ["Overproduction", "Prep Waste"], reasons: ["Over Ordered", "Quality Issue"], range: [0.3, 2.5], weight: 1 },
  { name: "Cooking Oil", unit: "liter", cost: 3.2, categories: ["Prep Waste"], reasons: ["Quality Issue", "Dropped"], range: [0.2, 1.5], weight: 1 },
  { name: "Bread Loaves", unit: "unit", cost: 2.5, categories: ["Overproduction", "Expired Inventory"], reasons: ["Over Ordered", "Expired"], range: [1, 6], weight: 1 },
  { name: "Eggs (dozen)", unit: "unit", cost: 3.0, categories: ["Expired Inventory", "Prep Waste"], reasons: ["Expired", "Dropped"], range: [1, 3], weight: 1 },
  { name: "Grilled Salmon Plate", unit: "unit", cost: 9.5, categories: ["Plate Waste"], reasons: ["Customer Return", "Dropped", "Burnt"], range: [1, 4], weight: 2 },
  { name: "Pasta Carbonara Plate", unit: "unit", cost: 5.0, categories: ["Plate Waste", "Overproduction"], reasons: ["Customer Return", "Over Ordered", "Dropped", "Burnt"], range: [1, 5], weight: 2 },
  { name: "Caesar Salad", unit: "unit", cost: 4.0, categories: ["Plate Waste", "Prep Waste"], reasons: ["Customer Return", "Quality Issue"], range: [1, 5], weight: 2 },
  { name: "Red Wine Bottle", unit: "unit", cost: 12.0, categories: ["Bar Waste"], reasons: ["Dropped", "Expired"], range: [1, 2], weight: 1 },
  { name: "Draft Beer", unit: "liter", cost: 4.5, categories: ["Bar Waste"], reasons: ["Over Ordered", "Dropped"], range: [0.5, 3.0], weight: 1 },
  { name: "Orange Juice", unit: "liter", cost: 2.0, categories: ["Bar Waste", "Expired Inventory"], reasons: ["Expired", "Over Ordered"], range: [0.3, 2.0], weight: 1 }
];

// builds a weighted pool so common items (weight 2) come up more often than rare ones (weight 1)
const weighted_catalog = item_catalog.flatMap((item) => Array(item.weight).fill(item));

module.exports = { item_catalog, weighted_catalog, random_between, pick_random, round_quantity };
