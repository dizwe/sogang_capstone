
const express = require('express')
const requests = require('requests');
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

app.get('/hapcheon_jungang', (req, res) => {
  requests('https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByAddr/json?address=%EA%B2%BD%EC%83%81%EB%82%A8%EB%8F%84%20%ED%95%A9%EC%B2%9C%EA%B5%B0')
  .on('data', function (chunk) {
    let father_pharm = JSON.parse(chunk).stores.filter(x=>x.code==="38820609")[0];
    
    let time = father_pharm.created_at;
    let result;
    if(father_pharm.remain_stat == 'plenty'){
      result = `${time}에 확인해봤는데, <font color="green" font size="6">100개 이상 있어요</font>`;
    }else if(father_pharm.remain_stat == 'some'){
      result = `${time}에 확인해봤는데, <font color="yellow" font size="6">30개에서 100개 사이 있어요</font>`;
    }else if(father_pharm.remain_stat == 'few'){
      result = `${time}에 확인해봤는데,  <font color="red" font size="6">30개 미만 있어요</font>`;
    }else if(father_pharm.remain_stat == 'empty'){
      result = `${time}에 확인해봤는데, <font color="grey" font size="6">1개 이하 있어요</font>`;
    }

    res.send(result);
  })
  .on('end', function (err) {
    if (err) return console.log('connection closed due to errors', err);
    return; 
  });
})

app.get('/file', (req, res,next) => {
    fs.writeFile('test-folder/test.txt', JSON.stringify({1:1}), (err) => {
        if (err) return next(err); 
        next();
	return res.json('file done');
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
