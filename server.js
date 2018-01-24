var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    requireDir = require('require-dir'),
    config = require('./config/developement'),
    path = require('path');
    // subscribeAPI =  require('./server/controller/api/subscribtionAPI');

var controllers = requireDir('./server/controller/api');
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'client')));
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,x-username,x-token');
    next();
};
app.use(allowCrossDomain);

var router = express.Router();
var routes = require('./server/routes');

router.get('/', function (req, resp) {
    res.sendfile(__dirname + '/client/index.html');
});

routes.register(router);
app.use('/api', router);

mongoose.connect('mongodb://' + config.db.mongo.host + ':' + config.db.mongo.port + '/' + config.db.mongo.db);
app.listen(7000, function () {
    console.log("Welcome to Dew and Dine.. server started at 7000")
});
module.exports = app;

