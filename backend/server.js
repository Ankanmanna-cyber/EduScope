require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eduscope")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/session", require("./routes/session"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));