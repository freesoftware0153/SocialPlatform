const express = require('express');
const connectDB = require('./config/db');
const app = express();
const path = require('path');
//const http = require('http');

// const server = http.createServer((req, res) => {
//   res.end('server created');
// });

// //connect database
connectDB();

//Init middleware works between get req to browser and response to browser
app.use(express.json()); //this line allow to get data in json format from body

//define routes

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

//Serve static asets in production
if (process.env.NODE_ENV === 'production') {
  //set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server started on port ${PORT}`);
});
