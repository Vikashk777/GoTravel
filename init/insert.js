const initData = require("./data.js");
const mongoose = require("mongoose");
const Travels = require("../models/travel.js");


const Mongo_Url = "mongodb://127.0.0.1:27017/GoTravel";

main()
.then(res =>{
    console.log("connection Success")})
.catch(err=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(Mongo_Url);
}

const initDB = async() =>{
    await Travels.deleteMany({});
    await Travels.insertMany(initData.data);
    console.log("data was saved");
}

initDB();