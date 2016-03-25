var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var url = require("url");
var port = 8000;

function handler (req, res) {
	if (req.method === 'GET' && req.url === '/') {
		fs.readFile(__dirname + '/client.html',
			function (err, data) {
	    		if (err) {
		      		res.writeHead(500);
		      		return res.end('Error loading client.html');
		   		}
				res.writeHead(200);
		    	res.end(data);
		  	}
		);
	}
	else if( req.method === 'GET' && req.url.match('/enter') ){
		// 扫码的伙伴进入房间
		var params = [];
		params = url.parse(req.url,true).query;
		fs.readFile(__dirname + '/client2.html',
			function (err, data) {
	    		if (err) {
		      		res.writeHead(500);
		      		return res.end('Error loading client.html');
		   		}
				res.writeHead(200);
		    	res.end(data);

				for(var i=0;i<rooms.length;i++){
					if(rooms[i].id == params.roomid){

					}
				}
		  	}
		);
	}
	else if(req.method === 'GET' && req.url === '/qrcode.min.js'){
		fs.readFile(__dirname + '/qrcode.min.js',
			function (err, data) {
	    		if (err) {
		      		res.writeHead(500);
		      		return res.end('Error loading qrcode');
		   		}
				res.writeHead(200);
		    	res.end(data);
		  	}
		);
	}
	else if( req.method === 'GET' && req.url === '/server.js' ){
		fs.readFile(__dirname + '/server.js',
			function (err, data) {
	    		if (err) {
		      		res.writeHead(500);
		      		return res.end('Error loading server.js');
		   		}
				res.writeHead(200);
		    	res.end(data);
		  	}
		);
	}
	else{}
}

// server based on socket io

var maxRoom = 2; // 最大房间数
var rooms = []; // 房间
var maxConnect = 2; //房间容量

io.on('connection', function (socket) {

	console.log('User connected');
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
		var exist = false;
		for(var i=0;i<rooms.length;i++){
			if(rooms[i].id == data.room_id && rooms[i].connected.length < maxConnect){
				rooms[i].connected.push(socket);
				exist = true;
			}
		}
		if(rooms.length < maxRoom && !exist){
			rooms.push({id: data.room_id, connected: [socket]});
		}
  	});
	// server listen messages
	socket.on('msg', function(data){
		for(var i=0;i<rooms.length;i++){
			if(rooms[i].id == data.room_id && rooms[i].connected.length == 2){
				rooms[i].connected[0].emit('userAction', {msg: data.msg});
				rooms[i].connected[1].emit('userAction', {msg: data.msg});
			}
		}
		console.log(data);
	});
});

// 启动服务
app.listen(port, function() {
	console.log('listening on *:' + port);
});