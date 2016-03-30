var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var url = require("url");
var port = 8000;

// routes
function handler (req, res) {
    var template_path = '/';
	if (req.method === 'GET' && req.url === '/') {
   		template_path = '/temp/main.html';
	}
	else if (req.method === 'GET' && req.url === '/hudong') {
        if(rooms.length == maxRoom){
            template_path = '/temp/fullServers.html';
        }else{ template_path = '/temp/client.html'; }
	}
	else if( req.method === 'GET' && req.url.match('/enter') ){
		// the second client enter the room by qrcode
        template_path = '/temp/client2.html';
	}
	else if(req.method === 'GET' && req.url === '/qrcode.min.js'){
        template_path = '/js/qrcode.min.js';
	}
	else if( req.method === 'GET' && req.url === '/server.js' ){
        template_path = '/js/server.js';
	}
	else if( req.method === 'GET' && req.url === '/danmu' ){
        template_path = '/temp/danmu.html';
	}
	else if( req.method === 'GET' && req.url === '/pinglun' ){
        template_path = '/temp/pinglun.html';
	}
	else{
        template_path = '/temp/notFound.html';
    }
    fs.readFile(__dirname + template_path,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ' + template_path);
            }
            res.writeHead(200);
            res.end(data);
        }
    );
}

// server based on socket io
var maxRoom = 20; // max room number
var rooms = []; // room array
var maxConnect = 3; // max connection per room

io.on('connection', function (socket) {

	console.log('User connected, room num:' + rooms.length);
  	socket.on('disconnect', function () {
		// delete socket or room
		for(var i=0;i<rooms.length;i++){
			for(var j=0;j<rooms[i].connected.length;j++){
				if( rooms[i].connected[j] == socket ){
					rooms[i].connected.splice(j, 1);
					if( rooms[i].connected.length == 0 ){
						rooms.splice(i,1);
						break;
					}
				}
			}
		}
    	console.log('User disconnected');
  	});

	// clients register room
	socket.on('registerRoom', function (data) {
		// add socket and room
		var exist = false, room_length = rooms.length, i = 0;
		if( room_length <= maxRoom){
			for(;i < room_length; i++){
				if(rooms[i].id == data.room_id && rooms[i].connected.length < maxConnect){
					rooms[i].connected.push(socket);
					exist = true;
				}
			}
			if(room_length < maxRoom && !exist){
				rooms.push({id: data.room_id, connected: [socket]});
			}
		}else{
            // server is full
        }
  	});
	// server listen messages
	socket.on('msg', function(data){
		var i = 0, room_length = rooms.length;
		for(;i < room_length; i++){
			var rcl = rooms[i].connected.length;
			if(rooms[i].id == data.room_id && rcl <= maxConnect && rcl >= 2){
                for(var j = 0; j < rcl; j++){
                    rooms[i].connected[j].emit('userAction', {msg: data.msg});
                }
			}
		}
	});
});

// start the server
app.listen(port, function() {
	console.log('listening on *:' + port);
});