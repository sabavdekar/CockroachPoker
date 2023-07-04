const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { MongoClient } = require('mongodb');


const uri = 'mongodb+srv://cockroach-poker-main-db-06755504ad4:gbDZ1t6hQKAnye7HZJzBV4pd7ysGTR@prod-us-central1-2.ih9la.mongodb.net/cockroach-poker-main-db-06755504ad4';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


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

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/indexbk.html');
//   });
function parseCSV(csvList) {
  // Split the CSV list into an array of values
  const values = csvList.split(',');

  // Trim leading/trailing spaces from each value
  const trimmedValues = values.map((value) => value.trim());

  return trimmedValues;
}

async function addFieldsToDocument(documentId, fieldsToAdd, RoomID) {
  try {
    await client.connect();
    const collection = client.db().collection(RoomID);
  
    // Update the document using the $set operator to add fields
    const result = await collection.updateOne(
      { _id: documentId },
      { $set: fieldsToAdd }
    );
  
    console.log('Fields added to document:', result.modifiedCount);
  } catch (err) {
    console.error('Error adding fields to document:', err);
  } finally {
    client.close();
  }
}

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

    socket.on('UsernameInput', (msg) => {
      data = parseCSV(msg);
      console.log(data);
      // // Connect to the MongoDB server
      // client.connect((err) => {
      //   if (err) {
      //     console.error('Error connecting to MongoDB:', err);
      //     return;
      //   }
      //   const collection = client.db().collection(array[1]);

      //   const document = {
      //     username: data[0],
      //   };

      //   collection.insertOne(document, (err, result) => {
      //     if (err) {
      //       console.error('Error inserting document:', err);
      //       return;
      //     }

      //     console.log('Document inserted successfully');
      //     // Additional logic after document insertion
      //   });
      // });
      // client.close();
    });

    // Handle joining a room
    socket.on('join', (room) => {
      socket.join(room);
      // Connect to the MongoDB server
      client.connect((err) => {
        if (err) {
          console.error('Error connecting to MongoDB:', err);
          return;
        }
        const collection = client.db().collection(`${room}`);
        
        const document = {
          name: 'John Doe',
          age: 30,
          email: 'john@example.com'
        };

        collection.insertOne(document, (err, result) => {
          if (err) {
            console.error('Error inserting document:', err);
            return;
          }

          console.log('Document inserted successfully');
          // Additional logic after document insertion
        });
      });
      client.close();
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