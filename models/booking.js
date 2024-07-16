const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    name :{
        type : String,
    },
    cityName: {
        type: String,
    },
    person: {
        type: Number,
    },
    mode: {
        type: String,
    },
    children: {
        type: Number,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
})

let Ticket = mongoose.model("Ticket", bookingSchema);

module.exports = Ticket;