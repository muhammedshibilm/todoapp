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
});
//   test("Deletes a todo with the given ID and sends a boolean response", async () => {
//     // Create a new todo to delete
//     let res = await agent.get("/");
//     let csrfToken = extractCsrfToken(res);
//     const newTodoResponse = await agent.post("/todos").send({
//       title: "Delete this todo",
//       dueDate: new Date().toISOString(),
//       completed: false,
//       _csrf: csrfToken,
//     });

//     const groupedTodosResponse = await agent.get("/").set("Accept", "application/json");
//     const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
//     const dueTodayCount = parsedGroupedResponse.dueToday.length;
//     const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

//     // Delete the created todo
//     res = await agent.get("/");
//     csrfToken = extractCsrfToken(res); // Get new CSRF token for DELETE request

//     const deleteResponse = await agent.delete(`/todos/${latestTodo.id}`).send({
//       _csrf: csrfToken,
//     });

//     expect(deleteResponse.statusCode).toBe(200); // Expect successful deletion
//     expect(deleteResponse.body).toBe(true); // Expect boolean true response
//   });
// });
