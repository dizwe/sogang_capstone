
const express = require('express')
const requests = require('requests');
const app = express()
const fs = require('fs');
const convert = require('xml-js');

// view engine setup
var exphbs  = require('express-handlebars');
app.locals.pretty = true;
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
const port = 8000

mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'me',
    password: 'mypassword',
    database: 'mydb'
})
connection.connect();

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

function insert_sensor(value, device, unit, type,  seq, ip) {
  obj = {};
  obj.seq = seq;
  obj.device = device;
  obj.unit = unit;
  obj.type = type;
  obj.value = value;
  obj.ip = ip;

  var query = connection.query('insert into sensors set ?', obj, function(err, rows, cols) {
    if (err) throw err;
    console.log("database insertion ok= %j", obj);
  });
}

app.get('/', (req, res) => {
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

// ALTER USER ‘me’@‘localhost' IDENTIFIED WITH mysql_native_password BY ‘pass’ 같은 방식으로 해줘야
// Client does not support authentication protocol requested by server; consider upgrading MySQL client 에러가 안남
app.get('/log', function(req, res) {
  r = req.query;
  console.log("GET %j", r);

  insert_sensor(r.device, r.unit, r.type, r.value, r.seq, req.connection.remoteAddress);
  res.end('OK:' + JSON.stringify(req.query));
});

app.get("/data", function(req, res) {
  var qstr = 'select * from sensors ';
  connection.query(qstr, function(err, rows, cols) {
    if (err) {
      res.send('query error: '+ qstr);
      throw err;
    }

    console.log("Got "+ rows.length +" records");
    html = ""
    for (var i=0; i< rows.length; i++) {
       html += JSON.stringify(rows[i]);
    }
    res.send(html);
  });

});

app.get("/chart", function(req, res) {
  console.log('got app.get(graph)');
  var qstr = 'select * from sensors ';
  connection.query(qstr, function(err, rows, cols) {
    if (err) throw err;
    return res.render('chart',{rows:rows});
  });
});

// Timer in node.js
function cron_log(arg) {
  // ‘기상청 RSS’ 를 검색하여 기상청이 계정인증 없이 액세스를 허용하는 RSS를 이용하여 
  // 동네 예보로 부터 온도값을 추출해서 10분간격으로 본인의 IoT 서버로 쏘도록 합니다. 
  requests('http://www.kma.go.kr/wid/queryDFSRSS.jsp?zone=4889025000')
  .on('data', function (chunk) {
    let options =  {compact: true, spaces: 4};
    let result = convert.xml2js(chunk, options); // or convert.xml2json(xml, options)
    console.log(result.rss.channel.item.description.header.tm);
    console.log(result.rss.channel.item.description.body.data[0].temp);
    
    insert_sensor(value=result.rss.channel.item.description.body.data[0].temp._text);
    // console.log(result.elements[0].elements[0].elements.filter(x=>x.name==='item')[0].elements);
  })
  .on('end', function (err) {
    if (err) return console.log('connection closed due to errors', err);
    return; 
  });
}

setInterval(cron_log, 600000);


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
