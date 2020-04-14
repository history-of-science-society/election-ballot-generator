const fs = require("fs");
const path = require("path");
require("dotenv").config();
const axios = require("axios").default;
const slugify = require("slugify");

const nominees = axios
  .get("https://www.formstack.com/api/v2/form/2995119/submission.json", {
    params: {
      data: 1,
    },
    headers: { Authorization: `Bearer ${process.env.FORMSTACK_API}` },
  })
  .then(function (response) {
    const { data } = response;
    return data;
  })
  .then(function (data) {
    const nominees = [];
    for (let item of data.submissions) {
      const nominee = new Nominee(item);
      nominees.push(nominee);
    }
    const nomineeObject = {
      council: nominees
        .filter((item) => item.position === "Council")
        .sort((a, b) => (a.last > b.last ? 1 : -1)),
      secretary: nominees.filter((item) => item.position === "Secretary"),
      treasurer: nominees.filter((item) => item.position === "Treasurer"),
      delegate: nominees.filter((item) => item.position === "Council Delegate"),
      nomcom: nominees
        .filter((item) => item.position === "Nominating Committee")
        .sort((a, b) => {
          if (a.last < b.last) {
            return -1;
          }
          if (a.last > b.last) {
            return 1;
          }
          return 0;
        }),
      nominees: nominees,
      page: { medium: "is-medium", small: "" },
    };
    return nomineeObject;
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });

class Nominee {
  constructor(item) {
    this.id = item.id;
    this.position = item.data["75506963"].value;
    this.name = this.getName(item.data["61992777"].value).name;
    this.first = this.getName(item.data["61992777"].value).first;
    this.last = this.getName(item.data["61992777"].value).last;
    this.slug = slugify(this.name.toLowerCase());
    this.website = this.getWebsite(item.data["61994743"]);
    this.currentPosition = this.getMultiline(item.data["61992786"]);
    this.relatedPosition = this.getMultiline(item.data["61993103"]);
    this.hss = this.getMultiline(item.data["61992804"]);
    this.campaignStatement = this.getMultiline(item.data["75506917"]);
    this.relatedActivities = this.getMultiline(item.data["61992804"]);
    this.img = axios
      .get(
        "https://res.cloudinary.com/hss/image/fetch/" +
          encodeURIComponent(this.getValue(item.data["61994616"]))
      )
      .catch(function (error) {
        console.log(error);
      });
    this.headshot =
      "https://res.cloudinary.com/hss/image/fetch/w_600,h_600,c_fill,g_face,f_auto/" +
      this.getValue(item.data["61994616"]);
    this.pub1 = this.getPub(89179115, item.data);
    this.pub2 = this.getPub(89179410, item.data);
    this.pub3 = this.getPub(89179431, item.data);
    this.pub4 = this.getPub(89179460, item.data);
    this.pub5 = this.getPub(89179482, item.data);
    this.pub6 = this.getPub(89179505, item.data);
    this.pub7 = this.getPub(89179523, item.data);
    this.pub8 = this.getPub(89179550, item.data);
    this.pub9 = this.getPub(89179575, item.data);
    this.pub10 = this.getPub(89179596, item.data);
    this.bookUrl = this.getValue(item.data["89486549"]);
    this.bookImg = this.getValue(item.data["89486552"]);
    this.bookGallery = this.createGallery(this.bookUrl, this.bookImg);
  }

  getValue(test) {
    if (!test) {
      return null;
    }
    return test.value.trim();
  }

  getName(value) {
    const nameArray = value.split(/\n/);
    const name = {};
    name.first = nameArray[0].match(/first = ([\s\w.]+)/)[1];
    name.last = nameArray[1].match(/last = ([\s\wüç]+)/)[1];
    name.name = name.first + " " + name.last;
    return name;
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
      case null:
        return null;
      case "Book":
        const book = `${this.last}, ${this.first}. <em>${title}</em>. ${
          city ? city + ": " : ""
        }${publisher}, ${year}.`;
        return book;
      case "Chapter or other part of edited book":
        const section = `${this.last}, ${
          this.first
        }. &ldquo;${sectionTitle}.&rdquo; In <em>${title}</em>, ${
          editor ? "edited by " + editor : ""
        }${pages ? ", " + pages : ""}. ${city ? city + ": " : ""}${
          publisher ? publisher + ", " : ""
        }${year}.${doi ? " " + doi + "." : ""}`;
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
      default:
        return other;
    }
  }

  getWebsite(test) {
    const web = {
      twitter: { name: null, url: null },
      website: { name: null, url: null },
    };
    if (!test) {
      return null;
    } else {
      const twitter = RegExp("twitter|@");

      const values = test.value.split(";");
      values.forEach((url) => {
        if (twitter.test(url)) {
          web.twitter = {
            name: "@" + url.match(/\w+$/)[0],
            url: url,
          };
        }

        if (!twitter.test(url) && url)
          web.website = {
            name: this.first + " " + this.last + "'s Website",
            url: url,
          };
      });
    }
    return web;
  }

  getMultiline(test) {
    if (!test) {
      return null;
    }

    const mlArray = test.value.trim().split(";");
    return mlArray;
  }

  createGallery(url, img) {
    if (url !== null) {
      const urlArray = url.split(",");
      const imgArray = img.split(",");
      const galleryArray = [];

      urlArray.forEach((item, idx) => {
        const object = { url: item, img: imgArray[idx] };
        galleryArray.push(object);
      });

      return galleryArray;
    }
    return null;
  }
}

const ejs = require("ejs");

// Get template
const str = fs.readFileSync("src/index.ejs", "utf-8");
const ballot = fs.readFileSync("src/vote.ejs", "utf-8");
const paper = fs.readFileSync("src/paper.ejs", "utf-8");
// Compile template and render data
let template = ejs.compile(str);
let ballotTemplate = ejs.compile(ballot);
nominees.then((e) => {
  // const compiled = template(e);

  ejs.renderFile(__dirname + "/src/index.ejs", e, function (err, str) {
    fs.writeFile(path.join("dist", "index.html"), str, (err) => {
      if (err) return console.log(err);
      console.log("election data > index.html");
    });
  });

  ejs.renderFile(__dirname + "/src/vote.ejs", e, function (err, ballot) {
    fs.writeFile(path.join("dist/vote", "index.html"), ballot, (err) => {
      if (err) return console.log(err);
      console.log("ballot data > index.html");
    });
  });

  ejs.renderFile(__dirname + "/src/paper.ejs", e, function (err, paper) {
    fs.writeFile(path.join("dist/paper", "index.html"), paper, (err) => {
      if (err) return console.log(err);
      console.log("paper data > index.html");
    });
  });
});
