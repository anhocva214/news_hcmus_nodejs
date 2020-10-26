var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const DB = "news_tool";

const insert = (data, collection) => {
    return new Promise((resolve, reject)=>{
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db(DB);
            var myobj = data;
            dbo.collection(collection).insertOne(myobj, function (err, res) {
                if (err) throw err;
                resolve({error: false})
                console.log("1 ",collection," inserted");
                db.close();
            });
        });
    })
}

const query = (data, collection) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db(DB);
            // var query = { address: "Park Lane 38" };
            var query = data;
            dbo.collection(collection).find(query).toArray(function (err, result) {
                if (err) throw err;
                resolve(result);
                db.close();
            });
        });
    })
}

const update = (dataQuery, dataNew, collection) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db(DB);
            var myquery = dataQuery;
            var newvalues = { $set: dataNew };
            dbo.collection(collection).updateOne(myquery, newvalues, function (err, res) {
                if (err) {
                    console.log(err);
                    resolve(false);
                };
                resolve(true);
                console.log("1 document updated");
                db.close();
            });
        });
    })
}

const querySourceNews = (sourceNews) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db(DB);
            dbo.collection("account").find({}).toArray( function (err, result) {
                if (err) throw err;
                var dataEmail = [];
                // console.log(result);
                for (var i=0; i<=result.length; i++){
                    if (i == result.length){
                        // console.log('dataEmail: ',dataEmail);
                        resolve(dataEmail);
                    }
                    else{
                        result[i].sourceNews.map((value)=>{
                            // console.log(value);
                            if (value == sourceNews){
                                dataEmail.push(result[i].email);
                            }
                        })
                    }
                }
                db.close();
            });
        });
    })
}


const queryAll = (collection) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db(DB);
            dbo.collection(collection).find({}).toArray( function (err, result) {
                if (err) throw err;
                resolve(result);
                db.close();
            });
        });
    })
}

const deleteDocument = (quertDelete, collection) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(DB);
        var myquery = quertDelete;
        dbo.collection(collection).deleteOne(myquery, function (err, obj) {
            if (err) throw err;
            console.log("1 "+collection+" deleted");
            db.close();
        });
    });
}

module.exports = {
    insert: insert,
    query: query,
    update: update,
    querySourceNews: querySourceNews,
    queryAll: queryAll,
    deleteDocument: deleteDocument
}