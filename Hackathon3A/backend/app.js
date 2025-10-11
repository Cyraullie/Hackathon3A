require("dotenv").config();
const express = require("express");
const cors = require("cors");

const aiRoutes = require("./routes/ai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Hackathon3A backend is running ");
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

