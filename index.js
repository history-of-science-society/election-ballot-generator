const fs = require("fs");
const path = require("path");

require("dotenv").config();
const ejs = require("ejs");

// Get data
const objects = require("./src/data.json");

// Get template
const str = fs.readFileSync("src/index.ejs", "utf-8");

// Compile template and render data
let template = ejs.compile(str);
const compiled = template(objects);
fs.writeFile(path.join("dist", "index.html"), compiled, err => {
  if (err) return console.log(err);
  console.log("Election data > index.html");
});
