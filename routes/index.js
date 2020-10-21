var express = require('express');
var router = express.Router();
const database = require('./database');
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { v1: uuidv1 } = require('uuid');
const nodemailer = require('nodemailer');


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

const sendEmail = (message, toEmail) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: "ho.an@highesthabitleadership.com",
      pass: "@nho2001vnnt",
    },
  });

  const mailOptions = {
    from: 'ho.an@highesthabitleadership.com',
    to: toEmail,
    subject: 'Reset Password For Your NewsTool Account ',
    html: message
  };


  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  // console.log("Send MAil: ", news);

}

router.get('/', function (req, res, next) {
  res.render("index", { data: "Connect Success!" });
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

router.post('/forgetpasswordrequest', async (req, res)=>{
  const email = req.body.email;
  var isEmailExist = await database.query({email: email}, 'account');
  if (isEmailExist.length > 0){
    var code = uuidv1();
    codeAuthentic = code.split("-")[0];
    var tokenAuthentic = jwt.sign({
      data: {codeAuthentic: codeAuthentic, email: email}
    }, codeAuthentic, { expiresIn: 60 * 60 });
    sendEmail(`<h3>Code Authentic: `+codeAuthentic+` </h3>`, email);
    res.send({error: false, msg: "Code authentic sent to your email", tokenAuthentic: tokenAuthentic})
  }
  else{
    res.send({error: true, msg: "Email not exist"})
  }
})

router.post('/forgetpassword', async (req, res)=>{
  jwt.verify(req.body.tokenAuthentic, req.body.codeAuthentic, async function (err, decoded) {
    if (err) {
      res.send({error: true, msg: "Code Authentic expired"})
    }
    else{
      if (decoded.data.codeAuthentic == req.body.codeAuthentic && decoded.data.email == req.body.email){
        var password = CryptoJS.MD5(req.body.passwordNew, HASH_KEY).toString();
        var update = await database.update({ email: req.body.email }, { password: password }, 'account');
        if (update == true){
          res.send({ error: false, msg: "Update password success!"})
        }
        else{
          res.send({ error: false, msg: "Error System"})
        }
      }
      else{
        res.send({error: true, msg: "Code authentic invalid or email invalid"})
      }
    }
  });
})

module.exports = router;
