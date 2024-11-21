require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const app = express();
const User = require("./userModel");

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.get("/", (req, res) => {
  try {
    res.render("home");
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.render("home", { error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("home", { error: "Invalid Password" });
    }

    return res.render("dashboard");
  } catch (error) {
    console.error("Error during login:", error);
    return res.render("home", { error: "Internal server error" });
  }
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const checking = await User.findOne({ username });

    if (checking) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("*", (req, res) => {
  res.status(404).render("404");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
