const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb+srv://cockroach-poker-main-db-06755504ad4:gbDZ1t6hQKAnye7HZJzBV4pd7ysGTR@prod-us-central1-2.ih9la.mongodb.net/cockroach-poker-main-db-06755504ad4';

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Function to create a document in MongoDB
async function createRoomDocument(roomId, username) {
  try {
    await client.connect(); // Connect to the MongoDB server
    const db = client.db(); // Get the default database from the client

    // Insert the document into the "rooms" collection
    await db.collection('rooms').insertOne({
      roomId: roomId,
      username: username
    });

    console.log('Room document created successfully');
  } catch (error) {
    console.error('Error creating room document:', error);
  } finally {
    await client.close(); // Close the connection
  }
}

// Usage example
createRoomDocument('room1', 'john');
