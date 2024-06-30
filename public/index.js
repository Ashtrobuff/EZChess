let gamehasStarted=false;
var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var messages=[];
var urlParams = new URLSearchParams(window.location.search);
window.onload=function putcode(){
  var code = urlParams.get('code');
  var coder=document.getElementById("coder")
  coder.innerText="room code is :"+code
}
let gameover=false;
function onDragStart (source, piece, position, orientation) {
  if(!gamehasStarted) return false;
  if(gameover) return false;
  if (game.game_over()) return false

  if ((game.turn() === 'w'&& window.location.pathname.includes('black')==true) ||
  (game.turn() === 'b' &&  window.location.pathname.includes("white")==true)) {
return false
}
  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1 && window.location.pathname.includes('black')==true) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1 &&  window.location.pathname.includes("white")==true)) {
    return false
  }
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'
    socket.emit('move',move)
  updateStatus()
}

socket.on('newMove',(move)=>{
    game.move(move);
    board.position(game.fen())
    updateStatus()
})
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }else if(!gamehasStarted){
    status = 'Game has not started yet,waiting for opponent to join'
  }
else if(gameover){
    status = 'Game over, opponent disconnected'
}
  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
}
board = Chessboard('board1', config)
if (playercolor =='black') {
    board.flip();
}
updateStatus();
var urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('code')=='') {
 console.log('invalid code')
}
if (urlParams.get('code')!=" ") {
    console.log('jgrecv')
    socket.emit('joinGame', {
        code: urlParams.get('code')
    });
} 
socket.on('startGame', function() {
    gamehasStarted = true;
    updateStatus()
});
socket.on('gameOverDisconnect', function() {
    gameOver = true;
    updateStatus()
});

function createMessageElement(messageText, username, postTime) {
  // Create the main article element
  const article = document.createElement('article');
  article.className = 'msg-container msg-remote';
  article.id = 'msg-0';

  // Create the msg-box div
  const msgBox = document.createElement('div');
  msgBox.className = 'msg-box';

  // Create the user image
  const userImg = document.createElement('img');
  userImg.className = 'user-img';
  userImg.id = 'user-0';
  userImg.src = '//gravatar.com/avatar/00034587632094500000000000000000?d=retro';

  // Create the flr div
  const flr = document.createElement('div');
  flr.className = 'flr';

  // Create the messages div
  const messagesDiv = document.createElement('div');
  messagesDiv.className = 'messages';

  // Create the paragraph for the message
  const messageP = document.createElement('p');
  messageP.className = 'msg';
  messageP.id = 'msger';
  messageP.textContent = messageText;

  // Append the message to the messages div
  messagesDiv.appendChild(messageP);

  // Create the timestamp span
  const timestampSpan = document.createElement('span');
  timestampSpan.className = 'timestamp';

  // Create the username span
  const usernameSpan = document.createElement('span');
  usernameSpan.className = 'username';
  usernameSpan.textContent = username;

  // Create the posttime span
  const posttimeSpan = document.createElement('span');
  posttimeSpan.className = 'posttime';
  posttimeSpan.textContent = postTime;

  // Append username and posttime to timestamp
  timestampSpan.appendChild(usernameSpan);
  timestampSpan.appendChild(document.createTextNode(' • '));
  timestampSpan.appendChild(posttimeSpan);

  // Append messages and timestamp to flr
  flr.appendChild(messagesDiv);
  flr.appendChild(timestampSpan);

  // Append user image and flr to msg-box
  msgBox.appendChild(userImg);
  msgBox.appendChild(flr);

  // Append msg-box to article
  article.appendChild(msgBox);
if(username==socket.id){
  article.classList.add('msg-self')
 }
 else{
  article.classList.add('msg-remote')
 }
  return article;
}


function sendmessage(){
  var field=document.querySelector("#field").value;
    messages.push(field)
    socket.emit("new_msg",field)
   document.querySelector("#field").value=""
}



socket.on('msg-received', function(message) {
  messages.push(message)
  console.log(messages)
  const list = document.querySelector('.chat-window');
  const messageContainer = document.getElementById('message-container');
  let newmsg=createMessageElement(message.message,message.sender,'4 minutes ago')
      list.appendChild(newmsg)
 });
updateStatus()
