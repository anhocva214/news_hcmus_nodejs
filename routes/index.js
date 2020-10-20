var express = require('express');
var router = express.Router();
const rp = require("request-promise");
const cheerio = require("cheerio");
const nodemailer = require('nodemailer');
const database = require('./database');
const CryptoJS = require("crypto-js");



var dataSendMail = [];
const checkIsData = (item) => {
  for (var i = 0; i <= dataSendMail.length; i++) {
    if (i == dataSendMail.length) {
      dataSendMail.push(item);
      return false;
    }
    if (item == dataSendMail[i]) return true;
  }
}
const sendMail = (news) => {

  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: "ho.an@highesthabitleadership.com",
      pass: "@nho2001vnnt",
    },
  });
  // bacabeo@gmail.com, dpthienphu@gmail.com
  const mailOptions = {
    from: 'ho.an@highesthabitleadership.com',
    to: 'anhocva214@gmail.com',
    subject: 'News Hcmus',
    text: news
  };

  if (checkIsData(news) == false) {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    // console.log("Send MAil: ", news);
  }


}

// }

const handleTimeText = (timeText) => {
  timeText = timeText.replace("(", "");
  timeText = timeText.replace(")", "");
  return timeText.trim();
}

const crawlerData = () => {
  const d = new Date();
  const month = parseInt(d.getMonth()) + 1;
  const URL = `https://www.hcmus.edu.vn/sinh-vien`;
  const TIME = d.getDate() + "-" + month + "-" + d.getFullYear();

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
          sendMail($(newsItem[j]).text().trim());
      }
    }

    console.log(TIME);


    // console.log(data);
  })();

}

setInterval(() => {
  crawlerData();
}, 3000);

/* GET home page. */
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
  account.password = CryptoJS.MD5(account.password, '999999999').toString();
  console.log(account.email);
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

router.post('/login', async (req, res)=>{
  console.log(req.body);
  res.send({error: false});
})




module.exports = router;
