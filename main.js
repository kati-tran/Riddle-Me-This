// client side
$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
  '#ff6961', '#db6b6b', '#ffcb5e', '#ffa530',
  '#b6ff85', '#6d9e55', '#6bb8db', '#a1ffea',
  '#9bbde8', '#8c87ab', '#e3adff', '#d9a6de'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  //var $usersHTML = $('.user');

  var $userboard = $('.userboard'); // hide when barely in lobby
  var $gameContainer = $('.gameContainer'); // hide when barely in lobby

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page
  var $joinGame = $('.joinGame'); 
  var $leaveGame = $('.leaveGame'); 

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var userList = [];
  var socket = io();

  socket.on('update', function (users){
      userList = users;
      $('#user').empty();
      for(var i=0; i<userList.length; i++) {
        if (userList[i] != null){
          $('#user').append("<h1>" + userList[i] + "</h1>"); 
        }
      }
  });

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "I walk a lonely road. The only one that I have ever known. One(1) user online";
    } else {
      message += "there are " + data.numUsers + " players in the Lobby";
    }
    log(message);
  }

  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $userboard.hide();
      $gameContainer.hide();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
      
    }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }








  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
    .text(data.username)
    .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
    .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
    .data('username', data.username)
    .addClass(typingClass)
    .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
     hash = username.charCodeAt(i) + (hash << 5) - hash;
   }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });


  $joinGame.click(function () {
    joinGame();

  })

  $leaveGame.click(function () {
    leaveGame();

  })

  // Socket events


  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to the Game Server ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });


  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);


  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });


  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });




  socket.on('gameCreated', function (data) {
    console.log("Game Created! ID is: " + data.gameId)
    log(data.username + ' created Game: ' + data.gameId);
    //alert("Game Created! ID is: "+ JSON.stringify(data));
  });
  
  socket.on('disconnect', function () {
   log('you have been disconnected');
 });
  
  socket.on('reconnect', function () {
   log('you have been reconnected');
   if (username) {
     socket.emit('add user', username);
   }
 });
  
  socket.on('reconnect_error', function () {
   log('attempt to reconnect has failed');
 });


//Join into an Existing Game
function joinGame(){
  socket.emit('joinGame');

};


socket.on("addroom", function(data) {
    socket.emit('subscribe', data);
    console.log("add", data.room);

});


socket.on('joinSuccess', function (data) {
  log('Joining the following game: ' + data.gameId);
  $userboard.show();
  $gameContainer.show();

});


//Response from Server on existing User found in a game
socket.on('alreadyJoined', function (data) {
  log('You are already in an Existing Game: ' + data.gameId);
});


function leaveGame(){
  socket.emit('leaveGame');
  $userboard.hide();
  $gameContainer.hide();
};

socket.on('leftGame', function (data) {
  log('Leaving Game ' + data.gameId);
});

socket.on('notInGame', function () {
  log('You are not currently in a Game.');
});

socket.on('gameDestroyed', function (data) { 
  log(data.lastPlayer + ' destroyed game: ' + data.gameId);

});

});
