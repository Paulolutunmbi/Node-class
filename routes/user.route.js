const express = require("express");
const router = express.Router();
const { postSignup, getSignup, postSignin, getSignin, getDashboardPage, getDashboard, getAllUsers } = require("../controllers/user.controller");

router.get("/signup", getSignup);
router.post("/register", postSignup);
router.get("/signin", getSignin);
router.post("/login", postSignin);
router.get("/dashboard", getDashboardPage);
router.get("/dashboard-data", getDashboard);
router.get("/registeredUsers", getAllUsers)

module.exports = router;