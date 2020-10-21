const nodemailer = require('nodemailer');
var express = require('express');
var router = express.Router();
const rp = require("request-promise");
const cheerio = require("cheerio");
const database = require('../database');


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

const sendMail = async (news) => {

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

    var listEmail = await database.querySourceNews('HCMUS');
    var toEmail = "";
    for (var i = 0; i < listEmail.length; i++) {
        if (i == listEmail.length - 1){
            toEmail += listEmail[i];
        }
        else{
            toEmail += listEmail[i]+", ";
        }
    }

    const mailOptions = {
        from: 'ho.an@highesthabitleadership.com',
        to: toEmail,
        subject: 'News Hcmus',
        text: news
    };

    if (checkIsData(news) == false) {
        console.log(toEmail);
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

const handleTimeText = (timeText) => {
    timeText = timeText.replace("(", "");
    timeText = timeText.replace(")", "");
    return timeText.trim();
}

const crawlerData = () => {
    const d = new Date();
    const month = parseInt(d.getMonth()) + 1;
    const URL = `https://www.hcmus.edu.vn/sinh-vien`;
    const TIME =  d.getDate() + "-" + month + "-" + d.getFullYear();

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



// setInterval(() => {
//   crawlerData();
// }, 3000);


module.exports = router;
