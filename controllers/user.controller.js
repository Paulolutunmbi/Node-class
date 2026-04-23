const Customer = require("../models/user.model");
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;


const getSignup = (req, res) => {
    res.render("signup");
}

const getSignin = (req, res) => {
    res.render("signin");
}

const getDashboardPage = (req, res) => {
    res.render("dashboard");
}

const postSignup = (req, res) => {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    delete req.body.confirmPassword;

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
                    user: process.env.MAIL_USER,
                    // Use app password from environment variables.
                    pass: process.env.MAIL_PASS
                }
            });

            // This is the information about the email you are sending
            let mailOptions = {
                from: process.env.MAIL_USER,
                to: [user.email, process.env.MAIL_USER],
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


const getDashboard = (req, res) => {
    if (!JWT_SECRET) {
        return res.status(500).json({ message: "JWT secret is not configured" });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization token is missing" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        } else {
        // Token is valid, proceed with the request
        console.log("Decoded User:", decoded);
        let userEmail = decoded.email;

        // Fetch user details from the database using the email
        Customer.findOne({ email: userEmail })
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.status(200).json({ message: "Dashboard accessed successfully", user: user });
            })
            .catch((err) => {
                console.error("Error fetching user:", err);
                res.status(500).send("Internal server error");
            });
        }
    });
};

const postSignin = (req, res) => {
    const { email, password } = req.body;

    if (!JWT_SECRET) {
        return res.status(500).json({ message: "JWT secret is not configured" });
    }

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
            const token = jwt.sign({ email: foundCustomers.email, id: foundCustomers._id }, JWT_SECRET, { expiresIn: '1h' });
            console.log("Generated Token", token);

            // Success
            return res.json({
                message: "Login Successful",
                token: token,
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

module.exports = { postSignup, getSignup, postSignin, getSignin, getDashboardPage, getDashboard, getAllUsers }

