const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();
const bcrypt = require("bcryptjs");
const Products = require("./Products");
const Users = require("./Users");
const Orders = require("./Orders");
const stripe = require("stripe")(
  "sk_test_51KUDBXSE1AGsrDtwPrEyIlUO6MdKE5YUC77sdqUjLmrwjiEXxcGQPtkEDYlKmlaT6Ll0IIfMtBxaRYoWTEfdXYAh00tng8EKHY"
);

const app = express();
const port = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(cors());

// connection url
const connection_url = process.env.MONGO_URL; // Correctly assign the URI string

mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error("Connection error:", error));
db.once("open", () => console.log("Connected to MongoDB database"));

// API
app.get("/", (req, res) => res.status(200).send("Home Page"));

// Health check endpoint for database
app.get("/db-status", async (req, res) => {
  try {
    const result = await Products.findOne(); // or any collection
    if (result) {
      res.status(200).send("Database connection is healthy");
    } else {
      res.status(200).send("Database is empty, but connection is healthy");
    }
  } catch (error) {
    res.status(500).send("Database connection error: " + error.message);
  }
});

// add product
app.post("/products/add", (req, res) => {
  const productDetail = req.body;

  console.log("Product Detail >>>>", productDetail);

  Products.create(productDetail, (err, data) => {
    if (err) {
      res.status(500).send(err.message);
      console.log(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.get("/products/get", (req, res) => {
  Products.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

// API for SIGNUP
app.post("/auth/signup", async (req, res) => {
  const { email, password, fullName } = req.body;

  const encrypt_password = await bcrypt.hash(password, 10);

  const userDetail = {
    email: email,
    password: encrypt_password,
    fullName: fullName,
  };

  const user_exist = await Users.findOne({ email: email });

  if (user_exist) {
    res.send({ message: "The Email is already in use !" });
  } else {
    Users.create(userDetail, (err, result) => {
      if (err) {
        res.status(500).send({ message: err.message });
      } else {
        res.send({ message: "User Created Succesfully" });
      }
    });
  }
});

// API for LOGIN
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const userDetail = await Users.findOne({ email: email });

  if (userDetail) {
    if (await bcrypt.compare(password, userDetail.password)) {
      res.send(userDetail);
    } else {
      res.send({ error: "invaild Password" });
    }
  } else {
    res.send({ error: "user is not exist" });
  }
});

// API for PAYMENT
app.post("/payment/create", async (req, res) => {
  const total = req.body.amount;
  console.log("Payment Request received for this amount:", total);

  const payment = await stripe.paymentIntents.create({
    amount: total * 100,
    currency: "inr",
  });

  res.status(201).send({
    clientSecret: payment.client_secret,
  });
});

// API TO add ORDER DETAILS
app.post("/orders/add", (req, res) => {
  const products = req.body.basket;
  const price = req.body.price;
  const email = req.body.email;
  const address = req.body.address;

  const orderDetail = {
    products: products,
    price: price,
    address: address,
    email: email,
  };

  Orders.create(orderDetail, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send({ message: "Error adding order to database" });
    } else {
      console.log("Order added to database:", result);
      res.status(201).send({ message: "Order added successfully" });
    }
  });
});

app.post("/orders/get", (req, res) => {
  const email = req.body.email;

  Orders.find({ email: email }, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send({ message: "Error fetching orders from database" });
    } else {
      res.status(200).send(result);
    }
  });
});

app.listen(port, () => console.log("Listening on port", port));
