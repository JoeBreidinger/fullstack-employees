import express from "express";
const router = express.Router();
export default router;

// Import necessary query functions to interact with DB via routes below
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} from "#db/queries/employees";

// Initial response from DB returns welcome message
router.get("/", async (req, res) => {
  res.send("Welcome to the Fullstack Employees API!");
});

// Request for DB to send back array of employees
router.get("/employees", async (req, res) => {
  const employees = await getEmployees();
  res.send(employees);
});

// Routes requests to add a new employee to DB
router.post("/", async (req, res) => {
  //  Check for request body - if missing return error 400
  if (!req.body) return res.status(400).send("Missing request body!");
  // Check for content of req body - if required fields are not filled return error 400
  const { name, birthday, salary } = req.body;
  if (!name || !birthday || !salary) {
    return res.status(400).send("Missing required fields: Name, DOB, Salary");
  }
  // async function awaits response from database - if filed correctly createEmployee runs and employee is added to DB
  const employee = await createEmployee({ name, birthday, salary });
  res.status(201).send(employee);
});

// Middleware to check provided id - does not end res/req cycle and instead passes control to other functions that use the ID param
// NOTE: Needs to come before middleware that use the ID param for the ID given in those function to be checked by this function!
router.param("id", async (req, res, next, id) => {
  // Alien hieroglyph to check for positive integers
  if (!/^\d+$/.test(id))
    return res.status(400).send("ID must be a positive integer!");
  // Check for existing id to match employee to
  const employee = await getEmployee(id);
  if (!employee) return res.status(404).send("Employee not found.");

  req.employee = employee;
  next();
});

// Routes requests to Fetch employee info from DB based on the id provided
router.get("/:id", (req, res) => {
  res.send(req.employee);
});

// Routes requests to Delete employee info from DB based on the id provided
router.delete("/:id", async (req, res) => {
  await deleteEmployee(req.employee.id);
  res.sendStatus(204);
});

// Routes requests to Update attributes (name, DOB, salary) of a employee
router.put("/:id", async (req, res) => {
  // Checks for missing body or missing fields
  if (!req.body) return res.status(400).send("Missing request body!");

  const { name, birthday, salary } = req.body;
  if (!name || !birthday || !salary) {
    return res
      .status(404)
      .send("Missing required fields: Name, Birthday, Salary");
  }

  const employee = await updateEmployee({
    id: req.employee.id,
    name,
    birthday,
    salary,
  });
  res.send(employee);
});
