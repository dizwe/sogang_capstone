
const express = require('express')
const app = express()
const fs = require('fs');

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
const port = 8000
function getTimeStamp() {
    var d = new Date();
    var s =
      leadingZeros(d.getFullYear(), 4) + '-' +
      leadingZeros(d.getMonth() + 1, 2) + '-' +
      leadingZeros(d.getDate(), 2) + ' ' +
  
      leadingZeros(d.getHours(), 2) + ':' +
      leadingZeros(d.getMinutes(), 2) + ':' +
      leadingZeros(d.getSeconds(), 2);
  
    return s;
  }
  
function leadingZeros(n, digits) {
var zero = '';
n = n.toString();

if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
    zero += '0';
}
return zero + n;
}


  
  
app.get('/', (req, res) => res.send('Hello World!'))
app.get('/get', (req, res) => {
  let got_json = req.query;
  got_json.email = 'dizwe2716@gmail.com';
  got_json.stuno = '20140132';
  got_json.time = getTimeStamp();
  got_json.ip = req.connection.remoteAddress.replace('::ffff:','');
  res.json(got_json);
})
app.post('/', (req, res) => {
  let got_json = req.body;
  got_json.email = 'dizwe2716@gmail.com';
  got_json.stuno = '20140132';
  got_json.time = getTimeStamp();
  got_json.ip = req.connection.remoteAddress.replace('::ffff:','');
  res.json(got_json);
})

app.get('/file', (req, res,next) => {
    fs.writeFile('test-folder/test.txt', JSON.stringify({1:1}), (err) => {
        if (err) return next(err); 
        next();
	return res.json('file done');
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
