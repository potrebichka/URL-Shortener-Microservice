'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var url = require('url');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
/** MONGOOSE **/


mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI, {useNewUrlParser: true})
    .then(res => console.log("Connected to DB"))
    .catch(err => console.error(err));

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

//body parser
app.use(bodyParser.urlencoded({extended: false})
);

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


var urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
    unique: true
  },
  short_url: {
    type: Number,
    required: true,
    unique: true
  }/*,
  count: {
    type: Number,
    required: true
  }*/
});

var NewUrl = mongoose.model('NewUrl', urlSchema);
let countUrl = 0;

app.post('/api/shorturl/new', function(req, res) {
  const extractUrl = req.body.url;
  const parsedExtractUrl = url.parse(extractUrl);
  NewUrl.countDocuments({}, (err, count) => err ? console.error("Not count") : countUrl = count);
  if (!parsedExtractUrl.hostname) {
    res.send({"error":"invalid URL"})
  } else {
    dns.lookup(parsedExtractUrl.hostname, function(err, address, family){
     if (err) {
       res.send({"error":"invalid URL"})
     } else {
       //NewUrl.countDocuments({}, (err, count) => err ? console.error("Not count") : countUrl = count);
       NewUrl.create({
        'original_url': parsedExtractUrl.hostname,
        'short_url': countUrl + 1
      }, function (err, data) {
           if (err) {
             res.json({"error": "Not Saved"})
           }
           else {
            res.json({"original_url": parsedExtractUrl.hostname, "short_url": countUrl+1});
           }
       });
     }
  });
  }
})

app.get('/api/shorturl/:short', function(req, res) {
  NewUrl.findOne({short_url: req.params.short}, function(err, data) {
     if (err) {/*console.error(err);*/res.send({error: "Short Url not found"})}
     else {res.redirect("https://" + data["original_url"])}
  })
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});