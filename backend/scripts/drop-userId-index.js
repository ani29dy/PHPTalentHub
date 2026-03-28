/**
 * One-time migration: drop stale userId_1 index from businessprofiles collection.
 * Run with: node scripts/drop-userId-index.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const col = db.collection("businessprofiles");

  const indexes = await col.indexes();
  console.log("Current indexes:", indexes.map((i) => i.name));

  const stale = indexes.find((i) => i.name === "userId_1");
  if (stale) {
    await col.dropIndex("userId_1");
    console.log("✅ Dropped stale index: userId_1");
  } else {
    console.log("ℹ️  No userId_1 index found — already clean.");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
