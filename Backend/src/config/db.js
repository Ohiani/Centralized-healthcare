const mongoose = require('mongoose');

// Include "id" alongside "_id" in every JSON response, so API clients can use either
mongoose.set('toJSON', { virtuals: true });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Server will continue to run but database operations may fail');
    return false;
  }
};

module.exports = connectDB;
