// Setup basic express server
var express = require('express');
var app = express();
var fs = require('fs');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;
var loopLimit = 0;
//var router = express.Router()



server.listen(port, function () {
  console.log('Server listening at port %d', port);
  fs.writeFileSync(__dirname + '/start.log', 'started'); 
});

app.set('view engine', 'jade');
// Routing
app.use(express.static(__dirname));

// Entire gameCollection Object holds all games and info

app.get('/test', function(req, res, next){
	res.render('test')
});
app.post('/test/submit', function(req, res, next){
	res.redirect('/test')
});


var gameCollection =  new function() {

  this.totalGameCount = 0,
  this.gameList = []

};

function buildGame(socket) {

 var gameObject = {};
 gameObject.id = (Math.random()+1).toString(36).slice(2, 18);
 gameObject.playerList = [socket.id]; // adding players by socket ids bc usernames can be the same
 gameObject.numPlayers = 1;
 gameCollection.totalGameCount++;
 gameCollection.gameList.push({gameObject});

 socket.indx = gameObject.numPlayers - 1 //needed to delete user from playerlist array, 
                                        //always one when building a game, so we need inx zero


 console.log("Game Created by "+ socket.username + " w/ " + gameObject.id);
 io.emit('gameCreated', {
  username: socket.username,
  gameId: gameObject.id
});

   socket.emit('addroom', {room:gameObject.id});
   console.log('There are now ' + gameObject.numPlayers + ' player(s) in game' + gameObject.id);
   console.log(gameObject.playerList);


}

/* not sure if i should add this or not--like it'd be good for organization but its not rly needed

function buildPlayer(socket) {
  var playerObject = {}; // store the player in the socket session for this client
  playerObject.id = socket.id; // unique identifier
  player.username = 

}
*/


function killGame(socket) {

  var notInGame = true;
  for(var i = 0; i < gameCollection.totalGameCount; i++){

    game = gameCollection.gameList[i]['gameObject'];
    gameId = game['id'];

    if (game['playerList'].includes(socket.id)) // if the player is in the game
    {

      if (game['numPlayers']==1) // if the player is the last one in the game
      {
          --gameCollection.totalGameCount; 
        console.log("Destroy Game "+ gameId + "!");
        gameCollection.gameList.splice(i, 1);
        console.log(gameCollection.gameList);
        socket.emit('leftGame', { gameId: gameId });
        io.emit('gameDestroyed', {gameId: gameId, lastPlayer: socket.username });
        notInGame = false;
      }

      else // if the player is not the last one in the game (i.e. there are others)
      {
        console.log( "User {" + socket.id + ", " + socket.username + "} has left " + gameId);
        socket.emit('leftGame', { gameId: gameId });
        notInGame = false;



      }

      // re-add to lobby
      // addroom and subscribe will remove user from current game
      socket.emit('addroom', {room: 'lobby'});

      //update game info
      --game['numPlayers'];
      game['playerList'].splice(socket.indx, 1);

      console.log("Users {" + game['playerList'] + "} remaining");



    }

  }

  if (notInGame == true){
    socket.emit('notInGame');
  }


}

// finds a game for the player to join
function gameSeeker (socket) {
  ++loopLimit;
  if (( gameCollection.totalGameCount == 0) || (loopLimit >= 20)) {

    buildGame(socket);
    loopLimit = 0;

  } 

  else {
    var rndPick = Math.floor(Math.random() * gameCollection.totalGameCount);

    game = gameCollection.gameList[rndPick]['gameObject'];
    gameId = game['id'];

    if (game['numPlayers'] < 3) // change MAX number of players in a room here
    {
      socket.emit('addroom', {room: gameId}); // add player to randomly picked room

      socket.emit('joinSuccess', {gameId: game['id'] });
      game['playerList'].push(socket.id);
      game['numPlayers']++;

      // for deleting the player later on, need its index in player list
      socket.indx = game['numPlayers'] - 1;

      console.log("User {" + socket.id + ", " + socket.username + "} has been added to: " + gameId);
      console.log(game['playerList']);
    

    }

    else {

      gameSeeker(socket);
    }
  }
}


// Chatroom

var numUsers = 0;
var users = []

io.sockets.on('connection', function (socket) {

  var addedUser = false;


    socket.on('subscribe', function(data) {
      socket.leaveAll();
      socket.join(data.room); 
  })

    socket.on('unsubscribe', function(data) { 
      socket.leave(data.room); })

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'


    for(var key in socket.rooms) {
      room = key;
    }
    socket.score += 1;

    console.log('Current room is: ' + room);


    socket.broadcast.to(room).emit('new message', {
      username: socket.username,
      message: data,
      score: socket.score
    });
  });


  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    socket.score = 0;
    ++numUsers;
    users.push(username);
    addedUser = true;

	updateClients(); 
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers,
      score: socket.score
    });
    socket.emit('addroom', {room:'lobby'}); // when a user is added to rmt, they join the lobby
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;
      killGame(socket);
		for (var i=0; i<users.length;i++){
		  if(users[i] == socket.username){
		    delete users[i];
		    delete [socket.username]
		  	}
		  }
		updateClients();
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
    updateClients();
  });

    function updateClients() {
        io.sockets.emit('update', users);
    }


  socket.on('joinGame', function (){
    console.log(socket.username + " wants to join a game");

    var alreadyInGame = false;

    for(var i = 0; i < gameCollection.totalGameCount; i++){
      game = gameCollection.gameList[i]['gameObject'];
      if (game['playerList'].includes(socket.username)){
        alreadyInGame = true;
        console.log(socket.username + " already has a Game!");

        socket.emit('alreadyJoined', {
          gameId: gameCollection.gameList[i]['gameObject']['id']
        });

      }

    }
    if (alreadyInGame == false){


      gameSeeker(socket);
      
    }


  });


  socket.on('leaveGame', function() {


    if (gameCollection.totalGameCount == 0){
     socket.emit('notInGame');
     
   }

   else {
    killGame(socket);
  }
  

});

});



