/**
 * Created by xiaohe on 16/1/1.
 */
//var drawEnv = {
//    "wrapper":$("#canvas-wrapper"),
//    "offsetX":0,
//    "offsetY":0,
//    "radius":5,
//    "lastpoint":null,
//    "baseDiv":null
//
var pullall = true;
var isLessoning = false;
var DrawTool;
defineDrawTool = function() {
    var Trig = {
        distanceBetween2Points: function (point1, point2) {

            var dx = point2.x - point1.x;
            var dy = point2.y - point1.y;
            return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        },

        angleBetween2Points: function (point1, point2) {

            var dx = point2.x - point1.x;
            var dy = point2.y - point1.y;
            return Math.atan2(dx, dy);
        }
    }
    socket.on('finishLesson',function(data){
        console.log("finisheLesson",data);
        clearInterval(timer);
        $("#startTick").text("开始讲课");
        isLessoning = false;
        window.location.href = "http://wechat.zuoyekong.com/lesson/end?room_ID="+roomID+"&alltime="+data;

    })
    socket.on('pull', function (data) {
        console.log("pull")
        console.log(drawTool.state)
        //for(pathindex in data){
        drawTool.remotecache.push(data);
       console.log(data);
        //}

        if (drawTool.state == "waiting") {
            drawTool.drawpath(drawTool.remotecache);
            drawTool.remotecache = [];
        }
        //drawTool.drawpath
    });
    socket.on('clear', function (data) {
        drawTool.clear();
    });
    socket.on('leftroom', function (data) {
        if (data == 'wait') {
            showAlert('老师/学生离开教室，计时暂停', 'warning')
            clearInterval(timer);
            return;
        }
    });
    socket.on('pauseroom', function (data) {
        if (data == 'wait') {
            showAlert('计时暂停', 'warning')
            clearInterval(timer);
            $("#startTick").text("开始讲课");
            isLessoning = false;
        }
    })

    socket.on('startTick', function (data) {
        if (data == 'wait') {
            showAlert('请等待老师/学生进入课堂', 'warning');
            return;
        }
        showAlert('开始上课', 'success');
        $("#startTick").text("暂停讲课");
        isLessoning = true;
        timer = setInterval(function () {
            second += 1;
            if (second >= 60) {
                minute += 1;
                second = 0;
            }
            if (minute < 10) {
                minuteStr = '0' + minute;
            }
            else {
                minuteStr = '' + minute;
            }
            if (second < 10) {
                secondStr = '0' + second;
            }
            else {
                secondStr = '' + second;
            }
            $("#timeshow").text(minuteStr + ":" + secondStr);
        }, 1000);
    });
    function timerToFormat(t) {
        t /= 1000;
        minute = Math.round(t / 60);
        second = Math.round(t % 60);
        if (minute < 10) {
            minuteStr = '0' + minute;
        }
        else {
            minuteStr = '' + minute;
        }
        if (second < 10) {
            secondStr = '0' + second;
        }
        else {
            secondStr = '' + second;
        }
        $("#timeshow").text(minuteStr + ":" + secondStr);
    }

    socket.on('pullall', function (data) {
        timerToFormat(data['timer'])
        if (!pullall) {
            return;
        }
        pullall = false;
        console.log("pullall")
        console.log(drawTool.state)
        //for(pathindex in data){
        drawTool.remotecache = data['paths'];
        //}

        if (drawTool.state == "waiting") {
            drawTool.drawpath(drawTool.remotecache);
            drawTool.remotecache = [];
        }
        //drawTool.drawpath
    });
    DrawTool = (function () {
        DrawTool.prototype.wrapperName = "#canvas-wrapper";
        DrawTool.prototype.name = "pen";
        DrawTool.prototype.lastpoint = null;
        DrawTool.prototype.radius = 3;
        DrawTool.prototype.offsetX = 0;
        DrawTool.prototype.offsetY = 0;
        DrawTool.prototype.baseDiv = null;
        DrawTool.prototype.ctx = null;
        DrawTool.prototype.color = "rgba(0,0,0,1)";
        DrawTool.prototype.brushcolor = 0;
        DrawTool.prototype.lineCap = "round";
        DrawTool.prototype.lineJoin = "round";
        DrawTool.prototype.drawDown = true;
        DrawTool.prototype.globalCompositeOperation = "source-over"
        DrawTool.prototype.moves = []
        DrawTool.prototype.remotecache = []
        DrawTool.prototype.currentPath = []
        DrawTool.prototype.state = 'drawing';
        DrawTool.prototype.zoomfactor = 1;
        DrawTool.prototype.drawingModel = {
            'name': 'pen',
            'radius': 3,
            'color': "rgba(0,0,0,1)",
            'globalCompositeOperation': "source-over",
            'brushcolor': 0
        }
        DrawTool.prototype.brushes = ['/images/brush1.png', '/images/brush2.png', '/images/brush3.png', '/images/brush4.png', '/images/brush5.png']

        function DrawTool(name, baseDivName) {
            //initial canvas context
            DrawTool.prototype.name = name;     // name of tool e.g. pencil eraser ...
            DrawTool.prototype.wrapper = $(DrawTool.prototype.wrapperName);
            DrawTool.prototype.baseDiv = $(baseDivName); //canvas is on this div
            DrawTool.prototype.resize();
            DrawTool.prototype.ctx = DrawTool.prototype.baseDiv[0].getContext('2d');
            $(window).resize(function () {
                DrawTool.prototype.resize();
            })

            /*
             bind canvas wrapper mouse action to canvas
             maybe more than one canvases
             */
            DrawTool.prototype.bindMouseOrTouch();
        };
        DrawTool.prototype.zoom = function(_zoomfactor){
            DrawTool.prototype.zoomfactor = _zoomfactor;
            DrawTool.prototype.resize();
        };

        DrawTool.prototype.drawBrush = function (startx, starty, endx, endy, radius) {
            var start = {x: startx, y: starty}
            var end = {x: endx, y: endy}
            var distance = parseInt(Trig.distanceBetween2Points(start, end));
            var angle = Trig.angleBetween2Points(start, end);
            var x, y;
            var halfBrushW = radius;
            var halfBrushH = radius;
            for (var z = 0; (z <= distance || z == 0); z++) {

                x = start.x + (Math.sin(angle) * z) - halfBrushW;
                y = start.y + (Math.cos(angle) * z) - halfBrushH;

                $('canvas').drawImage({
                    //source: this.brushes[this.brushcolor],
                    source: $("#brush"+this.brushcolor)[0],
                    x: x, y: y,
                    height: radius * 2,
                    width: radius * 2
                });
            }
        }
        DrawTool.prototype.down = function (x, y) {
            point = {
                "x": x,
                "y": y,
                "action": "down",
                "tool": this.name,
                "radius": this.radius,
                "color": this.color,
                "brushcolor": this.brushcolor
            };
            //console.log('down',x,y)
            if (this.state == "waiting") {
                this.restoreDrawingState();
                this.state = "drawing";
            }
            if (this.state == "drawing" || this.state == "remotedrawing") {
                DrawTool.prototype.currentPath.push(point);
            }
            if (this.drawDown) {
                var radius = this.radius;
                if (this.name == 'eraser' || this.name == "highlighter") {
                    radius = this.radius * 2;
                }
                var color = this.color;
                var globalCompositeOperation = this.globalCompositeOperation;
                $('canvas').draw({
                    fn: function (ctx) {
                        // ctx.scale(2,2);
                        ctx.beginPath();
                        ctx.globalCompositeOperation = globalCompositeOperation;
                        ctx.fillStyle = color;
                        ctx.arc(point.x * DrawTool.prototype.zoomfactor, point.y * DrawTool.prototype.zoomfactor, radius / 2, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.closePath();
                    }
                });
            }
            this.lastpoint = point;
        };
        DrawTool.prototype.move = function (x, y) {
            if(DrawTool.prototype.currentPath.length <=2){
               point = {
                "x": x,
                "y": y,
                "action": "move",
                "tool": this.name,
                "radius": this.radius,
                "color": this.color,
                "brushcolor": this.brushcolor
                };
            }else{
                point = {
                    'x':x,
                    "y":y,
                    "action":"move"
                }
            }
            
            if (this.lastpoint == null) {
                return
            }
            if (this.state == "drawing" || this.state == "remotedrawing") {
                DrawTool.prototype.currentPath.push(point);
            }
            if (point.x != this.lastpoint.x || point.y != this.lastpoint.y) {
                var radius = this.radius;
                if (this.name == 'eraser') {
                    radius = this.radius * 2;
                }
                var color = this.color;
                var from = this.lastpoint;
                var to = point;
                var lineCap = this.lineCap;
                var lineJoin = this.lineJoin;
                var globalCompositeOperation = this.globalCompositeOperation;
                if (this.name == "pen") {
                    this.drawBrush(from.x*DrawTool.prototype.zoomfactor, from.y*DrawTool.prototype.zoomfactor, to.x*DrawTool.prototype.zoomfactor, to.y*DrawTool.prototype.zoomfactor, radius);
                }
                else {
                    $('canvas').draw({
                        fn: function (ctx) {
                            // ctx.scale(2,2);
                            ctx.beginPath();
                            ctx.globalCompositeOperation = globalCompositeOperation;
                            ctx.strokeStyle = color;
                            ctx.lineCap = lineCap;
                            ctx.lineJoin = lineJoin;
                            ctx.lineWidth = radius;
                            ctx.moveTo(from.x * DrawTool.prototype.zoomfactor, from.y*DrawTool.prototype.zoomfactor);
                            ctx.lineTo(to.x*DrawTool.prototype.zoomfactor, to.y*DrawTool.prototype.zoomfactor);
                            ctx.stroke();
                            ctx.closePath();
                        }
                    });
                }
            }
            this.lastpoint = point;
        }
        DrawTool.prototype.up = function (x, y) {
            if (this.lastpoint == null) {
                if (this.state == "drawing") {
                    this.state = "waiting";
                }
                return;
            }
            point = {
                "x": x,
                "y": y,
                "action": "up",
                "tool": this.name,
                "radius": this.radius,
                "color": this.color,
                "brushcolor": this.brushcolor
            };
            DrawTool.prototype.currentPath.push(point);
            if (this.state == "drawing") {
                console.log('currentPath',DrawTool.prototype.currentPath);
                socket.emit('push', {'path': DrawTool.prototype.currentPath, 'room': roomID});
                //check remote cache
                if (this.remotecache != null) {
                    if (this.remotecache.length > 0) {
                        for (pathindex in this.remotecache) {
                            path = this.remotecache[pathindex];
                            this.moves.push(path);
                        }
                        this.drawpath(this.remotecache);
                        this.remotecache = []
                    }
                }
            }
            if (this.state == "drawing" || this.state == "remotedrawing") {
                this.moves.push(DrawTool.prototype.currentPath)
                DrawTool.prototype.currentPath = []
            }
            if (this.state == "drawing") {
                this.state = "waiting";
            }
            this.lastpoint = null;
        };

        DrawTool.prototype.resize = function () {
            this.baseDiv.attr("width", this.wrapper.width() - 5);
            this.baseDiv.attr("height", this.wrapper.height() - 5);
            //this.lastpoint = null;
            if (this.wrapper.width() == $("body").width()) {
                this.offsetX = 0;
                this.offsetY = 60;
            } else {
                this.offsetX = 60;
                this.offsetY = 0;
            }
            $("#imagezone").attr("data-width", this.wrapper.width() - 10)
            $("#imagezone").attr("data-height", this.wrapper.height() - 10)
            $("#imagezone").css("width", this.wrapper.width() - 10)
            $("#imagezone").css("height", this.wrapper.height() - 10)
            this.redraw();
        }
        DrawTool.prototype.bindMouseOrTouch = function () {
            //
            prot = DrawTool.prototype;
            this.wrapper.mousedown(function (e) {
                DrawTool.prototype.down((e.clientX - prot.offsetX )/DrawTool.prototype.zoomfactor, (e.clientY - prot.offsetY)/DrawTool.prototype.zoomfactor)
            });
            this.wrapper.mousemove(function (e) {
                    DrawTool.prototype.move((e.clientX - prot.offsetX)/DrawTool.prototype.zoomfactor, (e.clientY - prot.offsetY)/DrawTool.prototype.zoomfactor)
                }
            );
            this.wrapper.mouseup(function (e) {
                DrawTool.prototype.up((e.clientX - prot.offsetX)/DrawTool.prototype.zoomfactor, (e.clientY - prot.offsetY)/DrawTool.prototype.zoomfactor)
            });
            this.wrapper.mouseleave(function (e) {
                DrawTool.prototype.up((e.clientX - prot.offsetX)/DrawTool.prototype.zoomfactor, (e.clientY - prot.offsetY)/DrawTool.prototype.zoomfactor);
            });

            //$("body").on('vmousedown',function(e){
            //    e.preventDefault();
            //});
            this.wrapper.on('vmousedown', function (e) {
                DrawTool.prototype.down((e.clientX - prot.offsetX)/DrawTool.prototype.zoomfactor, (e.clientY - prot.offsetY)/DrawTool.prototype.zoomfactor);
                e.preventDefault();
            });
            this.wrapper.on('vmousemove', function (e) {
                    DrawTool.prototype.move((e.clientX - prot.offsetX)/DrawTool.prototype.zoomfactor, (e.clientY - prot.offsetY)/DrawTool.prototype.zoomfactor);
                    e.preventDefault();
                }
            );
            this.wrapper.on('vmouseup', function (e) {
                DrawTool.prototype.up((e.clientX - prot.offsetX)/DrawTool.prototype.zoomfactor, (e.clientY - prot.offsetY)/DrawTool.prototype.zoomfactor)
            });
            //this.wrapper.on('vmouseout',function(e){
            //    DrawTool.prototype.up(e.clientX-prot.offsetX, e.clientY-prot.offsetY)
            //});


        }

        DrawTool.prototype.clear = function () {
            this.ctx.clearRect(0, 0, this.wrapper.width(), this.wrapper.height());
            DrawTool.prototype.moves = [];
        };
        DrawTool.prototype.setColor = function (color) {

            DrawTool.prototype.color = color;
            if (this.name == "highlighter") {
                var colorAlpha = this.color.split(",")[3]
                DrawTool.prototype.color = this.color.replace(colorAlpha, "0.3)");
            }
        }
        DrawTool.prototype.setBrushColor = function (color) {
            DrawTool.prototype.brushcolor = color;
        }
        DrawTool.prototype.setSize = function (size) {
            DrawTool.prototype.radius = size;
        }
        DrawTool.prototype.setType = function (toolType) {
            DrawTool.prototype.name = toolType;
            DrawTool.prototype.lineCap = "round";
            DrawTool.prototype.lineJoin = "round";
            DrawTool.prototype.drawDown = true;
            DrawTool.prototype.globalCompositeOperation = "source-over"
            var colorAlpha = this.color.split(",")[3]
            DrawTool.prototype.color = this.color.replace(colorAlpha, "1)");
            if (toolType == "highlighter") {
                var colorAlpha = this.color.split(",")[3]
                DrawTool.prototype.color = this.color.replace(colorAlpha, "0.3)");
                DrawTool.prototype.lineCap = "butt";
                DrawTool.prototype.lineJoin = "butt";
                DrawTool.prototype.drawDown = false;
            }
            else if (toolType == "pencil") {
            }
            else if (toolType == "pen") {
                DrawTool.prototype.drawDown = false;
            }
            else if (toolType == "eraser") {
                DrawTool.prototype.globalCompositeOperation = "destination-out";
            }
        }
        DrawTool.prototype.restoreDrawingState = function () {
            this.name = this.drawingModel.name;
            this.setSize(this.drawingModel.radius);
            this.setColor(this.drawingModel.color);
            this.brushcolor = this.drawingModel.brushcolor;
            this.globalCompositeOperation = this.drawingModel.globalCompositeOperation;
        }
        DrawTool.prototype.updateDrawingState = function () {
            this.drawingModel.name = this.name;
            this.drawingModel.radius = this.radius;
            this.drawingModel.color = this.color;
            this.drawingModel.brushcolor = this.brushcolor;
            this.drawingModel.globalCompositeOperation = this.globalCompositeOperation;
        }
        DrawTool.prototype.drawpath = function (paths) {
            this.state = "remotedrawing"
            for (pathindex in paths) {
                var path = paths[pathindex]
                    firstMove = true;
                console.log(path);
                for (pointindex in path) {
                    var m = path[pointindex]

                   if (m.action == 'down') {
                        this.setColor(m.color);
                        this.setType(m.tool);
                        this.setSize(m.radius);
                        this.setBrushColor(m.brushcolor)
                        this.down(m.x, m.y)
                    }
                   else if (m.action == 'move') {
                        console.log(m)
                        if(firstMove){
                            firstMove=false;
                       try{
                        this.setColor(m.color);
                        this.setType(m.tool);
                        this.setSize(m.radius);
                        this.setBrushColor(m.brushcolor);
           
                        }catch(err){}
                        }
                        this.move(m.x, m.y)
                    }
                    else if (m.action == 'up') {
                        this.up(m.x, m.y);
                    }
                }
            }
            this.state = "waiting"
        }
        DrawTool.prototype.redraw = function () {
            this.state = "redrawing"
            for (key_of_path in this.moves) {
                this.lastpoint = null;
                firstMove = true;
                var path = this.moves[key_of_path]
                for (key_of_point in path) {
                    //console.log(m.x, m.y, m.action,m.tool, m.color, m.radius);
                    var m = path[key_of_point]

                    if (m.action == 'down') {
                        this.setColor(m.color);
                        this.setType(m.tool);
                       this.setSize(m.radius);
                        this.setBrushColor(m.brushcolor);
                        this.down(m.x, m.y)
                    }
                    else if (m.action == 'move') {
                         if(firstMove){
                         firstMove = false;
                        try{
                        this.setColor(m.color);
                        this.setType(m.tool);
                        this.setSize(m.radius);
                        this.setBrushColor(m.brushcolor);
           
                        }catch(err){}
                       
                         }
                       
                        this.move(m.x, m.y)
                    }
                    else {
                        this.lastpoint = null;
                    }
                }
            }
            this.state = "waiting"
        }
        return DrawTool;
    })();
}
