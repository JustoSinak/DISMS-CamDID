const { MongoClient } = require('mongodb');

// Replace with your actual connection string
const uri = 'mongodb+srv://CamDID:Twopiece.23corp@cluster0.fcgsy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  // Replace with your database and collection names
  const dbName = 'CamDID';
  const collectionName = 'users';

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const data = await collection.find({}).toArray();
    console.log('Data from collection:', data);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main();