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
        if (item.text == dataSendMail[i].text) return true;
    }
}

const sendMail = async (news) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.zoho.com",
        port: 465,
        secure: true,
        auth: {
            user: "newstool@anho.me",
            pass: "anho2001vnnt",
        },
    });
    // bacabeo@gmail.com, dpthienphu@gmail.com

    var listEmail = await database.querySourceNews('HCMUS');
    var toEmail = "";
    for (var i = 0; i < listEmail.length; i++) {
        if (i == listEmail.length - 1) {
            toEmail += listEmail[i];
        }
        else {
            toEmail += listEmail[i] + ", ";
        }
    }

    const mailOptions = {
        from: 'newstool@anho.me',
        to: toEmail,
        subject: 'News Hcmus',
        html: `<a href="${news.link}">${news.text}</a>`
    };
    const check =  checkIsData(news);
    // console.log('check: ', check);
    if (check == false) {
        // console.log(toEmail);
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        // console.log("Send MAil: ", news.text);
    }

}

const handleTimeText = (timeText) => {
    timeText = timeText.replace("(", "");
    timeText = timeText.replace(")", "");
    return timeText.trim();
}

const compareDataNewsFeed = (dataOld, dataNew) => {
    var indexKey = 0;
    dataNew.forEach((value, index) => {
        if (value == dataOld[0]) indexKey = index
    })

    if (indexKey == 0) {
        return { status: false }
    }
    else {
        var tempData = [];
        for (var i = 0; i < indexKey; i++) {
            tempData.push(dataNew[i]);
        }
        return { status: true, data: tempData }
    }
}

const handleDataNewsFeed = async (dataNew) => {
    var newsFeedData = await database.queryAll('newsfeed');
    // console.log(newsFeedData);
    if (newsFeedData.length == 0) {
        await database.insert({ data: dataNew }, 'newsfeed');
    }
    else {
        newsFeedData[0].data.forEach(async (value, index) => {
            var resultCompare = compareDataNewsFeed(value, dataNew[index]);
            if (resultCompare.status == true) {
                resultCompare.data.forEach((value) => {
                    sendMail(value);
                })
                var temp = [...newsFeedData[0].data];
                temp[index] = dataNew[index];
                await database.update({ data: newsFeedData[0].data }, { data: temp }, 'newsfeed');
            }
        })
    }
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
                if (handleTimeText($(timeItem[j]).text().trim()) == TIME) {
                    var item = {};
                    item.text = $(newsItem[j]).text().trim();
                    item.link = 'https://www.hcmus.edu.vn/' + $(newsItem[j]).attr('href');
                    sendMail(item);
                    // console.log(item);
                }
            }
        }

        const newsListFeed = $(".newsfeed");
        var data = [];
        // console.log($(newsListFeed[0]).find("span a")[0].children[0].data.trim());
        for (var i = 1; i < newsListFeed.length; i++) {
            var temp = [];
            var newsItemFeed = $(newsListFeed[i]).find("span a");
            // console.log(newsItemFeed[0])
            for (var j = 0; j < newsItemFeed.length; j++) {
                // console.log(newsItemFeed[j].children[0].data.trim())
                temp.push(newsItemFeed[j].children[0].data.trim());
            }
            data.push(temp);
        }

        // console.log(data)

        handleDataNewsFeed(data);
        console.log(TIME);


        // console.log(data);
    })();

}



setInterval(() => {
    crawlerData();
}, 3000);


module.exports = router;
