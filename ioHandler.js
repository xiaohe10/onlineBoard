/**
 * Created by xiaohe on 16/1/8.
 */
var db = require('./db.js')

var applyNewRoom = function(){

}
var bind = function(io){
    io.on('connection', function(socket){
        //socket.on('say to someone', function(id, msg){
        //    socket.broadcast.to(id).emit('my message', msg);
        //});
        console.log('Client connected!');
        socket.on('join', function(data) {
            var username = data['username'];
            var roomname = data['room'];
            console.log(username,'join room',roomname);
            socket.join(roomname);
            socket.room = roomname;
            socket.username = username;
            var timer = 0;
            db.Room.findOne({'name':roomname},'name users timer',function(err,room){
                if (err) return handleError(err);
                if(room != null){
                    if(room.users.indexOf(username) < 0){
                        room.users.push(username)
                        room.save(function(err,r){
                            if(err) console.log(err);
                        })
                    }
                }else{
                    room = new db.Room({
                        'name':roomname,
                        'users':[username]
                    });
                    room.save(function(err,r){
                        if(err) console.log(err);
                    });
                }
                console.log(room)
                timer  = room.timer;

                // give all data
                db.Point.find({room:room._id},'',function(err,points){
                    if(err) return handleError(err);
                    var path = []
                    var paths = []
                    for(pIndex in points){
                        p = points[pIndex];
                        delete p._id;
                        delete p.room
                        if(p['action'] == 'down'){
                            path = []
                            path.push(p);
                        }else if (p['action'] == 'up'){
                            path.push(p);
                            paths.push(path);
                        }else if (p['action'] == 'move'){
                            path.push(p);
                        }
                    }
                    console.log('room timer',timer);
                    io.to(roomname).emit('pullall', {'paths':paths,'timer':timer});
                });
            });
        });
        socket.on('push',function(data) {
            var username = data['username'];
            var roomname = data['room'];
            db.Room.findOne({'name':roomname},'name users',function(err,room) {
                if (err) return handleError(err);
                if (room != null) {
                    socket.broadcast.to(roomname).emit('pull', data['path']);
                    points = [];
                    for(pointIndex in data['path']){
                        point = data['path'][pointIndex];
                        point['room'] = room._id
                        pointData = new db.Point(point);
                        pointData.save(function(err,r){
                            if(err) console.log(err);
                        })
                    }
                }
            });

        });

        socket.on('clear',function(data){
            var username = data['username'];
            var roomname = data['room'];
            db.Room.findOne({'name':roomname},'name users',function(err,room) {
                console.log('remove',room._id);
                db.Point.find({'room':room._id},'',function(err,points){
                    for(pindex in points){
                        p = points[pindex];
                        p.remove()
                    }
                })
            });
            socket.broadcast.to(roomname).emit('clear', 'clearboard');
        });

        socket.on('startTick',function(data){
            roomname = data['roomname'];
            db.Room.findOne({'name':roomname},'name users timer',function(err,room){
                if(err) console.log(err);

                if(room.users.length>=2) {
                    room.startTime = new Date();
                    room.save(function (err, r) {
                        if (err) console.log(err);
                        console.log(room.startTime);
                        io.to(roomname).emit('startTick','success');
                    })
                }else{
                    console.log('tick wait');
                    io.to(roomname).emit('startTick','wait');
                }
            });
        });
        socket.on('pauseTick',function(data){
            roomname = data['roomname'];
            console.log(roomname)
            db.Room.findOne({'name':roomname},'name users timer',function(err,room){
                if(err) console.log(err);
                if(room.users.length>=2) {
                    if (room.startTime != null) {
                        var thisTime = (new Date()) - room.startTime;
                        room.timer = room.timer + thisTime;
                        room.startTime = null;
                        room.save(function (err, r) {
                            if (err) console.log(err);
                            io.to(roomname).emit('pauseTick', 'success');
                        })
                    }
                }else{
                    io.to(roomname).emit('startTick','wait');
                }
            });
        })
        socket.on('finishLesson',function(){
            console.log(socket.username,'finish lesson',socket.room);
            roomname = socket.room;
            username = socket.username;
            db.Room.findOne({'name':roomname},'name users timer startTime',function(err,room){
                if(room.users.length >= 2) {
                    console.log(room.users,room.startTime);
                    if (room.startTime != null) {
                        var thisTime = (new Date()) - room.startTime;
                        console.log('thistime',thisTime);
                        room.timer = room.timer + thisTime;
                        room.startTime = null;
                    }
                }
                room.save(function (err, r) {
                    if (err) console.log(err);
                    io.to(roomname).emit('finishLesson', room.timer);
                })
            })
        });
        socket.on('pauseTick',function(){
            console.log(socket.username,'pause time of room',socket.room);
            roomname = socket.room;
            username = socket.username;
            db.Room.findOne({'name':roomname},'name users timer startTime',function(err,room){
                if(room.users.length >= 2) {
                    console.log(room.users,room.startTime);
                    if (room.startTime != null) {
                        var thisTime = (new Date()) - room.startTime;
                        console.log('thistime',thisTime);
                        room.timer = room.timer + thisTime;
                        room.startTime = null;
                    }
                }
                room.save(function (err, r) {
                    if (err) console.log(err);
                    io.to(roomname).emit('pauseroom', 'wait');
                })
            })
        });
        socket.on('disconnect',function(){
            console.log(socket.username,'left room',socket.room);
            roomname = socket.room;
            username = socket.username;
            db.Room.findOne({'name':roomname},'name users timer startTime',function(err,room){
                if(err){
                    return;
                }
                if(!room){
                    return;
                }
                if(room.users.length >= 2) {
                    console.log(room.users,room.startTime);
                    if (room.startTime != null) {
                        var thisTime = (new Date()) - room.startTime;
                        console.log('thistime',thisTime);
                        room.timer = room.timer + thisTime;
                        room.startTime = null;
                    }
                }
                var index = room.users.indexOf(username)
                if (index > -1) {
                    room.users.splice(index, 1);
                }
                console.log('room',room);
                room.save(function (err, r) {
                    if (err) console.log(err);
                    io.to(roomname).emit('leftroom', 'wait');
                })
            })
        })
    });

}
module.exports = bind;
