/**
 * Created by xiaohe on 16/1/1.
 */

var timer;
var alertTimer;
var minute;
var second;
var drawTool;

function startTick(){
    if(isLessoning == false) {
        socket.emit('startTick', {'roomname': roomID});
    }else{
        socket.emit('pauseTick', {'roomname': roomID});
    }

}

function finishLesson(){
    socket.emit('finishLesson',{'roomname':roomID});
}
var zoomlist = [0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,2,2.5,3.0];
var currentzoom = 8;
function bigger(){
    console.log("bigger");
    currentzoom ++;
    if(currentzoom >= 20){currentzoom = 19;}
    drawTool.zoom(zoomlist[currentzoom]);
}
function smaller(){
    console.log("smaller");
    currentzoom --;
    if(currentzoom <= 0){currentzoom = 0;}
    drawTool.zoom(zoomlist[currentzoom]);
}
var ismoving = false;
function movecanvas(){
    if(!ismoving){
        ismoving = true;
        $("#canvas-wrapper").mousedown(function(e){
            var startX = e.pageX;
            var startY = e.pageY;

            $(this).mousemove(function(e) {
                // var offsetX = e.pageX - startX;
                // var offsetY = e.pageY - startY;
                // console.log("offset",offsetX,offsetY);
                return false;
            });

            $(this).one('mouseup', function(e) {
                var offsetX = e.pageX - startX;
                var offsetY = e.pageY - startY;
                console.log("offset",offsetX,offsetY);
                // drawTool.moveshape(offsetX,offsetY);
                $().unbind();
            });

            // Only if you want to prevent text selection
            return false;
        })
    }else{
        ismoving = false;
        $("#canvas1").unbind();
    }
}

function setTool(tooltype){
    drawTool.setType(tooltype);
    drawTool.updateDrawingState();
    $("#toolselecticon").attr("src","/images/"+tooltype+".png")
}
function clearBoard(tooltype){
    socket.emit('clear',{'room':roomID,'username':username});
    drawTool.clear();
    drawTool.updateDrawingState();
}
function setSize(size){
    drawTool.setSize(size);
    drawTool.updateDrawingState();
    if(size == 3){
        $("#sizeselecticon").attr("class","round-wrapper-1")
    }else if(size == 5){
        $("#sizeselecticon").attr("class","round-wrapper-2")
    }else if(size == 8){
        $("#sizeselecticon").attr("class","round-wrapper-3")
    }else if(size == 12){
        $("#sizeselecticon").attr("class","round-wrapper-4")
    }
}
function setColor(color){
    $("#colorselect").attr("class","color color-"+color);
    if(color == 1) {
        drawTool.setColor("rgba(0,0,0,1)");
    }
    else if(color == 2) {
        drawTool.setColor("rgba(68,162,211,1)");
    }else if(color == 3) {
        drawTool.setColor("rgba(244,53,43,1)");
    }else if(color == 4) {
        drawTool.setColor("rgba(255,194,89,1)");
    }else if(color == 5) {
        drawTool.setColor("rgba(74,196,110,1)");
    }
    drawTool.setBrushColor(color - 1);
    drawTool.updateDrawingState();

}
function uploadImage(){
    $("#image-wrapper").css("display","block");
}
function deleteImage(){
    $("#image-wrapper").css("display","none");
    a = "donni_xiaohe"
    a.startsWith()
}
function redraw(){
    drawTool.clear()
    drawTool.redraw();
}
function showAlert(message,type){
    $("#messageAlert").css("display","block");
    $("#messageContent").text(message);
    clearInterval(alertTimer);
    alertTimer = setInterval(function(){
        $("#messageAlert").css("display","none");
    },2000)
}
function hideAlert(){
    $("#messageAlert").css("display","none");
}
