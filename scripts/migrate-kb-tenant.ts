import clientPromise from "../lib/mongodb";

async function main() {
  const client = await clientPromise;
  const db = client.db("support-os");

  const result = await db.collection("kbDocuments").updateMany(
    {
      tenantId: { $exists: false },
    },
    {
      $set: {
        tenantId: "6abe65b875f9dac2302ce41f",
      },
    },
  );

  console.log(`Updated ${result.modifiedCount} KB documents.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("KB tenant migration failed:", error);
    process.exit(1);
  });