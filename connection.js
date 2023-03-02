const mongoose = require("mongoose");
require('dotenv').config();
mongoose.set('strictQuery', false);

mongoose.connect('mongodb://localhost:27017/', ()=>{
    console.log("connected to mongodb")
})

