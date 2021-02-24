const express = require("express");
const path = require("path");
const fs = require("fs")
const cors = require("cors");
const MongoClient = require('mongodb').MongoClient;

const app = express();
const ObjectID = require('mongodb').ObjectID;

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    console.log("Requested url: "+ req.url);
    next();
});

// connect to db
let db;
MongoClient.connect('mongodb+srv://OzencOCAK:OzencOcak@webappcoursework.cd2jx.mongodb.net/test', {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
    db = client.db('webstore');
});


app.param('collection', (req, res, next, collection) => {
    req.collection = db.collection(collection)
    return next();
});

// GET route to get all records from database
app.get('/collection/:collection', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next();
        res.json(results);
    });
});

// POST route to add record to database
app.post('/collection/:collection', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next();
        res.json(results.ops);
    });
});

// PUT route to update record in database
app.put('/collection/:collection/:id', (req, res, next) => {
    req.collection.updateOne(
        { _id: new ObjectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            if(e || result.result.n !== 1) return next();
            res.json({ message: 'success' });
        });
});

// PUT route to reduce value of specified attribute of the record in database
app.put('/collection/:collection/:id/reduce/:name/:value', (req, res, next) => {

    let value = -1 * parseInt(req.params.value);
    let name = req.params.name;

    const attr = {};
    attr[name] = value;

    req.collection.updateOne(
        { _id: new ObjectID(req.params.id) },
        { "$inc": attr },
        { safe: true, multi: false },
        (e, result) => {
            if(e || result.result.n !== 1) return next();
            res.json({ message: 'success' });
        });
});



let publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

app.use(function(req, res, next) {
    
    var filePath = path.join(__dirname, "static", req.url);
    
    fs.stat(filePath, function(err, fileInfo) {
        if (err) { next(); return; }
        if (fileInfo.isFile()) res.sendFile(filePath);
        else next();
    });
});


// 404 middleware
app.use((req, res) => {
    res.status(404).json({error: true, message: 'something went wrong'});
});

const port = process.env.PORT || 3000;

app.listen(port);


