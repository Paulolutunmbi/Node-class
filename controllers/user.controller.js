const Customer = require("../models/user.model");
const ejs = require('ejs')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');


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
    let salt = bcrypt.genSaltSync(10);
    let hashedPassword = bcrypt.hashSync(req.body.password, salt);
    // Overwrite the plain password with the hashed one
    req.body.password = hashedPassword;

    const user = req.body;

    const newCustomer = new Customer(user);

    newCustomer.save()
        .then((user) => {
            newCustomer.password = hashedPassword;
            console.log("Customer saved:", user);

            // Transporter means the informarion about the service you are using to send the email
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'oluwatunmbipaul@gmail.com',
                    // a special password generated from google settings not your original password
                    // Step one: Enable 2-step verification
                    // Step two: Generate app password
                    pass: 'qfbr ktsb mojj ilzq'
                }
            });

            // This is the information about the email you are sending
            let mailOptions = {
                from: 'oluwatunmbipaul@gmail.com',
                to: [user.email, "oluwatunmbipaul@gmail.com"],
                subject: 'Welcome to our Application',
                html:
                    `
                        <div style="background-color: #f4f4f4; padding: 0 0 10px; border-radius: 30px 30px 0 0  ;">
                            <div style="padding-top: 20px; height: 100px; border-radius: 30px 30px 0 0 ; background: linear-gradient(-45deg, #f89b29 0%, #ff0f7b 100% );">
                                <h1 style="color:white; text-align: center;">Welcome to our Application</h1>
                            </div>
                            <div style="padding: 30px 0; text-align: center;">
                                    <p style="font-size: 18px;"><span style="font-weight: 600;">Congratulations!</span> Your sign-up was successful!</p>
                                <p>Thank you for registering. We are excited to have you on board.</p>
                                <div style="padding: 20px 0;">
                                    <hr style="width: 50%;">
                                    <p style="margin-bottom: 10px;">Best Regards</p>
                                    <p style="color: #f89b29; margin-top: 0;">Humble</p>
                                </div>
                            </div>
                        </div>
                `

            };
            // This is what will actually send the email
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }

                return res.status(201).json({
                    message: "Signup successful",
                    user: {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    }
                });
            });

            // res.redirect("/user/signin");
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
                return res.status(400).json({ message: "Invalid email or password" })
            }
            // if (foundCustomers.password !== password) {
            //     console.log("Invalid Password");
            //     return res.status(400).json({ message: "Invalid email or password"});
            // }


            // Compare provided password with hashed one
            const isMatch = bcrypt.compareSync(password, foundCustomers.password);

            if (!isMatch) {
                console.log("Invalid Password");
                return res.status(400).json({ message: "Invalid email or password" });
            }


            // res.redirect("/user/dashboard");

            // Success
            return res.json({
                message: "Login Successful",
                user: {
                    id: foundCustomers._id,
                    email: foundCustomers.email,
                    firstName: foundCustomers.firstName,
                    lastName: foundCustomers.lastName
                }
            })



        })
        .catch((err) => {
            console.error("Error during signin:", err);
            res.status(500).send("Internal server error");
        });
}

const getAllUsers = (req, res) => {
    Customer.find()
        .then((allUsers) => {
            console.log("All users:", allUsers);
            res.status(200).json(
                {
                    message: "Registered Users",
                    users: allUsers
                }
            );
        })
        .catch((err) => {
            console.error("Error fetching users:", err);
            res.status(500).send("Internal server error");
        });
}

module.exports = { postSignup, getSignup, postSignin, getSignin, getDashboard, getAllUsers }

