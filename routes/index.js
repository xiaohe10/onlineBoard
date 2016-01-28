var express = require('express');
var router = express.Router();
var db = require('../db.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/applyRoom',function(req,res){
    db.Room.find().sort({_id:-1}).exec(function(err,rooms){
        console.log('name',parseInt(rooms[0].name)+1);
        res.send(parseInt(rooms[0].name)+1+'');
    })
})

router.use('/:room/:name', function(req, res){
    res.render('index', {'room':req.params['room'],'name':req.params['name']});
});

router.use('/getRoom/:name1/:name2', function(req, res){
    res.render('index', {'room':req.params['room'],'name':req.params['name']});
});
module.exports = router;
