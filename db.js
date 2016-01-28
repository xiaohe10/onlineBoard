/**
 * Created by xiaohe on 16/1/14.
 */
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/onlineboard');//；连接数据库
var Schema = mongoose.Schema;   //  创建模型
var pointScheMa = new Schema({
    x:Number,
    y:Number,
    color:String,
    action:String,
    tool:String,
    radius:String,
    brushcolor:Number,
    room:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'room'
    }
});

var roomScheMa = new Schema({
    name:String,
    users: [String],
    createTime:{ type : Date, default: Date.now },
    timer:{type:Number,default:0}, // second
    startTime:{ type : Date, default: null },
    state:{ type : String, default: 'waiting' } // 'waiting','being','ended'
}); //  定义了一个新的模型，但是此模式还未和users集合有关联
exports.Point = db.model('point', pointScheMa); //  与users集合关联
exports.Room = db.model('room', roomScheMa); //  与users集合关联
