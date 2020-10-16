var express = require('express');
var router = express.Router();
var request = require("request");
const rp = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const nodemailer = require('nodemailer');
const login = require("facebook-chat-api");


// const sendMail = ()=>{

//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//       user: "tackecon1551@gmail.com",
//       pass: "anho2001vnnt",
//     },
//   });

//   const mailOptions = {
//     from: 'tackecon1551@gmail.com',
//     to: 'anhocva214@gmail.com',
//     subject: 'News Hcmus',
//     text: 'Have Changes'
//   };
  
//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//     console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });
// }

const sendMessage = (msg) => {
  const email = "0326255330";
  const password = "hoan2001vnnt";
  login({ email: email, password: password }, (err, api) => {
    if (err) throw err;
    const userId = '100015834401721';
    api.sendMessage(msg, userId);
  });

}

var temp = ["test","",""];
const crawlerData = () => {
  const URL = `https://www.hcmus.edu.vn/sinh-vien`;

  const options = {
    uri: URL,
    transform: function (body) {
      //Khi lấy dữ liệu từ trang thành công nó sẽ tự động parse DOM
      return cheerio.load(body);
    },
  };

  var data = [[], [], []];
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
      // console.log($(newsItem[i]).text().trim());
      for (var j = 0; j < newsItem.length; j++) {
        data[i].push($(newsItem[j]).text().trim());
      }
    }

    if (temp[0] == ""){
      temp[0] = data[0][1];
    }
    else if (temp[0] == data[0][1]){
      console.log("Not Changes col 1");
    }
    else if (temp[0] != data[0][1]){
      console.log("Have Changes Col 1");
      temp[0] = data[0][1];
      // sendMail();
      sendMessage(temp[0]);
    }

    if (temp[1] == ""){
      temp[1] = data[1][1];
    }
    else if (temp[1] == data[1][1]){
      console.log("Not Changes col 2");
    }
    else if (temp[1] != data[1][1]){
      console.log("Have Changes Col 2");
      temp[1] = data[1][1];
      // sendMail();
      sendMessage(temp[1]);
    }

    if (temp[2] == ""){
      temp[2] = data[2][1];
    }
    else if (temp[2] == data[2][1]){
      console.log("Not Changes col 3");
    }
    else if (temp[2] != data[2][1]){
      console.log("Have Changes Col 3");
      temp[2] = data[2][1];
      // sendMail();
      sendMessage(temp[2]);
    }
    // console.log(col1);

    // console.log(data);
  })();

}

setInterval(() => {
  crawlerData();
}, 3000);

/* GET home page. */
router.get('/', function (req, res, next) {

  const URL = `https://www.hcmus.edu.vn/sinh-vien`;

  const options = {
    uri: URL,
    transform: function (body) {
      //Khi lấy dữ liệu từ trang thành công nó sẽ tự động parse DOM
      return cheerio.load(body);
    },
  };

  var data = [[], [], []];


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
      // console.log($(newsItem[i]).text().trim());
      for (var j = 0; j < newsItem.length; j++) {
        data[i].push($(newsItem[j]).text().trim());
      }
    }

    // console.log(col1);

    // console.log(JSON.stringify(data));

    // Lưu dữ liệu về máy
    // sendMail();
    res.render("index", { data: data });
  })();

  // var x=0;
  // setInterval(() => {
  //   x++;
  //   res.render("index", {data: data, count: x});
  //   console.log(x);
  // }, 3000);

});

module.exports = router;
