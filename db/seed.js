import db from "#db/client";
import { createEmployee } from "#db/queries/employees";

await db.connect();
await seedEmployees();
await db.end();
console.log("🌱 Database seeded.");

async function seedEmployees() {
  for (let i = 0; i < 10; i++) {
    const employee = {
      name: "Employee " + i,
      birthday: "2002-10-10",
      salary: Math.floor(Math.random() * 300000),
    };
    await createEmployee(employee);
  }
}
