const express = require('express');
const app = express();
require('dotenv').config();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
	res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
	socket.on('join-room', (roomId, userId) => {
		socket.join(roomId);
		socket.broadcast.to(roomId).emit('user-connected', userId);

		socket.on('message', (message) => {
			io.to(roomId).emit('createMessage', message);
		});

		socket.on('disconnect', () => {
			socket.broadcast.to(roomId).emit('user-disconnected', userId);
		});
	});
});

server.listen(process.env.PORT || 3030, () => {
	console.log(`On ${process.env.PORT}`);
});
