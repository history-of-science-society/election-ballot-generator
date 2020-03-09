const fs = require("fs");
const path = require("path");

require("dotenv").config();
const ejs = require("ejs");

const str = fs.readFileSync("src/index.ejs", "utf-8");
const data = { test: "Hiya, Buddy" };
let template = ejs.compile(str);
const compiled = template(data);
fs.writeFile(path.join("dist", "index.html"), compiled, err => {
  if (err) return console.log(err);
  console.log(compiled + " > index.html");
});
