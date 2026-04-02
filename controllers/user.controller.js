const Customer = require("../models/user.model");
const ejs = require('ejs')


const getSignup = (req, res) => {
    res.render("signup");
}

const getSignin = (req, res) => {   
    res.render("signin");
}

const getDashboard = (req, res) => {
    res.render("dashboard");
}

const postSignup = (req, res) => {
    const user = req.body;
    
    const newCustomer = new Customer(user);

    newCustomer.save()
        .then((user) => {
            console.log("Customer saved:", user);
            res.redirect("/user/signin");
        })
        .catch((err) => {
            console.error("Error saving to DB:", err);
            res.status(500).send("Error: " + err.message);
        });
}

const postSignin = (req, res) => {
    const { email, password } = req.body;

    Customer.findOne({ email })
        .then((foundCustomers) => {
            if (!foundCustomers) {
                console.log("Invalid email");
                return res.status(400).json({message: "Invalid email or password"})
            } 
            // if (foundCustomers.password !== password) {
            //     console.log("Invalid Password");
            //     return res.status(400).json({ message: "Invalid email or password"});
            // }


            // Success
            console.log("Login Successful for", foundCustomers.email);


            res.redirect("/user/dashboard");



            
        })
        .catch((err) => {
            console.error("Error during signin:", err);
            res.status(500).send("Internal server error");
        });
}



module.exports = { postSignup, getSignup, postSignin, getSignin, getDashboard }
