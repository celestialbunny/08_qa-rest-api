'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let sortAnswers = function(a, b) {
    // return negative if a before b
    // return zero for no change
    // return positive a after b
    if (a.votes === b.votes) {
        /**
         * Theoreatical logic on how things should be sorted out
         * But refer to the solution below for the easiest shorthand written
         */
        // if (a.updatedAt > b.updatedAt) {
        //     return -1;
        // } else if (a.updatedAt < b.updatedAt) {
        //     return 1;
        // } else {
        //     return 0;
        // }
        return b.updatedAt - a.updatedAt;
    }
    return b.votes - a.votes;
}

AnswerSchema.method("update", function(updates, callback) {
    Object.assign(this, updates, {updatedAt: new Date()});
    this.parent().save(callback);
});

AnswerSchema.method("vote", function(vote, callback) {
    if (vote === "up") {
        this.votes += 1;
    } else {
        this.votes -= 1;
    }
    this.parent().save(callback);
});

const AnswerSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    votes: {type: Number, default: 0}
})

const QuestionSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    answers: [AnswerSchema]
});

QuestionSchema.pre("save", function(next){
    this.answers.sort(sortAnswers);
    next();
})

let Question = mongoose.model("Question", QuestionSchema);

module.exports.Question = Question;