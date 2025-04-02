const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { GridFSBucket } = require('mongodb');

dotenv.config();

let gfs;

const connectDB = async () => {
   try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
      });
      console.log('MongoDB connected');

      // Initialize GridFS
      const db = conn.connection.db;
      gfs = new GridFSBucket(db, { bucketName: 'uploads' });
   } catch (err) {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
   }
};

const getGFS = () => gfs;

module.exports = { connectDB, getGFS }; 