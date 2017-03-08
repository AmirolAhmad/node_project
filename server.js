const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient
version = require('./version.js'); // grab version file
require('dotenv').config()

const app = express();

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use(version) // use version file in views

var db

MongoClient.connect(process.env.MONGODB_URI, (err, database) => {
  if (err) return console.log(err)
  db = database

  app.listen(process.env.PORT, () => {
      console.log('listening on 3000')
  })
})

// GET method
app.get('/', (req, res) => {
  db.collection('quotes').find().toArray((err, result) => {
    if (err) return console.log(err)
    // render views/index.ejs
    res.render('index.ejs', {quotes: result})
  })
})

// POST method
app.post('/quotes', (req, res) => {
  db.collection('quotes').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database!')
    res.redirect('/')
  })
})

// learn above tutorial at https://zellwk.com/blog/crud-express-mongodb

// PUT method
app.put('/quotes', (req, res) => {
  db.collection('quotes').findOneAndUpdate({name: 'Yoda'}, {
    $set: {
      name: req.body.name,
      quote: req.body.quote
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

// DELETE method
app.delete('/quotes', (req, res) => {
  db.collection('quotes').findOneAndDelete({name: req.body.name},
  (err, result) => {
    if (err) return res.send(500, err)
    res.send(result)
  })
})

// learn above tutorial at https://zellwk.com/blog/crud-express-mongodb-2
