const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });

  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  //returns boolean
  if (!username || !password) {
    return false;
  }
  //write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });

  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res
      .status(401)
      .json({ message: "Invalid login. Check username and password" });
  }

  const accessToken = jwt.sign({ data: username }, "access", {
    expiresIn: 60 * 60,
  });
  req.session.authorization = {
    accessToken,
    username,
  };

  return res.status(200).json({ message: "User successfully logged in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username =
    req.session.authorization && req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added successfully",
    book,
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization && req.session.authorization.username;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  delete book.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    book,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
