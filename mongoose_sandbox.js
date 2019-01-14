'use strict';

const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/sandbox",
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
    // All database communication goes here
    let Schema = mongoose.Schema;
    let AnimalSchema = new Schema({
        type:  {type: String, default: "goldfish"},
        size:  String,
        color: {type: String, default: "golden"},
        mass:  {type: Number, default: 0.007},
        name:  {type: String, default: "Angela"}
    });

    AnimalSchema.pre("save", function(next) {
        if(this.mass >= 100) {
            this.size = "big";
        } else if(this.mass >= 5 && this.mass < 100) {
            this.size = "medium";
        } else {
            this.size = "small";
        }
        next();
    });

    AnimalSchema.statics.findSize = function(size, callback) {
        return this.find({size: size}, callback);
    }

    AnimalSchema.methods.findSameColor = function(callback) {
        // this == document
        return this.model("Animal").find({color: this.color}, callback);
    }

    let Animal = mongoose.model("Animal", AnimalSchema);

    let elephant = new Animal({
        type: "elephant",
        color: "gray",
        mass: 6000,
        name: "Lawrence"
    });

    let animal = new Animal({});

    let whale = new Animal({
        type: "whale",
        mass: 190500,
        name: "Fig"
    });

    /**
     * Seems like "try-catch" block does not work this way
     * May want to find other alternative to do so
     */
    let animalData = [
        {
            type: 'Mouse',
            color: "gray",
            mass: 0.035,
            name: "Marvin"
        },
        {
            type: 'nutria',
            color: "brown",
            mass: 6.35,
            name: "Gretchen"
        },
        {
            type: 'wolf',
            color: "gray",
            mass: 45,
            name: "Iris"
        },
        elephant,
        animal,
        whale
    ]

    Animal.deleteMany({}, function(err) {
        if (err) console.error(err);
        Animal.create(animalData, function(err, animals){
            if (err) console.error(err);
            // TO query the animals that has the property "XXXX" based on the function declared above
            Animal.findOne({type: "elephant"}, function(err, elephant) {
                elephant.findSameColor(function(err, animals){
                    if (err) console.error(err);
                    animals.forEach(function(animal){
                        console.log(animal.name + " the " + animal.color + " " + animal.type + " is a " + animal.size + "-sized animal.");
                    });
                    db.close(function(){
                        console.log("db connection closed");
                    });
                });
            });
        });
    });
});