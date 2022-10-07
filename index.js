require('dotenv').config();
const { application, json } = require('express');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/persons.js');

const app = express();

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

morgan.token('postdata', (request, response) => {
  return JSON.stringify(request.body);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postdata'));

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(`Phonebook has info for ${persons.length} people<br />${new Date()}`);
  });
});

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons);
    })
    .catch(error => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

const errorMessage = (response, message) => {
  return response.status(400).json({
    error: message
  });
}

app.post('/api/persons', (request, response) => {
  const body = request.body;
  
  if(!body.name || !body.number) {
    return errorMessage(response, 'name or number is missing');
  }

  const person = new Person({
    name: body.name,
    number: body.number
  });
        
  person.save().then(result => {
    response.json(result);
  });
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;
  
  if(!body.number) {
    return errorMessage(response, 'name or number is missing');
  }

  const person = {
    name: body.name,
    number: body.number
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(result => {
      response.json(result);
    })
    .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.name)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error);
}

// handler of requests with result to errors
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});