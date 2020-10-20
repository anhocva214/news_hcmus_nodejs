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

module.exports = {
    insert: insert,
    query: query
}