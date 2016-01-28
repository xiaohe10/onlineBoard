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
