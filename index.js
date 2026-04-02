const express = require('express')
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoute = require("./routes/user.route");
dotenv.config();
const port = process.env.PORT || 5555
const URI = process.env.MONGODB_URI;

app.use(cors());
app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({ extended: true}))


mongoose.connect(URI)
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});




app.use("/user", userRoute);






app.listen(port, ()=> {
    console.log(`I am runnng on port ${port}`)
    
})