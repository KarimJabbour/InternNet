const axios = require("axios");
const express = require("express");
const app = express();
const expressip = require("express-ip");
const PORT = process.env.PORT || 5000;
const path = require("path");

// const indeed = require("indeed-scraper");
let {
  getJobsList,
  getJobsPDF,
  release,
  config,
} = require("indeed-job-scraper");

config["max-pages"] = 2; //the maximum number of visited pages
config["base-URL"] = "https://ca.indeed.com/"; //change the locality domain to restrict the search results to your country
let fs = require("fs");
// let path = require("path");

const handlebars = require("express-handlebars");
const { json } = require("body-parser");

app.engine(".hbs", handlebars({ extname: ".hbs" }));

app.set("PORT", PORT);

app.use(expressip().getIpInfoMiddleware);

app.use(express.static(path.join(__dirname, "assets")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", ".hbs");

app.get("/", function (req, res) {
  res.render("index", { title: "Jobby" });
});

app.get("/search", function (req, res) {
  queries = req.query;
  //   let url = `https://indreed.herokuapp.com/api/jobs`;
  if (queries) {
    getJobsList({
      query: queries.q,
      // fromdays: 1,
      sitetype: "employer",
      sort: "relevance",
      maxperpage: 10,
      jobType: "internship",
      location: "Montreal",
    })
      .then(function (response) {
        // console.log("RESPONSE: " + JSON.stringify(response[0]));
        let ret = [];
        // console.log(JSON.parse(JSON.stringify(response[0]))["job-title"]);

        response.forEach((object) => {
          let s = JSON.parse(JSON.stringify(object));
          let job_title = s["job-title"];
          let job_summary = s["company-name"];
          ret.push({ title: job_title, summary: job_summary });
        });

        return ret;
      })
      .then(function (response) {
        // console.log(response);
        res.render("search", {
          title: "Jobby",
          jobs: response,
        });
      })
      .then(release)
      .catch(function (error) {
        console.log(error);
      });
  } else {
    res.render("search", { title: "Jobby" });
  }
});

app.listen(app.get("PORT"), function () {
  console.log(
    "Express started on http://localhost:" +
      app.get("PORT") +
      "; press Ctrl-C to terminate."
  );
});
