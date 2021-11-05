import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors'

const app = express();

app.use(cors());
app.use(express.json());

/**
 *
 *	id: uuid, // precisa ser um uuid
 * 	name: '',
 *	username: '',
 *	todos: []
 *
 */

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username == username)

  if (!user) {
    return response.status(404).json({ error: "User not found! 😢" })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { user, username } = request.body

  const userExists = users.find(user => user.username == username)

  if (userExists) {
    return response.status(400).json({ error: `Username ${username} already exists! 🤡` })
  }

  const newUser = {
    id: uuidv4(),
    user,
    username,
    todos: []
  }

  users.push(newUser)

  // response.send(`Created your user , welcome ${username} 😉`)
  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const todo = user.todos.find((user) => user.id === id)

  if (!todo) {
    return response.status(404).json({ erro: `Invalidate id ${id}, not found` })
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find((user) => user.id === id)

  if (!todo) {
    return response.status(404).json({ erro: `Invalidate id ${id}, not found` })
  }
  // updateTodo[0].done = !updateTodo[0].done
  todo.done = true

  return response.status(201).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoIndex = user.todos.findIndex((todo) => todo.id === id)

  if (todoIndex === -1) {
    return response.status(404).json({ erro: `Not found` })
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).json()
});

export default app;