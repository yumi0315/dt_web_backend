const asyncHandler = require("express-async-handler");
const promisePool = require("../config/dbConnect");
const path = require("path");
const fs = require("fs");

const getImage = asyncHandler(async (req, res) => {
  const { filename } = req.body;

  const imagePath = path.join(__dirname, "..", "images", filename);
  console.log(imagePath);

  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    res.sendFile(imagePath);
  });
});

module.exports = { getImage };
