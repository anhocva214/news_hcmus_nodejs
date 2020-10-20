var express = require('express');
var router = express.Router();
const database = require('./database');
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { v1: uuidv1 } = require('uuid');

const HASH_KEY = '999999999';


const verifyIdentity = (token, tokenKey) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, tokenKey, function (err, decoded) {
      if (err) {
        resolve(false)
      }
      else {
        resolve(true);
      }
    });
  })
}

router.get('/', function (req, res, next) {

  const d = new Date();
  const month = parseInt(d.getMonth()) + 1;
  const URL = `https://www.hcmus.edu.vn/sinh-vien`;
  const TIME = d.getDate() + "-" + month + "-" + d.getFullYear();
  const data = [[], [], []];

  const options = {
    uri: URL,
    transform: function (body) {
      //Khi lấy dữ liệu từ trang thành công nó sẽ tự động parse DOM
      return cheerio.load(body);
    },
  };

  (async function crawler() {
    try {
      // Lấy dữ liệu từ trang crawl đã được parseDOM
      var $ = await rp(options);
    } catch (error) {
      return error;
    }

    const newsColList = $(".category-module");
    for (var i = 0; i < newsColList.length; i++) {
      var newsColItem = $(newsColList[i]);
      var newsItem = newsColItem.find(".mod-articles-category-title");
      var timeItem = newsColItem.find(".mod-articles-category-date");
      // console.log($(newsItem[i]).text().trim());

      for (var j = 0; j < newsItem.length; j++) {
        if (handleTimeText($(timeItem[j]).text().trim()) == TIME)
          data[i].push($(newsItem[j]).text().trim());
      }
    }

    console.log(TIME);


    res.render("index", { data: data });
  })();

});

router.post('/register', async (req, res) => {
  var account = req.body;
  account.password = CryptoJS.MD5(account.password, HASH_KEY).toString();
  account.tokenKey = uuidv1();
  account.sourceNews = [];

  var queryEmail = await database.query({ email: account.email }, 'account');

  if (queryEmail.length > 0) {
    res.send({ error: true, msg: "Email is exist" })
  }
  else {
    var result = await database.insert(account, 'account');
    if (result.error == false) {
      res.send({ error: false, msg: "Register success" })
    }
    else {
      res.send({ error: true, msg: "Lỗi hệ thống!" })
    }
  }
  // res.send({ error: false , msg: "Register success"})

})

router.post('/login', async (req, res) => {
  var account = req.body;
  account.password = CryptoJS.MD5(account.password, HASH_KEY).toString();
  var queryAccount = await database.query({ email: account.email, password: account.password }, 'account');
  // console.log(queryAccount[0]);

  if (queryAccount.length > 0) {
    account = queryAccount[0];
    var token = jwt.sign({
      data: account.email
    }, account.tokenKey, { expiresIn: 60 * 60 });
    res.send({ error: false, email: account.email, sourceNews: account.sourceNews, token: token, tokenKey: account.tokenKey, msg: "Login success!" });
  }
  else {
    res.send({ error: true, msg: "Login fail!" });
  }
  // res.send({error: false})
})

router.post('/verify/', async (req, res) => {
  jwt.verify(req.body.token, req.body.tokenKey, async function (err, decoded) {
    if (err) {
      res.send({error: true})
    }
    else{
      var account = await database.query({tokenKey: req.body.tokenKey}, 'account');
      // console.log(account[0]);
      if (account.length > 0){
        res.send({email: account[0].email, sourceNews: account[0].sourceNews, error: false});
      }
      else{
        res.send({error: true});
      }
    }
  });
})

router.post('/editemail', async (req, res)=>{
  if (await verifyIdentity(req.body.token, req.body.tokenKey) == true){
    var update = await database.update({tokenKey: req.body.tokenKey}, {email: req.body.emailNew}, 'account');
    if (update == true){
      res.send({ error: false, msg: "Save email sucess!"})
    }
    else{
      res.send({ error: true, msg: "Error System"})
    }
  }
  else{
    res.send({ error: true, msg: "You need login again, please"})
  }
})

router.post('/changepassword', async (req, res) => {
  if (await verifyIdentity(req.body.token, req.body.tokenKey) == true) {
    var password = CryptoJS.MD5(req.body.passwordNew, HASH_KEY).toString();
    var update = await database.update({ tokenKey: req.body.tokenKey }, { password: password }, 'account');
    if (update == true) {
      res.send({ error: false, msg: "Change password sucess!" })
    }
    else {
      res.send({ error: true, msg: "Error System" })
    }
  }
  else {
    res.send({ error: true, msg: "You need login again, please" })
  }
})

router.post('/updatesourcenews', async (req, res) => {
  if (await verifyIdentity(req.body.token, req.body.tokenKey) == true) {
    var update = await database.update({ tokenKey: req.body.tokenKey }, { sourceNews: req.body.sourceNews }, 'account');
    if (update == true) {
      res.send({ error: false, msg: "Update source news sucess!" })
    }
    else {
      res.send({ error: true, msg: "Error System" })
    }
  }
  else {
    res.send({ error: true, msg: "You need login again, please" })
  }
})

module.exports = router;
