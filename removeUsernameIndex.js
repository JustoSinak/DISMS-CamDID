// Script to remove the unique index on 'username' from the users collection
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test'; // Change if needed

async function dropUsernameIndex() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const result = await mongoose.connection.db.collection('users').dropIndex('username_1');
    console.log('Index dropped:', result);
  } catch (err) {
    console.error('Error dropping index:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

dropUsernameIndex();
