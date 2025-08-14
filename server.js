require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const db = require("./db/db");
const userRouter = require("./route/userRoute");
const auth = require("./middleware/authMiddleware");
const noteRouter = require("./route/noteRoute");
const caseRouter = require("./route/caseRoute");

//MIDDLEWARES START HERE
app.use(express.json());
app.use(cookieParser());

app.get("/protected", auth, (req, res) => {
  res.status(200).json({ message: "this is a protected route" });
});

//ROUTE HANDLERS
app.use("/api/Auth", userRouter);
app.use("/api/Note", noteRouter);
app.use("/api/Case", caseRouter);

const port = process.env.PORT || 60000;
app.listen(port, () => {
  console.log(`server connected on port ${port}`);
  db();
});
