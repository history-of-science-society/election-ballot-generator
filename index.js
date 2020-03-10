const fs = require("fs");
const path = require("path");
require("dotenv").config();
const axios = require("axios").default;
const icons = require("evil-icons");
const iconPack = {
  sprite: icons.sprite,
  twitter: icons.icon("ei-sc-twitter", { size: "s", class: "nominee__icon" }),
  website: icons.icon("ei-external-link", { size: "s", class: "nominee__icon" })
};
const nominees = axios
  .get("https://www.formstack.com/api/v2/form/2995119/submission.json", {
    params: {
      data: 1
    },
    headers: { Authorization: `Bearer ${process.env.FORMSTACK_API}` }
  })
  .then(function(response) {
    const { data } = response;
    return data;
  })
  .catch(function(error) {
    // handle error
    console.log(error);
  })
  .then(function(data) {
    const nominees = [];
    for (let item of data.submissions) {
      const nominee = new Nominee(item);
      nominees.push(nominee);
    }
    const nomineeObject = {
      council: nominees.filter(item => item.position === "Council"),
      secretary: nominees.filter(item => item.position === "Secretary"),
      nominees: nominees,
      sprite: { icons: iconPack.sprite }
    };
    return nomineeObject;
  });

class Nominee {
  constructor(item) {
    this.id = item.id;
    this.position = item.data["75506963"].value;
    this.name = this.getName(item.data["61992777"].value).name;
    this.first = this.getName(item.data["61992777"].value).first;
    this.last = this.getName(item.data["61992777"].value).last;
    this.website = this.getWebsite(item.data["61994743"]);
    this.currentPosition = this.getMultiline(item.data["61992786"]);
    this.relatedPosition = this.getMultiline(item.data["61993103"]);
    this.hss = this.getMultiline(item.data["61992804"]);
    this.campaignStatement = this.getMultiline(item.data["75506917"]);
    this.relatedActivities = this.getMultiline(item.data["61992804"]);
    this.headshot = this.getValue(item.data["61994616"]);
    this.pub1 = this.getPub(89179115, item.data);
    this.pub2 = this.getPub(89179410, item.data);
    this.pub3 = this.getPub(89179430, item.data);
    this.pub4 = this.getPub(89179431, item.data);
    this.pub5 = this.getPub(89179482, item.data);
    this.pub6 = this.getPub(89179505, item.data);
    this.pub7 = this.getPub(89179523, item.data);
    this.pub8 = this.getPub(89179550, item.data);
    this.pub9 = this.getPub(89179575, item.data);
    this.pub10 = this.getPub(89179596, item.data);
  }

  getValue(test) {
    if (!test) {
      return null;
    }
    return test.value.trim();
  }

  getName(value) {
    const first = value.match(/first = (\w+)/)[1];
    const last = value.match(/\w+$/)[0];
    return { name: first + " " + last, first: first, last: last };
  }

  getPub(type, data) {
    const pubType = this.getValue(data[type]);
    const sectionTitle = this.getValue(data[type + 4]);
    const title = this.getValue(data[type + 5]);
    const editor = this.getValue(data[type + 6]);
    const city = this.getValue(data[type + 7]);
    const publisher = this.getValue(data[type + 8]);
    const vol = this.getValue(data[type + 9]);
    const num = this.getValue(data[type + 10]);
    const season = this.getValue(data[type + 11]);
    const year = this.getValue(data[type + 12]);
    const pages = this.getValue(data[type + 13]);
    const doi = this.getValue(data[type + 14]);
    const other = this.getValue(data[type + 15]);

    switch (pubType) {
      case "Book":
        const book = `${this.last}, ${this.first}. <em>${title}</em>. ${
          city ? city + ": " : ""
        }${publisher}, ${year}.`;
        return book;
      case "Chapter or other part of edited book":
        const section = `${this.last}, ${
          this.first
        }. &ldquo;${sectionTitle}.&rdquo; In <em>${title}</em>, ${
          editor ? "edited by " + editor + ", " : ""
        }${pages ? pages : ""}. ${
          city ? city + ": " : ""
        }${publisher}, ${year}.${doi ? " " + doi + "." : ""}`;
        return section;
      case "Journal article":
        const article = `${this.last}, ${
          this.first
        }. &ldquo;${sectionTitle}.&rdquo; <em>${title}</em> ${vol ? vol : ""}${
          num ? ", no. " + num : ""
        } (${season ? season + " " : ""}${year})${pages ? ": " + pages : ""}.${
          doi ? " " + doi + "." : ""
        }`;
        return article;
      case "Other":
        return other;
      default:
        return null;
    }
  }

  getWebsite(test) {
    if (!test) {
      return null;
    } else {
      const twitter = RegExp("twitter|@");

      if (twitter.test(test.value)) {
        const ending = test.value.match(/(\w+)\/?$/);
        return {
          source: "twitter",
          url: test.value,
          icon: iconPack.twitter
        };
      }
      return {
        source: "website",
        url: test.value,
        icon: iconPack.website
      };
    }
  }

  getMultiline(test) {
    if (!test) {
      return null;
    }

    const mlArray = test.value.trim().split(/\r\n/);
    return mlArray;
  }
}

const ejs = require("ejs");

// Get template
const str = fs.readFileSync("src/index.ejs", "utf-8");

// Compile template and render data
let template = ejs.compile(str);
nominees.then(e => {
  const compiled = template(e);
  fs.writeFile(path.join("dist", "index.html"), compiled, err => {
    if (err) return console.log(err);
    console.log("Election data > index.html");
  });
});
