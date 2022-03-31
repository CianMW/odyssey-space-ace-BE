import { createServer } from "http";
import { Server } from "socket.io";
import app  from "./app.js";
process.env.TS_NODE_DEV && require("dotenv").config()

const httpServer = createServer(app);
//above a http server is created based on the express configuration in ./app

// We are creating a io server based on our HTTP server
const io = new Server(httpServer, { transports: ['websocket']});
let inGameUsers = []
// event handlers
io.on("connection", (socket) => {
    console.log("This is the socket ID " + socket.id)
    console.log("currently connected users list", inGameUsers)

    socket.on("joinRoom" , (gameId, username) => {

        console.log(`this is the room ${gameId}`)
        if (inGameUsers.filter(user => user.username === username).length <= 0 ) {

            inGameUsers.push({ username: username, socketId: socket.id, room: gameId })
            console.log("currently connected on join", inGameUsers)
            
            socket.join(gameId)
            console.log(socket.rooms)
            socket.to(gameId).emit("newConnection")
        }
    })
    
    // socket.emit("loggedin")
    
    // When we disconnect we remove the user from the online users list
    socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected`)
        inGameUsers = inGameUsers.filter(user => user.socketId !== socket.id)
    })
});

export { httpServer };