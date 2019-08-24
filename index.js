// Setup basic express server
var express = require('express');
var app = express();
var fs = require('fs');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;
var loopLimit = 0;
const allRiddles = require("./riddleScraper")
//var router = express.Router()



server.listen(port, function () {
  console.log('Server listening at port %d', port);
  fs.writeFileSync(__dirname + '/start.log', 'started'); 
});

app.set('view engine', 'pug');
// Routing
app.use(express.static(__dirname));

app.get('/', function(req, res){
	//const result = await allRiddles({},3);
	//console.log(result);
	res.render('index'); //{result: result}
});

app.post('/', function(req, res){
	res.redirect('/lobby')
});
app.get('/lobby', function(req, res, next){
  res.render('lobby')
});
app.get('/terms_conditions', function(req, res){
  res.render('tos')
});

app.get('/source_code', function(req, res){
  res.redirect('https://github.com/alexkumar520/Riddle-Me-This')
});
module.exports = express.Router();


// Entire gameCollection Object holds all games and info
var gameCollection =  new function() {

  this.totalGameCount = 0,
  this.gameList = []

};

async function scraper(ridict, rounds){
	try{
	  const result = await allRiddles(ridict,rounds);
	  showRiddles(result);
	  //console.log(result);
	}
	catch(error){
	  	console.log("Error in Scraper")
	}
}

///add parameter for true or false when custom game or random game. 
function buildGame(socket, prival) {
 
 var gameRiddleDict = {}
 scraper(gameRiddleDict,3); //Empty dict for game-specific maybe? And then rounds
 //console.log(gameRiddleDict)
 var gameObject = {};
 gameObject.id = (Math.random()+1).toString(36).slice(2, 18);
 gameObject.playerList = [socket.player]; // adding playerobjects
 gameObject.numPlayers = 1;
 gameObject.prival = prival;
 console.log(gameObject.prival);
 gameCollection.totalGameCount++;
 gameCollection.gameList.push({gameObject});

 socket.indx = gameObject.numPlayers - 1 //needed to delete user from playerlist array, 
                                        //always one when building a game, so we need inx zero



 console.log("Game Created by "+ socket.username + " w/ " + gameObject.id);
 io.emit('gameCreated', {
  username: socket.username,
  gameId: gameObject.id
});

  
  socket.emit('joinSuccess', {gameId: gameObject.id }); // joinSuccess triggers game html
  socket.emit('addroom', {room:gameObject.id});
  console.log('There are now ' + gameObject.numPlayers + ' player(s) in game ' + gameObject.id);
  console.log(gameObject.playerList);

}

function showRiddles(riddict) {
    io.sockets.emit('riddles', riddict);
}

function buildPlayer(socket, username) {
  var playerObject = {}; // store the player in the socket session for this client
  playerObject.id = socket.id; // unique identifier
  playerObject.username = username;
  playerObject.score = 0; // initialized at zero

  return playerObject;
}



function killGame(socket) {

  var notInGame = true;
  for(var i = 0; i < gameCollection.totalGameCount; i++){

    game = gameCollection.gameList[i]['gameObject'];
    gameId = game['id'];
    player = socket.player;

    if (game['playerList'].includes(player)) // if the player is in the game
    {

      if (game['numPlayers']==1) // if the player is the last one in the game
      {
          --gameCollection.totalGameCount; 
        console.log("Destroy Game "+ gameId + "!");
        gameCollection.gameList.splice(i, 1);
        console.log(gameCollection.gameList);
        socket.emit('leftGame', { gameId: gameId });
        io.emit('gameDestroyed', {gameId: gameId, lastPlayer: player['username'] });
        notInGame = false;
      }

      else // if the player is not the last one in the game (i.e. there are others)
      {
        console.log( "User {" + socket.id + ", " + player['username'] + "} has left " + gameId);
        socket.emit('leftGame', { gameId: gameId });
        notInGame = false;



      }

      // re-add to lobby
      // addroom and subscribe will remove user from current game
      socket.emit('addroom', {room: 'lobby'});

      //update game info
      --game['numPlayers'];
      game['playerList'].splice(socket.indx, 1);

      console.log("Users remaining:");
      console.log(game['playerList']);



    }

  }

  if (notInGame == true){
    socket.emit('notInGame');
  }


}

