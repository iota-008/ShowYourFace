const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

require("dotenv").config();

var allowedOrigins = [
	"https://show-your-face.netlify.app",
	"http://localhost:3000",
];
const io = require("socket.io")(server, {
	cors: {
		origin: function (origin, callback) {
			// bypass the requests with no origin (like curl requests, mobile apps, etc )
			if (!origin) return callback(null, true);

			if (allowedOrigins.indexOf(origin) === -1) {
				var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
		methods: ["GET", "POST"],
	},
});

// app.get("/", (req, res) => console.log("server running"));

io.on("connection", (socket) => {
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded");
	});

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", {
			signal: data.signalData,
			from: data.from,
			name: data.name,
		});
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal);
	});
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`server is running on port ${port}`));
