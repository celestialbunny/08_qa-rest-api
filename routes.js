'use strict';

const express = require('express');
const router = express.Router();
const Question = require("./models").Question;

router.param("qID", function(req, res, next, id){
    Question.findById(id, function(err, doc){
        if(err) return next(err);
        if(!doc){
            err = new Error("Not Found");
            err.status = 404;
            return next(err);
        }
        req.question = doc;
        return next();
    });
});

router.param("aID", function(req, res, next, id){
    req.answer = req.question.answers.id(id);
    if(!req.answer){
        err = new Error("Not Found");
        err.status = 404;
        return next(err);
    }
    next();
});

// GET /questions
router.get('/', function(req, res){
    /**
     * 1. find {} for all the results
     * 2. null, to allow 3. sorting to be done, else will take in wrong sequence of parameters
     * 3. sort via createdAt -1
     * 4. callback function, to handle errors and if no, display questions
     */
    // Question.find({}, null, {sort: {createdAt: -1}}, function(err, questions){
    //     if (err) return next(err);
    //     res.json(questions);
    // });
    /**
     * Another way of doing it
     */
    Question.find({})
        .sort({createdAt: -1})
        .exec(function(err, questions){
            if (err) {
                return next(err);
            } else {
                res.json(questions);
            }
        });
});

// POST /questions
router.post('/', function(req, res, next){
    let question = new Question(req.body);
    question.save(function(err, question){
        if(err) return next(err);
        res.status(201);
        res.json(question);
    });
});

// GET /questions/:id
router.get('/:qID', function(req, res, next){
    /**
     * Since there is such a function on "router.param", we can simplify to below
     */
    // Question.findById(req.params.qID, function(err, doc){
    //     if(err) return next(err);
    //     res.json(doc);
    // });
    res.json(req.question);
});

// POST /questions/:id/answers
router.post('/:qID/answers', function(req, res, next){
    req.question.answers.push(req.body);
    req.question.save(function(err, question){
        if(err) return next(err);
        res.status(201);
        res.json(question);
    });
    res.json({
        response: "You sent me a POST request to /answers",
        questionId: req.params.qID,
        body: req.body
    });
});

// PUT /questions/:qID/answers/:aID
router.put('/:qID/answers/:aID', function(req, res){
    /**
     * Parameters to put in to test server request using POSTMAN
     */
    // res.json({
    //     response: "You sent me a PUT request to /answers",
    //     questionId: req.params.qID,
    //     answerId: req.params.aID,
    //     body: req.body
    // });
    req.answer.update(req.body, function(err, result){
        if(err) return next(err);
        res.json(result);
    });
});

// DELETE /questions/:qID/answers/:aID
router.delete('/:qID/answers/:aID', function(req, res){
    /**
     * Parameters to put in to test server request using POSTMAN
     */
    // res.json({
    //     response: "You sent me a DELETE request to /answers",
    //     questionId: req.params.qID,
    //     answerId: req.params.aID
    // });
    req.answer.remove(function(err){
        req.question.save(function(err, question){
            if(err) return next(err);
            res.json(question);
        });
    })
});

// POST /questions/:qID/answers/:aID/vote-up
// POST /questions/:qID/answers/:aID/vote-down
router.post('/:qID/answers/:aID/vote-:dir',
    function(req, res, next){
        // To remove all in relate to other than "up" and "down"
        if(req.params.dir.search(/^up|down$/) === -1) {
            let err = new Error("Not Found");
            err.status = 404;
            next(err);
        } else {
            // There must be a callback, hence it will proceed to the function below
            req.vote = req.params.dir;
            next();
        }
    }, function(req, res){
        req.answer.vote(req.vote, function(err, question){
            if(err) return next(err);
            res.json(question);
        });
        /**
         * Parameters to put in to test server request using POSTMAN
         */
        // res.json({
        //     response: "You sent me a POST request to /vote-" + req.params.dir,
        //     questionId: req.params.qID,
        //     answerId: req.params.aID,
        //     vote: req.params.dir
        // });
});

module.exports = router;