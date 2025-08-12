require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./db/db");

app.get("/test", (req, res) => {
  res.status(200).json({ message: "testing entry point" });
});

const port = process.env.PORT || 60000;
app.listen(port, () => {
  console.log(`server connected on port ${port}`);
  db();
});
