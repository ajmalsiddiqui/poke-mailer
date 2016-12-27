let nerds = require('nerds');
const readline = require('readline');
const eventEmitter = require('events');
const nodemailer = require('nodemailer');
const moment = require('moment');

const pokebook = require('./pokebook');

let poke1 = [];
let poke2 = [];

let c = 0;

//use an array of promises and promise.all

let mailOptions1 = {
    from: '"PokeLord 👥" <ajmalsiddiqui414@gmail.com>',
    subject: 'Your Pokemon'
};

let mailOptions2 = {
  from: '"PokeLord 👥" <ajmalsiddiqui414@gmail.com>',
  subject: 'Your Pokemon'
};

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'ajmalsiddiqui414@gmail.com',
    pass: 'alfasierra'
  }
});

class MyEmitter extends eventEmitter {}

const myEmitter = new MyEmitter();

myEmitter.on('add', (pokemon1, pokemon2, i) => {
  console.log('Pokemon generated!');
  poke1[i] = pokemon1;
  poke2[i] = pokemon2;
  mailOptions1.text = "You got " + pokemon1.name + " which has HP " + pokemon1.hp;
  mailOptions2.text = "You got " + pokemon2.name + " which has HP " + pokemon2.hp;
  sendmail(1);
});

myEmitter.on('done', (arr1, arr2) => {
  console.log("Battle complete. Sending results...");
  let h1=0;
  let h2=0;
  mailOptions1.subject = "Battle Result";
  mailOptions2.subject = "Battle Result";
  for(i=0; i<5; i++){
    h1 += poke1[i].hp;
    h2 += poke2[i].hp;
  }
  if(h1>h2){
    pokebook.log({'player1': mailOptions1.to, 'player2': mailOptions2.to, 'winner': mailOptions1.to, 'loser': mailOptions2.to, 'time': new Date()});
    mailOptions1.text = "You win!!!";
    mailOptions2.text = "Sorry, you lose.";
  }
  else if(h2>h1){
    pokebook.log({'player1': mailOptions1.to, 'player2': mailOptions2.to, 'winner': mailOptions2.to, 'loser': mailOptions1.to, 'time': new Date()});
    mailOptions1.text = "Sorry, you lose.";
    mailOptions2.text = "You win!!!";
  }
  else{
    pokebook.log({'player1': mailOptions1.to, 'player2': mailOptions2.to, 'winner': 'none', 'loser': 'none', 'time': new Date()});
    mailOptions1.text = "It was a draw!";
    mailOptions2.text = "It was a draw!";
  }
  setTimeout(() => {
    sendmail(1);
  }, 2000);
});

myEmitter.on('prevResult', () => {
  pokebook.getResult(mailOptions1.to, (result) => {
    mailOptions1.subject = "Previous Battle Results";
    if(result.winner===mailOptions1.to){
      mailOptions1.text = "You won last time.";
    }
    else if(result.winner==='none'){
      mailOptions1.text = "It was a draw last time.";
    }
    else{
      mailOptions1.text = "You lost last time.";
    }
    sendmail(null);
  });
});

let pokeGen = () => {
  if(poke1.length===5){
    myEmitter.emit('done', poke1, poke2);
    return;
  }
  setTimeout(() => {
    if(c<5){
      var gen = nerds.resolve('Pokemon', 2).include(['name', 'hp']).asArray();
      myEmitter.emit('add', gen[0], gen[1], c);
      c+=1;
      pokeGen();
    }
    else{
      return;
    }
  }, 5000);
}

function sendmail(c){
  if(c){
    transporter.sendMail(mailOptions1, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
  });
  transporter.sendMail(mailOptions2, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
    });
  }
  else{
    transporter.sendMail(mailOptions1, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
  });
  }
}

function getEmails(){
    if(process.argv[3]){
      mailOptions1.to = process.argv[2];
      mailOptions2.to = process.argv[3];
      pokeGen();
    }
    else{
      mailOptions1.to = process.argv[2];
      myEmitter.emit('prevResult');
    }

}

getEmails();

//nmtestone1@gmail.com, nmtesttwo2@gmail.com; pass: test@123
