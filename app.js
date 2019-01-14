'use strict';

const express = require('express');
const jsonParser = require('body-parser').json;
const routes = require('./routes');
const logger = require('morgan');
const mongoose = require('mongoose');
const app = express();

app.use(logger("dev"));
app.use(jsonParser());

app.use('/questions', routes);

/**
 * Mongo database connection
 * Start of connection
 */
mongoose.connect("mongodb://localhost:27017/qa",
                { 
                    useNewUrlParser: true,
                    useCreateIndex: true,
                });

let db = mongoose.connection;

db.on("error", function(err){
    console.error("connection error: ", err);
});

db.once("open", function(){
    console.log("db connection successful");
});

/**
 * End of connection
 */

 /**
  * Allow API to be used by other browser
  */
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if(req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT,POST,DELETE");
        return res.status(200).json({});
        
    }
    next();
});
// End of API authorization

// catch 404 error and forward to error handler
app.use(function(req, res, next){
    let error = new Error("Not Found");
    err.status = 404;
    next(err);
});

// Error Handler
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});

const port = process.env.PORT || 3000;

app.listen(port, function(){
    console.log("Express server is listening on port", port);
});