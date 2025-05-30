const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Get the users collection
    const usersCollection = mongoose.connection.collection('users');

    // Drop all existing indexes
    await usersCollection.dropIndexes();
    console.log('Dropped all existing indexes');

    // Create new indexes
    await usersCollection.createIndex(
      { email: 1 },
      { unique: true }
    );
    console.log('Created email index');

    await usersCollection.createIndex(
      { username: 1 },
      { 
        unique: true,
        sparse: true,
        partialFilterExpression: { username: { $type: "string" } }
      }
    );
    console.log('Created username index');

    console.log('Successfully fixed indexes');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

fixIndexes(); 