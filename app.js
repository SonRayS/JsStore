let express = require('express');
let app = express();

app.use(express.static('public'));
app.use(express.static('views'));

app.set('view engine', 'pug');

let mysql = require('mysql');

app.use(express.json());
const nodemailer = require('nodemailer');

let con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Teamshotgotkill_1',
  database: 'market'
});

con.connect(function (error) {
  if (error) throw error;
  console.log("Connected!");
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; //off search autoriz


app.listen(3000, function () {
  console.log('node express work on 80');
});

function getGoodsByCategory(category, orderBy) {
  return new Promise(function (resolve, reject) {
    let orderByString = ""
    if (orderBy === "ASC") {
      orderByString = "ORDER BY cost"
    }
    if (orderBy === "DESC") {
      orderByString = "ORDER BY cost DESC"
    }
    con.query(`SELECT * FROM goods WHERE category = '${category}' ${orderByString}`,
      function (error, result) {
        if (error) reject(error);
        resolve(result);

        let user = {};
        for (let i = 0; i < result.length; i++) {
          user[result[i]['id']] = result[i];
        }
        console.log(JSON.parse(JSON.stringify(user)))
      });
  });
}



app.get('/catalog', function (req, res) {
  console.log('load /catalog');
  console.log("Connected!");
  const orderBy = req.query.orderBy

  let nap = getGoodsByCategory('Наповнювачі', orderBy);

  let korm = getGoodsByCategory('Корм', orderBy);

  let game = getGoodsByCategory('Іграшки', orderBy);

  let homes = getGoodsByCategory('Будиночки', orderBy);

  let bed = getGoodsByCategory('Лежаки', orderBy);

  Promise.all([nap, korm, game, homes, bed]).then(function (value) {
    res.render('catalog', {
      nap: JSON.parse(JSON.stringify(value[0])),
      korm: JSON.parse(JSON.stringify(value[1])),
      game: JSON.parse(JSON.stringify(value[2])),
      homes: JSON.parse(JSON.stringify(value[3])),
      bed: JSON.parse(JSON.stringify(value[4]))
    });
  });
});

app.get('/admin', function (req, res) {
  console.log('load /admin');
  res.render('admin', {
  });
});

app.post('/login', function (req, res) {
  res.end('work');
});

app.get('/login', function (req, res) {
  console.log('load /login');
  res.render('login', {
  });
});


app.get('/admin-order', function (req, res) {
  console.log('load /admin');
  con.query(`SELECT 
	shop_order.id as id,
	shop_order.user_id as user_id,
    shop_order.goods_id as goods_id,
    shop_order.goods_cost as goods_cost,
    shop_order.goods_amount as goods_amount,
    shop_order.total as total,
    from_unixtime(date,"%Y-%m-%d %h:%m") as human_date,
    user_info.user_name as user,
    user_info.user_phone as phone,
    user_info.address as address
FROM 
	shop_order
LEFT JOIN 
	user_info
ON shop_order.user_id = user_info.id ORDER BY id DESC`, function (error, result, fields) {
    if (error) throw error;
    res.render('admin-order', { order: JSON.parse(JSON.stringify(result)) });
  });
});

app.get('/index', function (req, res) {
  console.log(req.query.id);

  let nap = getGoodsByCategory('Наповнювачі');

  let korm = getGoodsByCategory('Корм');

  let game = getGoodsByCategory('Іграшки');

  let homes = getGoodsByCategory('Будиночки');

  let bed = getGoodsByCategory('Лежаки');

  let goods = new Promise(function (resolve, reject) {
    con.query(
      'SELECT * FROM goods id',
      function (error, result) {
        if (error) reject(error);
        resolve(result);
      });
  });

  Promise.all([goods, nap, korm, game, homes, bed]).then(function (value) {
    res.render('index', {
      goods: JSON.parse(JSON.stringify(value[0])),
      nap: JSON.parse(JSON.stringify(value[1])),
      korm: JSON.parse(JSON.stringify(value[2])),
      game: JSON.parse(JSON.stringify(value[3])),
      homes: JSON.parse(JSON.stringify(value[4])),
      bed: JSON.parse(JSON.stringify(value[5]))
    });
  })
});

app.get('/goods', function (req, res) {
  console.log(req.query.id);
  con.query('SELECT * FROM goods WHERE id=' + req.query.id, function (error, result, fields) {
    if (error) throw error;
    res.render('goods', { goods: JSON.parse(JSON.stringify(result)) });
  });
});

app.post('/get-goods-info', function (req, res) {
  console.log(req.body.key);
  if (req.body.key.length != 0) {
    con.query('SELECT id,name,cost FROM goods WHERE id IN (' + req.body.key.join(',') + ')', function (error, result, fields) {
      if (error) throw error;
      console.log(result);
      let goods = {};
      for (let i = 0; i < result.length; i++) {
        goods[result[i]['id']] = result[i];
      }
      res.json(goods);
    });
  }
  else {
    res.send('0');
  }
});

app.get('/order', function (req, res) {
  res.render('order');
});

app.post('/finish-order', function (req, res) {
  console.log(req.body);
  if (req.body.key.length != 0) {
    let key = Object.keys(req.body.key);
    con.query(
      'SELECT id,name,cost FROM goods WHERE id IN (' + key.join(',') + ')',
      function (error, result, fields) {
        if (error) throw error;
        console.log(result);
        sendMail(req.body, result).catch(console.error);
        saveOrder(req.body, result);
        res.send('1');
      });
  }
  else {
    res.send('0');
  }
});

function saveOrder(data, result) {
  let sql;
  sql = "INSERT INTO user_info (user_name, user_phone, user_email,address) VALUES ('" + data.username + "', '" + data.phone + "', '" + data.email + "','" + data.address + "')";
  con.query(sql, function (error, resultQuery) {
    if (error) throw error;
    console.log("1 user save");
    console.log(resultQuery);
    let userId = resultQuery.insertId;
    date = new Date() / 1000;
    for (let i = 0; i < result.length; i++) {
      sql = "INSERT INTO shop_order (date, user_id, goods_id, goods_cost, goods_amount, total) VALUES (" + date + "," + userId + "," + result[i]['id'] + ", " + result[i]['cost'] + "," + data.key[result[i]['id']] + ", " + data.key[result[i]['id']] * result[i]['cost'] + ")";
      con.query(sql, function (error, resultQuery) {
        if (error) throw error;
        console.log("1 saved")
      })
    }
  });
}

async function sendMail(data, result) {
  let res = '<h2>Нове замовлення магазин зоотоварів</h2>';
  let total = 0;
  for (let i = 0; i < result.length; i++) {
    res += `<p>${result[i]['name']} - ${data.key[result[i]['id']]} - 
              ${result[i]['cost'] * data.key[result[i]['id']]} гривень</p>`;
    total += result[i]['cost'] * data.key[result[i]['id']];
  }
  console.log(res);
  res += '<hr>';
  res += `Total ${total} гривень`;
  res += `<hr>Phone: ${data.phone}`;
  res += `<hr>Username: ${data.username}`;
  res += `<hr>Address: ${data.address}`;
  res += `<hr>Email: ${data.email}`;

  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  let mailOption = {
    from: '<grinpis01@gmail.com>',
    to: "grinpis01@gmail.com," + data.email,
    subject: "Магазин зоотоварів",
    text: 'Работает!',
    html: res
  };

  let info = await transporter.sendMail(mailOption);
  console.log("MessageSent: %s", info.messageId);
  console.log("PreviewSent: %s", nodemailer.getTestMessageUrl(info));
  return true;
}

