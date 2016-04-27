/**
 * Created by yufengzhang210851 on 2016/3/25.
 *
 * 多屏互动-客户端-js部分
 */
(function(){
    var w = window;
    var d = document;
    var wrapper = d.getElementById("wrapper");

    var req = new XMLHttpRequest();
    req.open('GET', document.location, false);
    req.send(null);
    var _IP = req.getResponseHeader("CIP");
    var ip = _IP.split(':')[0],pt = _IP.split(':')[1];
    console.log(ip);
    console.log(pt);
    var host = 'ws://' + ip + ':';
    var port = pt || 8080;
    var url = 'http://' + ip;


    w.Interact = {
        host: host,
        port: port,
        url: url,
        // 连接房间
        registerRoom: function (rid) {
            var _this = this;
            //告诉服务器，客户端要进入的房间号
            this.socket.emit('registerRoom', { room_id: rid });
            // 创建房间的二维码
            if(w.location.pathname != '/enter'){
                var qrcode = new QRCode(document.getElementById("qrcode"), {
                    text: _this.url + ":" + _this.port + "/enter?roomid=" + _this.roomID,
                    width: 128,
                    height: 128,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            }
        },
        // 断开连接
        unregisterRoom: function (){

        },
        init: function(){
            // 创建一个房间号
            if(w.location.pathname == '/enter'){
                // 加入的伙伴
                this.roomID = w.location.search.split('=')[1];
            }
            else{ this.roomID = (new Date().getTime()); }

            // 实例化一个socket
            this.socket = io( this.host + this.port );

            var _this = this;
            // 向服务器注册一个房间
            _this.registerRoom(_this.roomID);
            // 监听用户加入的消息
            _this.onUserEnter();
            // 监听用户的行为
            _this.onUserAction();
        },
        // 监听用户进入
        onUserEnter: function () {

        },
        // 监听用户动作
        onUserAction: function() {
            var _this = this;
            var move = d.getElementById('move');
            var connect = d.getElementById('connect');
            var _left = 0;
            _this.socket.on('userAction', function(data){
                _left += parseInt(data.msg);
                if (connect) {
                    d.getElementById('connect').style.left = _left + 'px';
                    d.getElementById('connect').style.top = _left + 'px';
                }
                if (move) {
                    d.getElementById('move').style.left = _left + 'px';
                    d.getElementById('move').style.top = _left + 'px';
                }
            });
            if(move){
                move.addEventListener('click', function (e) {
                    _this.socket.emit('msg', {room_id: _this.roomID, msg: 10});
                },false);
            }
            if(connect){
                connect.addEventListener('click', function (e) {
                    _this.socket.emit('msg', {room_id: _this.roomID, msg: 10});
                },false);
            }
        }
    };
    w.Interact.init();
}());
