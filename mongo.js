const config = require('dotenv').config();
const mongoose = require('mongoose');

if(config.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>');
}

const password = config.argv[2];

const url = `mongodb+srv://fso:${password}@cluster0.phnyckr.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model('Person', personSchema);

mongoose
  .connect(url)
  .then(() => {
    if(config.argv.length > 3) {
      const name = config.argv[3];
      const number = config.argv[4];
      const person = new Person({
        name: name,
        number: number
      });
      person.save().then(() => {
        mongoose.connection.close()
      });
    } else {
      Person
        .find({})
        .then(result => {
          console.log('phonebook:');
          result.forEach(person => {
            console.log(person.name, person.number);
          });
          mongoose.connection.close()
        });
    }
  })
  .catch((err) => console.log(err));