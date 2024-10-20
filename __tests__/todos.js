const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;

// Helper function to extract CSRF token from the response
function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $('[name="_csrf"]').val();
}

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates a todo", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); // Expecting redirect after successful creation
  });

  test("Marks a todo with the given ID as complete", async () => {
    // Create a new todo
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    // Fetch the created todo to get its ID
    const groupedTodosResponse = await agent.get("/").set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    // Mark the todo as completed
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res); // Get new CSRF token for PUT request

    const markAsCompletedResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });

    const parsedUpdatedResponse = JSON.parse(markAsCompletedResponse.text);
    expect(parsedUpdatedResponse.completed).toBe(true); 
  });

  test("Creates a sample due today item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const today = new Date().toISOString().split('T')[0];
    const response = await agent.post("/todos").send({
      title: "Sample due today",
      dueDate: today,
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); // Expecting redirect after successful creation
  });

  test("Creates a sample due later item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const dueLater = new Date();
    dueLater.setDate(dueLater.getDate() + 1);
    const dueLaterDate = dueLater.toISOString().split('T')[0];
    const response = await agent.post("/todos").send({
      title: "Sample due later",
      dueDate: dueLaterDate,
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); // Expecting redirect after successful creation
  });

  test("Creates a sample overdue item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const overdue = new Date();
    overdue.setDate(overdue.getDate() - 1);
    const overdueDate = overdue.toISOString().split('T')[0];
    const response = await agent.post("/todos").send({
      title: "Sample overdue",
      dueDate: overdueDate,
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); // Expecting redirect after successful creation
  });
});