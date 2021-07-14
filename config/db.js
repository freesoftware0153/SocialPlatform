const mongoose = require('mongoose');
const config = require('config'); // to get string from config
const db = config.get('mongoURI'); // to get anything from config we get value of mongouri in db

const connectDB = async () => {
  try {
    // whenever we use async or await we like to wraqp it in try and catch blok
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true,
    });
    console.log('MongoDB connected...'); // to connect mongDb
  } catch (err) {
    console.error(err.message);
    //exit process with error msg
    process.exit(1);
  } // we need to call withing our server.js and use try and catch if we fail to connect then throw msg of exit status
};
module.exports = connectDB; //exporting function connectDB to server.js
