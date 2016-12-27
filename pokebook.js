let mongodb = require('mongodb');
const moment = require('moment');
const eventEmitter = require('events');

let MongoClient = mongodb.MongoClient;

class MyEmitter extends eventEmitter {}

const myEmitter = new MyEmitter();

const url = 'mongodb://localhost:27017/PokeBook';

myEmitter.on('full', (player, arr, db) => {
  var reqt = moment.max(arr).toDate();
  //console.log(reqt);
  db.collection('PokeBook').count().then((res) => {console.log(res);});
  var result = db.collection('PokeBook').find({'player1': player, 'time': reqt}).forEach((doc) => {
    //console.log(doc);
  });
});

function init(){
  MongoClient.connect(url, (err, db) => {
    if(err){
      console.log(err);
    }
    else{
      console.log("Successfully connected to the PokeBook!");
      db.collection('PokeBook').deleteMany();
      db.close();
    }
  });
}

function log(data){
  MongoClient.connect(url, (err, db) => {
    if(err){
      console.log(err);
    }
    else{
      db.collection('PokeBook').insert(data);
      db.close();
    }
  });
}

function getResult(player, callback){
  let fn = typeof callback==='function'? callback : new Function(callback);
  let timeList = [];
  MongoClient.connect(url, (err, db) => {
    if(err){
      console.log(err);
    }
    else{
      let count = db.collection('PokeBook').count({
        $or: [{'player1': player}, {'player2': player}]
      }); //count function returns a promise
      count.then((val) => {
        db.collection('PokeBook').find({
          $or: [{'player1': player}, {'player2': player}]
        }).forEach((doc) => {
          timeList.push(moment(doc.time));
          console.log(doc.time);
          if(val===timeList.length){
            console.log('full emitted');
            //console.log(arr);
            var reqt = moment.max(timeList).toDate();
            console.log(reqt);
            var result = db.collection('PokeBook').find({
              $or: [{'player1': player}, {'player2': player}], 'time': reqt
            }).forEach((doc) => {
              fn(doc);
              db.close();
            });
          }
        });
      });
    }
  });
}

module.exports = {
  'init': init,
  'log': log,
  'getResult': getResult
}
