const LOCAL_PASS = require('./passconfig')
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto')
const mysql = require('mysql')
const cors = require('cors');

const app = express();
let user = {};

const connection = mysql.createConnection({
 host: 'localhost',
 user: 'root',
 database: 'usersdatabase',
 password: '213414'
})

let insertMySQLString = 'INSERT INTO USERS(LOGIN, SALT, HASHPASSWORD) VALUES (?, ?, ?)';
let searchUsernameMySQLString = 'SELECT LOGIN FROM USERS';

connection.connect(function(error) {
 if(error) throw error;
})

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
//registration
app.post('/registration',async function(request, response) {
  try {
   let insertDatabase;
   let loginCheckResult = await new Promise(function (resolve, reject) {
    connection.query(searchUsernameMySQLString, function (err, result, fields) {
     for(let i = 0; i < result.length; i++) {
      if(request.body.username === result[i].LOGIN) {
       resolve(false)
      }
     }
     resolve(true);
    });
   });
   user.username = request.body.username;
   user.password = request.body.password;
   if(user.username.includes(' ') || user.password.includes(' ')) {
    return response.status(422).send('В логине и пароле не должно быть пробелов');
   }
   if(user.username.length > 20) {
    return response.status(422).send('Длина логина не более 20 символов');
   }
   if(user.password.length > 20) {
    return response.status(422).send('Длина пароля не более 20 символов');
   }
   let saltString = crypto.randomBytes(8).toString('hex');
   let passwordString = user.password + saltString + LOCAL_PASS.LOCAL_PASS;
   let hashPassword = crypto.createHash('sha256').update(passwordString).digest('hex');
   if(loginCheckResult === true) {
     insertDatabase = await new Promise(((resolve, reject) => {
     connection.query(insertMySQLString, [user.username, saltString, hashPassword], function (error, result) {
      if (error) return resolve(false);
      console.log(result)
      resolve(true);
     })
    }));
   }
   if(loginCheckResult === true && insertDatabase === true) {
    response.status(200).send('successful');
   } else if(loginCheckResult === false){
    response.status(422).send('Login already exists');
   }
  } catch(e) {
   console.log(e)

  } 

});
//authorization
app.post('/authorization', function(request, response) {
 try {
  let user = {};
  user.username = request.body.username;
  user.password = request.body.password;
 }
 catch (e) {
  console.log(e)
 }

})

app.listen(5000, ()=>{console.log('server started')});