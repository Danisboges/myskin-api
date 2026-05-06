import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Tambahkan baris ini (gunakan 'node' karena file kamu adalah seed.js)
    seed: 'node prisma/seed.js', 
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});