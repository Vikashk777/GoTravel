const mongoose = require("mongoose");
// const {schema} = mongoose;

const travelSchema = new mongoose.Schema({
    city : {
        type : String,
        required : true,
    },
    description :{
        type : String,
        required : true,
    },
    price : {
        type : String,
        required : true,
    },
    imageUrl :{
        type : String,
        required : true,
    }
})

const Travel = mongoose.model("Travel", travelSchema);

module.exports = Travel;