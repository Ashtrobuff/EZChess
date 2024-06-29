import express from "express";
import { Server } from 'socket.io'
import {createServer} from 'http'
import cors from 'cors'
import { measureMemory } from "vm";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); 
const app=express();
const server= createServer(app)
var games=[]
const io = new Server(server,{
    cors:{
        origin:"*",
        methods:['GET','POST'],
        credentials:true,
    }
})  ;
app.use(cors());
app.use(express.static("public"));
app.set('view engine', 'ejs')
io.on( "connection", ( socket ) => {
    let currentCode = '';
    console.log("a user connected");
    console.log(socket.id);
    socket.on('joinGame',(data)=>{ 
        currentCode = data.code;
        socket.join(currentCode);
        console.log('code recived')
        if (!games[currentCode]) {
            games[currentCode] = true;
            return;
        }
        io.to(currentCode).emit('startGame');
    })
    socket.on('move', function(move) {
        console.log('move detected')

        io.to(currentCode).emit('newMove', move);
    });
    socket.on('new_msg',(message)=>{
        console.log(message)
        io.to(currentCode).emit("msg-received",{message:message,sender:socket.id});
    })
    socket.on('disconnect', function() {
        console.log('socket disconnected');
    
        if (currentCode) {
            io.to(currentCode).emit('gameOverDisconnect');
            delete games[currentCode];
        }
    });
    
});
    
app.get('/', (req, res) => {
    res.render('index',{
        color:"black"
    })
});

app.get('/chat', (req, res) => {
    res.render('chat',{
        color:"black"
    })
});

app.get('/white', (req, res) => {
    res.render('outer',{
        color:'white'
    })
});
app.get('/black', (req, res) => {
    if (!games[req.query.code]) {
        return res.redirect('/?error=invalidCode');
    }
    res.render('outer',{
        color:'black'
    })
});

server.listen(3001,()=>{
    console.log("server is running at port 3001")
});
