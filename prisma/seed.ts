// import "dotenv/config";
// import { PrismaClient } from "../src/generated/prisma/client.js";
// import  { BookingStatus } from "../src/generated/prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";
// import bcrpt from "bcrypt"

// const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] as string });
// const prisma = new PrismaClient({ adapter });

// async function main() {
//   console.log("🌱 Seeding database...");

//   // Clean existing data first — order matters because of foreign keys
//   // Delete in reverse order of dependencies
//   await prisma.booking.deleteMany();
//   await prisma.listingPhoto.deleteMany();
//   await prisma.listing.deleteMany();
//   await prisma.user.deleteMany();

//   console.log("🗑️  Cleared existing data");

//   // ─── Seed Users ───────────────────────────────────────────────────────────

// const alice = await prisma.user.upsert({
//   where: { email: "alice@example.com" },
//   update: {},
//   create: {
//     name: "Alice Johnson",
//     email: "alice@example.com",
//     username: "alice_host",
//     phone:"07877677776",
//     password: await  bcrpt.hash("password123", 10),
//     role: "HOST",
//   },
// });

//   const bob = await prisma.user.upsert({
//     where: { email: "bob@example.com" },
//     update:{},
//     create: {
//     name: "Bob Smith",
//     email: "bob@example.com",
//     username: "bob_guest",
//     phone: "+1-555-0101",
//     password: "$2b$10$hashedpasswordhere",
//     role: "HOST",
//     },
//   });

//   const carol = await prisma.user.upsert({
//     where: { email: "carol@example.com" },
//     update:{},
//     create: {
//       name: "Carol White",
//       email: "carol@example.com",
//       username: "carol_guest",
//       phone: "+1-555-0102",
//       password: "$2b$10$hashedpasswordhere",
//       role: "GUEST",
//     },
//   });
// const neema = await prisma.user.upsert({
//     where: { email: "neema@example.com" },
//     update:{},
//     create: {
//       name: "neema",
//       email: "neema@example.com",
//       username: "neema_guest",
//       phone: "+1-555-0102",
//       password: "$2b$10$hashedpasswordhere",
//       role: "GUEST",
//     },
//   });
//     const clarisse = await prisma.user.upsert({
//     where: { email: "clarisse@example.com" },
//     update:{},
//     create: {
//       name: "clarisse",
//       email: "clarisse@example.com",
//       username: "clarisse_guest",
//       phone: "+1-555-0102",
//       password: "$2b$10$hashedpasswordhere",
//       role: "GUEST",
//     },
//   });

//   console.log("👥 Created users");

//   // ─── Seed Listings ────────────────────────────────────────────────────────

//   const listing1 = await prisma.listing.create({
//     data: {
//         id:90,
//       title: "Cozy apartment in downtown",
//       description: "A beautiful apartment in the heart of the city",
//       location: "New York, NY",
//       pricePerNight: 120,
//       guests: 2,
//       type: "APARTMENT",
//       amenities: ["WiFi", "Kitchen", "Air conditioning"],
//       hostId: alice.id,
//     },
//   });

//   const listing2 = await prisma.listing.create({
//     data: {
//       id:78,
//       title: "Beach house with ocean view",
//       description: "Wake up to stunning ocean views every morning",
//       location: "Miami, FL",
//       pricePerNight: 250,
//       guests: 6,
//       type: "HOUSE",
//       amenities: ["WiFi", "Pool", "Beach access", "BBQ"],
//       hostId: alice.id,
//     },
//   });

//   // Create additional listings (VILLA + CABIN) in bulk. Use createMany because
//   // we don't need the returned records for these; skipDuplicates avoids errors
//   // when re-running the seeder.
//   await prisma.listing.createMany({
//     data: [
//       {
//         title: "Luxury beachfront villa",
//         description: "Beautiful villa with private pool and ocean views",
//         location: "Malibu, CA",
//         pricePerNight: 450,
//         guests: 8,
//         type: "VILLA",
//         amenities: ["Pool", "WiFi", "Beach access", "Kitchen"],
//         hostId: alice.id,
//       },
//       {
//         title: "Forest cabin retreat",
//         description: "Cozy cabin tucked away in the woods",
//         location: "Asheville, NC",
//         pricePerNight: 160,
//         guests: 4,
//         type: "CABIN",
//         amenities: ["Fireplace", "Hiking trails", "Hot tub"],
//         hostId: alice.id,
//       },
//     ],
//     skipDuplicates: true,
//   });

//   console.log("🏠 Created listings (individual + bulk)");
//   console.log("Listing ids to use in Swagger:", {
//     listing1Id: listing1.id,
//     listing2Id: listing2.id,
//   });

//   // ─── Seed Bookings ────────────────────────────────────────────────────────

//   // Create an additional listing individually (we need its id for bookings)
//   const listing3 = await prisma.listing.create({
//     data: {
//         id:36,
//       title: "Luxury beachfront villa (seed)",
//       description: "Beautiful villa with private pool and ocean views",
//       location: "Malibu, CA",
//       pricePerNight: 450,
//       guests: 8,
//       type: "VILLA",
//       amenities: ["Pool", "WiFi", "Beach access"],
//       hostId: alice.id,
//     },
//   });

//   console.log("Additional booking listing id:", {
//     listing3Id: listing3.id,
//   });

//   // Helper to create a booking and calculate totalPrice = nights * pricePerNight
//   const createBooking = async (guestId: number, listing: { id: number; pricePerNight: number }, checkInStr: string, checkOutStr: string, status: BookingStatus) => {
//     const checkIn = new Date(checkInStr);
//     const checkOut = new Date(checkOutStr);
//     const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
//     const totalPrice = nights * listing.pricePerNight;
//     return prisma.booking.create({
//       data: {
//         checkIn,
//         checkOut,
//         totalPrice,
//         status,
//         guestId,
//         listingId: listing.id,
//       },
//     });
//   };

//   // Three future bookings
//   await createBooking(bob.id, listing1, "2026-08-01", "2026-08-05", BookingStatus.CONFIRMED); // 4 nights × 120
//   await createBooking(carol.id, listing2, "2026-09-10", "2026-09-15", BookingStatus.PENDING); // 5 nights × 250
//   await createBooking(neema.id, listing3, "2026-12-01", "2026-12-04", BookingStatus.CONFIRMED); // 3 nights × 450

//   console.log("📅 Created bookings");
//   console.log("✅ Seeding complete!");
// }

// main()
//   .catch((error) => {
//     console.error("❌ Seed failed:", error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

import prisma from "../src/config/prisma.js";

async function seed() {
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      username: "admin",
      phone:"0791168562"
    },
  });

  console.log("Seed completed");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());