const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
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

// Function to retrieve the list of usernames from MongoDB
async function getUsernames(roomId) {
  try {
    await client.connect(); // Connect to the MongoDB server
    const db = client.db(dbName);
    const collection = db.collection('rooms');

    // Find the document for the specific room
    const room = await collection.findOne({ roomId: roomId });

    client.close();

    if (room) {
      return room.usernames;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error retrieving player list:', error);
    return [];
  }
}


const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/CreateRoomButton', (req, res) => {
  res.redirect('/CreateRoom.html');
});

app.get('/JoinRoomButton', (req, res) => {
  res.redirect('/JoinRoom.html');
});

app.get('/CreateLobby', (req, res) => {
  res.redirect('/lobby.html');
});


app.get('/JoinLobby', (req, res) => {
  res.redirect('/lobby.html');
});


app.get('/StartGame', (req, res) => {
  res.redirect('/CreateRoom.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
        io.emit('user disconnected');
      });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
      });

    // Handle joining a room
    socket.on('join', (room, username) => {
      socket.join(room);
      createRoomDocument(room, username);
      getUsernames(room)
      .then((usernames) => {
        socket.emit('updatePlayerList', usernames);
      })
      .catch((error) => {
        console.error('Error getting usernames:', error);
        socket.emit('updatePlayerList', []);
      });
      console.log(`Client joined room: ${room}`);
    });

    socket.on('leave', (room) => {
      socket.leave(room);
      console.log(`Client left room: ${room}`);
    }); 

      // Handle custom events within a room
    socket.on('message', (data) => {
      // Broadcast the message to all clients in the same room
      io.to(data.room).emit('message', data.message);
    });

});
  

server.listen(port, () => {
  console.log('listening on *:' + port);
});