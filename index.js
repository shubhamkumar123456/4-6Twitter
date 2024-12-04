const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 8080;
const cors = require('cors')
const connection = require('./db')
connection()




const userRouter = require('./routes/userRoutes')
const postRouter = require('./routes/postRoutes')
const messageRouter = require('./routes/message')


app.use(cors())

let user = new Map();

function addUser(userId, socketId) {
    if (!user.has(userId)) {
        user.set(userId, socketId);
    }
    return user;
}

function removeUser(socketId) {
    for (const [userId, id] of user.entries()) {
        if (id === socketId) {
            user.delete(userId);
            break;
        }
    }
}

io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);

    socket.on('addUser', (userId) => {
        console.log("User joined with ID: ", userId);
        addUser(userId, socket.id);
        console.log("Current users: ", Array.from(user.entries()));
    });

    socket.on('sendMessage', ({ text, sender, reciever }) => {
        console.log(`Message: ${text}, Sender: ${sender}, Receiver: ${reciever}`);
        if (user.has(reciever)) {
            const socketId = user.get(reciever);
            io.to(socketId).emit('getMessage', { sender, text });
        }
    });

    socket.on('disconnect', () => {
        console.log("User disconnected: ", socket.id);
        removeUser(socket.id);
        console.log("Updated user map: ", Array.from(user.entries()));
    });
});




app.set('view engine', 'ejs')

app.use(express.json({ limit: "200mb" })) //middle ware
app.get('/', (req, res) => {
    res.send('welcome page')
})

app.use('/users', userRouter)
app.use('/posts', postRouter)
app.use('/message', messageRouter)

server.listen(port, () => {
    console.log(`server is running on port ${port}`)
})