const express = require("express")
const app = express()
const userRoutes = require('./routes/userRoutes') 
const rooms = ['general', 'tech', 'finance', 'crypto']

const cors = require('cors')
const { Socket } = require("socket.io")
const Message = require("./models/Message")

app.use(express.urlencoded({extended : true}))

app.use(express.json());
app.use(cors());


app.use('/users', userRoutes)
require('./connection')

const server = require('http').createServer(app);
const PORT = 5001;

const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        METHODS : ['GET','POST']
    }
})



app.get('/rooms', (req, res) => {
    res.json(rooms)
})

   async function getLastMessagesFromRoom(room) {
    let  roomMessages = await Message.aggregate([
        {$match : {to: room}},
        {$group : {_id : '$date', messagesByDates : {$push: '$$ROOT'}}}
    ])
    return roomMessages;
}


function sortRoomMessagesByDate(messages){

        return messages.sort(function(a,b){
            let date1 = a._id.split('/');
            let date2 = b._id.split('/');
            date1 = date1[2] + date1[0] + date1[1]
            date2 = date2[2] + date2[0] + date2[1]

            return date1 < date2 ? -1 : 1        })

}

io.on('connection', (Socket) => {

    Socket.on('new-user', async () => {
        const members = await User.find();
        io.emit('new-user')
    })
    Socket.on('join-room', async(room) =>{
        Socket.join(room);
        let roomMessages = await getLastMessagesFromRoom(room);
          roomMessages = sortRoomMessagesByDate(roomMessages);
          Socket.emit('room-messages', roomMessages)
    })
})

server.listen(PORT,()=>{
    console.log("listening on port http://localhost:5001")
})

