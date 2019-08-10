// Setup basic express server
var express = require('express');
var app = express();
var fs = require('fs');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;
var loopLimit = 0;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
  fs.writeFileSync(__dirname + '/start.log', 'started'); 
});

// Routing
app.use(express.static(__dirname));

// Entire gameCollection Object holds all games and info

var gameCollection =  new function() {

  this.totalGameCount = 0,
  this.gameList = []

};



function buildGame(socket) {


	 var gameObject = {};
	 gameObject.id = (Math.random()+1).toString(36).slice(2, 18);
	 gameObject.playerOne = socket.username;
	 gameObject.playerTwo = null;
	 gameCollection.totalGameCount ++;
	 gameCollection.gameList.push({gameObject});

	 console.log("Game Created by "+ socket.username + " w/ " + gameObject.id);
	 io.emit('gameCreated', {
	  username: socket.username,
	  gameId: gameObject.id
	});

	    socket.emit('addroom', {room:gameObject.id});
	    console.log('????');

}

function killGame(socket) {

  var notInGame = true;
  for(var i = 0; i < gameCollection.totalGameCount; i++){

    var gameId = gameCollection.gameList[i]['gameObject']['id']
    var plyr1Tmp = gameCollection.gameList[i]['gameObject']['playerOne'];
    var plyr2Tmp = gameCollection.gameList[i]['gameObject']['playerTwo'];
    
    if (plyr1Tmp == socket.username){
      --gameCollection.totalGameCount; 
      console.log("Destroy Game "+ gameId + "!");
      gameCollection.gameList.splice(i, 1);
      console.log(gameCollection.gameList);
      socket.emit('leftGame', { gameId: gameId });
      io.emit('gameDestroyed', {gameId: gameId, gameOwner: socket.username });
      notInGame = false;
    } 
    else if (plyr2Tmp == socket.username) {
      gameCollection.gameList[i]['gameObject']['playerTwo'] = null;
      console.log(socket.username + " has left " + gameId);
      socket.emit('leftGame', { gameId: gameId });
      console.log(gameCollection.gameList[i]['gameObject']);
      notInGame = false;

    } 

  }

  if (notInGame == true){
    socket.emit('notInGame');
  }


}

function gameSeeker (socket) {
  ++loopLimit;
  if (( gameCollection.totalGameCount == 0) || (loopLimit >= 20)) {

    buildGame(socket);
    loopLimit = 0;

  } else {
    var rndPick = Math.floor(Math.random() * gameCollection.totalGameCount);
    if (gameCollection.gameList[rndPick]['gameObject']['playerTwo'] == null)
    {
      gameCollection.gameList[rndPick]['gameObject']['playerTwo'] = socket.username;
      socket.emit('joinSuccess', {
        gameId: gameCollection.gameList[rndPick]['gameObject']['id'] });

      console.log( socket.username + " has been added to: " + gameCollection.gameList[rndPick]['gameObject']['id']);
      socket.emit('addroom', {room: gameCollection.gameList[rndPick]['gameObject']['id']});


    } 


    else {

      gameSeeker(socket);
    }
  }
}

var players = {}
// Chatroom

var numUsers = 0;

io.sockets.on('connection', function (socket) {
  var addedUser = false;

    socket.on('subscribe', function(data) {

      socket.leaveAll();
      socket.join(data.room);
          //save game room name in session
      socket.room = data.room;
      console.log(socket.room);



    })

    socket.on('unsubscribe', function(data) {
      socket.leave(data.room); 
    })

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'



    console.log(socket.rooms);
    console.log('aaaaaaaaa');
    console.log(socket.room);


    socket.broadcast.to(socket.room).emit('new message', {
      username: socket.username,
      message: data,
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    socket.emit('addroom', {room:"lobby"});

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    
    // echo globally (all clients) that a person has connected
    socket.broadcast.to('lobby').emit('user joined', {

      username: socket.username,
      numUsers: numUsers,
    });

  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.to(socket.room).emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.to(socket.room).emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;
      killGame(socket);

      // echo to current room
      socket.broadcast.to(socket.room).emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });


  socket.on('joinGame', function (){
    console.log(socket.username + " wants to join a game");

    var alreadyInGame = false;

    for(var i = 0; i < gameCollection.totalGameCount; i++){
      var plyr1Tmp = gameCollection.gameList[i]['gameObject']['playerOne'];
      var plyr2Tmp = gameCollection.gameList[i]['gameObject']['playerTwo'];
      if (plyr1Tmp == socket.username || plyr2Tmp == socket.username){
        alreadyInGame = true;
        console.log(socket.username + " already has a Game!");

        socket.broadcast.to(socket.room).emit('alreadyJoined', {
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

function getRoom(roomArray) {

  for(var key in roomArray) {
      room = key;
  }
  return room;

}



//my shit does work yeet
var gameState = 0
var testlist = ['apples','banana','orange','dinosaur','hello','testing','type','answer']
var move = '';

function basicGameplay(){
	var move = testlist[Math.floor(Math.random()*testlist.length)];
	gameState = 1;
	for(var i in players){
		var playerWin = playerWinCheck(players[i].message);
		if(playerWin){
			players[i].score += 1;
		}
	}
}

function playerWinCheck(message){
	var playerWins = false;
	if(message == move){
		playerWins = true;
	}
	return playerWins;
}

setInterval(function(){
	basicGameplay();},3000);

    // var ridList = {{riddles|safe}}; 
    // var placement = 0;
    // var rounds = 3;
    // //var rou = 1;

    // //function round(){
    // //    if (rounds!=0)
    // //    {
    // //        document.getElementById("demo").innerHTML = "Round " + rou;
    // //        rou += 1;
    // //    }
    // //    
    // //}
    // function getRiddles() {   
    //     if(rounds != 0)
    //     {
    //         document.getElementById("demo").innerHTML = ridList[placement][0];
    //         document.getElementById("answer").innerHTML = ridList[placement][1];
    //         placement += 1;
    //         rounds -= 1;
    //     }
    // }

    // getRiddles();
    // setInterval(function(){
    //     getRiddles();
    // }, 3000);