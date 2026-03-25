const express = require('express')
const app = express();
const ejs = require('ejs')
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
dotenv.config();
const port = process.env.PORT || 5555
const URI = process.env.MONGODB_URI;
const users = [];

app.use(cors());
app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({ extended: true}))


// let customerSchema = mongoose.Schema({
//     firstName: {type: String, required: true},
//     lastName: {type: String, required: true},
//     email: {type: String, required: true, unique: [true,"Email has been taken, please choose another one"]},
//     password: {type: String, required: true}
// });

// const Customer = mongoose.model('Customer', customerSchema);

// Routes
app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/register", (req, res) => {
    const user = req.body;
    users.push(user);
    console.log(users); 
    res.send("You have registered successfully");
    
    // const newCustomer = new Customer(req.body);

    // newCustomer.save()
    //     .then((user) => {
    //         console.log("Customer saved:", user);
    //         res.send("You have registered successfully");
    //     })
    //     .catch((err) => {
    //         console.error("Error saving to DB:", err);
    //         res.status(500).send("Error: " + err.message);
    //     });
});
app.get("/about", (req, res) => {
    res.render("index", {name: name})
    
})





app.listen(port, ()=> {
    console.log(`I am runnng on port ${port}`)
    
})