const express = require("express");
const app = express();
var csrf = require("tiny-csrf")
const { Todo , User } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("Shh! some secret here"));
app.use(csrf("ahcfriebf23@fh8472938fhfksbfhcka",["POST","PUT","DELETE"]));
// Set up EJS as templating engine
app.set("view engine", "ejs")

app.get("/",  async (request, response) => {

  const dueToday = await Todo.dueToday();
  const overdue = await Todo.overdue();
  const dueLater = await Todo.dueLater();
  const completedTodos = await Todo.completedTodos(); 
   
  if (request.accepts("html")) {
      return response.render("index",{dueToday,overdue,dueLater,completedTodos,csrfToken: request.csrfToken()});
  }else{
    return response.json({dueToday,overdue,dueLater,completedTodos});
  }
  
});

// setup the style css
app.use(express.static(path.join(__dirname,"public")));

app.get("/todos", async function (request, response) {
  console.log("Processing list of all Todos ...");
  // FILL IN YOUR CODE HERE

  // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
  // Then, we have to respond with all Todos, like:
  // response.send(todos)
 try {
    const todos = await Todo.findAll();
    return response.json(todos);
  
 } catch (error) {
   console.log(error);
   return response.status(422).json(error);
  
 }

});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  } 
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    if (request.accepts("html")) {
    return response.redirect("/");
    }else{
      return response.json({todo})
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async function (request, response) {

    const todo = await Todo.findByPk(request.params.id);
     const status = !todo.completed;
     console.log(status);
     
     const  updatedTodo = await todo.setCompletionStatus({compledstatus: status});

      return response.json(updatedTodo); 
});


app.delete("/todos/:id", async function (request, response) {
   
  try {
    const result =  await Todo.deleteTodo(request.params.id);
       return response.redirect("/")
  
  } catch (error) {
    console.log(error);
    return response.status(500).json(error);
  }
});

app.get("/signup",(req,res)=>{
  return res.render("signup",{csrfToken: req.csrfToken()})
})

app.post("/users", async (request,response)=>{
  console.log(request.body.firstName);
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: request.body.password
    });

    response.redirect("/")
  } catch (error) {
    console.log(error);
    
  }
  
})
module.exports = app;