// finds a game for the player to join
function gameSeeker (socket) {
  ++loopLimit;
  //var gameCountCheck = false;
  if (( gameCollection.totalGameCount == 0) || (loopLimit >= 20)) {

    buildGame(socket, false);
    loopLimit = 0;
    //gameCountCheck = true;


  }

  else {
  	var privateval = true;//checks if all the games in the list are private or nah. 
  	for(var i = 0; i < gameCollection.totalGameCount; i++){
	      game = gameCollection.gameList[i]['gameObject'];
	      if (game.prival == false){
	      	if (game['numPlayers'] < 3){ // if the room doesnt have the right size it just moves on to the next one. 
	      		 socket.emit('addroom', {room: gameId}); // add player to randomly picked room

	      		socket.emit('joinSuccess', {gameId: game['id'] }); // joinSuccess triggers game html
	      		game['playerList'].push(player);
	      		game['numPlayers']++;

	      // for deleting the player later on, need its index in player list
	      		socket.indx = game['numPlayers'] - 1;

	      		console.log("User {" + socket.id + ", " + player['username'] + "} has been added to: " + gameId);
	      		console.log(game['playerList']);
	      		privateval = false;
	      		break;
	    
	      	}
	      	else{
	      		continue;
	      	}


	      }
	}
	if (privateval == true)
		  {
		  	socket.emit('createdNewPub');
		  	buildGame(socket, false);
		  }


	/*
    var rndPick = Math.floor(Math.random() * gameCollection.totalGameCount);

    game = gameCollection.gameList[rndPick]['gameObject'];
    gameId = game['id'];
    player = socket.player

	    if (game['numPlayers'] < 3) // change MAX number of players in a room here
	    {
	      socket.emit('addroom', {room: gameId}); // add player to randomly picked room

	      socket.emit('joinSuccess', {gameId: game['id'] }); // joinSuccess triggers game html
	      game['playerList'].push(player);
	      game['numPlayers']++;

	      // for deleting the player later on, need its index in player list
	      socket.indx = game['numPlayers'] - 1;

	      console.log("User {" + socket.id + ", " + player['username'] + "} has been added to: " + gameId);
	      console.log(game['playerList']);
	    

	    }

	    else {

	      gameSeeker(socket);
	    }
	*/
	
	
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
    console.log('Current score is: ' + socket.score);


    socket.broadcast.to(room).emit('new message', {
      username: socket.player['username'],
      message: data,
      score: socket.score
    });
  });


  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    
    // we store the username in the socket session for this client
    socket.username = username;

    //store player object in the socket
    socket.player = buildPlayer(socket, username);
    console.log(socket.player);


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
      username: socket.player['username'],
      numUsers: numUsers,
      score: socket.score
    });
    socket.emit('addroom', {room:'lobby'}); // when a user is added to rmt, they join the lobby
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.player['username']
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.player['username']
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
        username: socket.player['username'],
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
    console.log('lmao what a dumbass');
    var alreadyInGame = false;

    for(var i = 0; i < gameCollection.totalGameCount; i++){
      game = gameCollection.gameList[i]['gameObject'];
      if (game['playerList'].includes(socket.player)){
        alreadyInGame = true;
        console.log(socket.player['username'] + " already has a Game!");

        socket.emit('alreadyJoined', {
          gameId: gameCollection.gameList[i]['gameObject']['id']
        });

      }

    }
    if (alreadyInGame == false){


      gameSeeker(socket);
      
    }


  });

  socket.on('joinExGame', function(exgameid){
  	//console.log(socket.player['username'] + " wants to join a game");

    console.log("player inputted game code: " + exgameid);

    var alreadyInGame = false;
    var matchedGameID = false;
    var fullGame = false;
    if (gameCollection.totalGameCount == 0){
    	socket.emit('noneExist');
    }

    else { ///else block handles the joining of an existing game room, must be modified :)


	    for(var i = 0; i < gameCollection.totalGameCount; i++){
	      game = gameCollection.gameList[i]['gameObject'];
	      console.log(game.id);
	      if (game['playerList'].includes(socket.player)){
	        alreadyInGame = true;
	        console.log(socket.player['username'] + " already has a Game!");

	        socket.emit('alreadyJoined', {
	          gameId: gameCollection.gameList[i]['gameObject']['id']
	        });

	      }
	    }
	}
	if (alreadyInGame == false)
	{
	    for (var i = 0; i < gameCollection.totalGameCount; i++){
	    	exgame = exgameid;
	    	game = gameCollection.gameList[i]['gameObject'];
	      	if (game.id == exgameid)
	      	{
	      		matchedGameID = true;
	      		//take code from gameseeker and push player into it. 
	      		if (game['numPlayers'] < 3) // change MAX number of players in a room here
			    {
			      gameId = game['id'];
			      console.log(gameId);
			      player = socket.player;

			      socket.emit('addroom', {room: gameId}); // add player to randomly picked room

			      socket.emit('joinSuccess', {gameId: game['id'] }); // joinSuccess triggers game html
			      game['playerList'].push(player);
			      game['numPlayers']++;

			      // for deleting the player later on, need its index in player list
			      socket.indx = game['numPlayers'] - 1;

			      console.log("User {" + socket.id + ", " + player['username'] + "} has been added to: " + gameId);
			      console.log(game['playerList']);
				}
				else
				{
					var fullGame = true;
				}
			}
		}
	}

			    

	
    if (matchedGameID == false && alreadyInGame == false){
      socket.emit('nonExistent');
    }
    
    if (fullGame == true && alreadyInGame == false){
    	socket.emit('fullGame');
    }


  });

  socket.on('createPriGame', function(){

  	var alreadyInGame = false;
  	for(var i = 0; i < gameCollection.totalGameCount; i++){
      game = gameCollection.gameList[i]['gameObject'];
      if (game['playerList'].includes(socket.player)){
        alreadyInGame = true;
        console.log(socket.player['username'] + " already has a Game!");

        socket.emit('alreadyJoined', {
          gameId: gameCollection.gameList[i]['gameObject']['id']
        });

      }

    }

    if (alreadyInGame == false){
    	buildGame(socket, true);
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



