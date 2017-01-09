let mongodb = require('mongodb');
const moment = require('moment');


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
            var reqt = moment.max(timeList).toDate();
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
  'log': log,
  'getResult': getResult
}
