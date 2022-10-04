const { application } = require('express');
const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());

morgan.token('postdata', (request, response) => {
  return JSON.stringify(request.body);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postdata'));

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

app.get('/info', (request, response) => {
  response.send(`Phonebook has info for ${persons.length} people<br />${new Date()}`);
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);

  if(person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);
  
  response.status(204).end();
});

const generateId = () => {
  return Math.floor(Math.random() * 1000000000);
}

const errorMessage = (response, message) => {
  return response.status(400).json({
    error: message
  });
}

app.post('/api/persons', (request, response) => {
  const body = request.body;
  
  if(!body.name || !body.number) {
    return errorMessage(response, 'name or number is missing');
  } else if(persons.find(person => person.name === body.name)) {
    return errorMessage(response, 'name must be unique');
  }

  const person = {
    id: generateId(),
    name: body.name,
    numebr: body.number
  };
  persons = persons.concat(person);

  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});