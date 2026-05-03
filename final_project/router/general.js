const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const baseUrl = "http://127.0.0.1:4000";

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered" });
});

// Internal endpoint used by the async routes below so Axios can fetch the book data.
public_users.get("/allbooks", function (req, res) {
  return res.status(200).json(books);
});

// Get the book list available in the shop using async/await with Axios.
public_users.get("/", async function (req, res) {
  try {
    const response = await axios.get(`${baseUrl}/allbooks`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch books" });
  }
});

// Get book details based on ISBN using the shared async Axios fetch.
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`${baseUrl}/allbooks`);
    const book = response.data[isbn];

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch book details" });
  }
});

// Get book details based on author using case-insensitive matching.
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author.toLowerCase();
    const response = await axios.get(`${baseUrl}/allbooks`);
    const booksObject = Object.values(response.data);
    const filteredBooks = booksObject.filter(
      (b) => b.author.toLowerCase() === author,
    );

    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch book details" });
  }
});

// Get all books based on title using case-insensitive matching.
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title.toLowerCase();
    const response = await axios.get(`${baseUrl}/allbooks`);
    const booksObject = Object.values(response.data);
    const filteredBooks = booksObject.filter(
      (b) => b.title.toLowerCase() === title,
    );

    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch book details" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
