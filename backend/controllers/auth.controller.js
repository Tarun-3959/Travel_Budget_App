const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL, // generated ethereal user
    pass: process.env.EMAIL_PASSWORD,
  },
});

const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res
        .status(406)
        .json({ errorMessage: "please provide name, email and password" });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    let user = await userModel.create({ name, email, password: hash });
    res.status(201).json({
      message: `User signed up successfully`,
      user: { userId: user._id, name, email },
    });
  } catch (error) {
    if (error.errorResponse && error.errorResponse.code == 11000) {
      return res.status(400).json({ errorMessage: "Email is already present" });
    }
    if (error._message == "User validation failed") {
      return res
        .status(406)
        .json({ errorMessage: "please provide required data or correct data" });
    }
    console.log("Error occured during sing up\n", error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong, please try again" });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ errorMessage: "please provide email and password both" });
    }
    let user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ errorMessage: "Invalid email or password" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res
        .status(404)
        .json({ errorMessage: "Invalid email or password" });
    }
    let token = jwt.sign(
      { id: user._id, email, name: user.name, role: user.role },
      process.env.ACCESS_TOKEN_SECRETE_KEY,
      {
        expiresIn: "7d",
      }
    );
    console.log("created Token:\n", token, token.length);
    res.status(200).json({
      message: `User logged in successfully`,
      token,
    });
  } catch (error) {
    console.log("Error occured during sing up\n", error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong, please try again" });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ errorMessage: "please provide email" });
  }
  try {
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ errorMessage: "User not found" });
    }
    let token = jwt.sign(
      { id: user._id, email, name: user.name },
      process.env.ACCESS_TOKEN_FOR_FORGET_PASSSWORD,
      {
        expiresIn: "15m",
      }
    );
    // send email with token link
    let link = `http://localhost:3000/auth/reset-password?token=${token}`;
    const info = await transporter.sendMail({
      from: '"Tarun kushwaha"', // sender address
      to: email, // list of receivers
      subject: "Reset the password", // Subject line
      text: `click on this link to reset your password: ${link}`,
    });
    console.log("email sent to user: ", email);
    res
      .status(200)
      .json({ message: `password reset link is sent to your email` });
  } catch (error) {
    console.log("Error occured during forget the password\n", error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong, please try again" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;
  if (!token || !password) {
    return res
      .status(400)
      .json({ errorMessage: "please provide token and password" });
  }
  try {
    let decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_FOR_FORGET_PASSSWORD,
      async (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ errorMessage: "Invalid or expired token" });
        } else {
          let user = await userModel.findById(decoded.id);
          if (!user) {
            return res.status(404).json({ errorMessage: "User not found" });
          }
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(password, salt);
          await userModel.updateOne({ _id: decoded.id }, { password: hash });
          res.status(200).json({ message: "Password is reseted successfully" });
        }
      }
    );
  } catch (error) {
    console.log("Error occured during reset the password\n", error);
    res
      .status(500)
      .json({ errorMessage: "Something went wrong, please try again" });
  }
};

module.exports = { signUp, signIn, forgetPassword, resetPassword };
