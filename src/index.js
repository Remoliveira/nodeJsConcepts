const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const{ username } = request.headers;

  const user = users.find((user) => user.username === username )
  
  if(!user){
    return response.status(404).json({error:"user dont exists"})
  }
  request.user = user;
  return next()
}

function checksExistTodo(request,response,next){
  
  const { id } = request.params;
  const { user } = request;

  const rightTodo = user.todos.find((todo) => todo.id === id);

  if(!rightTodo){
    return response.status(404).json({error:"id not found"});
  }
  request.todo = rightTodo;
  return next();
}

app.post('/users', (request, response) => {
  
  const { name, username } = request.body;
  

  const checkUser = users.some((user) => user.username === username);

  if(checkUser){
    return response.status(400).json({error: "user already exists"})
  }

  const user ={
    name,
    username,
    id:uuidv4(),
    todos:[]
  }
  users.push(user);
  
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
 
  const { user } = request;
 

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
    const { title, deadline } = request.body;
    const { user } = request;

    const newTodo = {
      id:uuidv4(),
      title,
      done:false,
      deadline: new Date(deadline),
      created_at: new Date()
    }

    user.todos.push(newTodo);
    
    return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount,checksExistTodo ,(request, response) => {
  
    // const user = request.user;
    const { todo } = request;
    const { title, deadline } = request.body;
    
    todo.title = title;
    todo.deadline = deadline;

    return response.status(200).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistTodo, (request, response) => {

  const { todo } = request;
  
  todo.done = true;
  
  return response.status(200).json(todo)


});

app.delete('/todos/:id', checksExistsUserAccount,checksExistTodo, (request, response) => {
  
  const { todoDelete } = request;
  const user = request.user;

  user.todos.splice(todoDelete, 1);

  return response.status(204).json(user.todos)

});

module.exports = app;