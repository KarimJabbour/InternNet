const axios = require("axios");
const express = require("express");
const app = express();
const expressip = require("express-ip");
const PORT = process.env.PORT || 80;
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

// app.get("/", function (req, res) {
//   res.render("index", { title: "Intern Net" });
// });

app.get("/", function (req, res) {
  queries = req.query;
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
        let ret = [];
        // console.log(JSON.stringify(response[0]));
        response.forEach((object) => {
          let s = JSON.parse(JSON.stringify(object));
          let job_title = s["job-title"];
          let job_company = s["company-name"];
          let job_link = s["job-link"];
          let job_location = s["company-location"];
          let job_salary = s["job-salary"];
          let job_desc = s["job-snippet"];
          let job_posted = s["post-date"];
          ret.push({
            title: job_title,
            company: job_company,
            link: job_link,
            desc: job_desc,
            location: job_location,
            salary: job_salary,
            posted: job_posted,
          });
        });

        return ret;
      })
      .then(function (response) {
        res.render("search", {
          title: "InternNet",
          jobs: response,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  } else {
    res.render("search", { title: "InternNet" });
  }
});

app.listen(app.get("PORT"), function () {
  console.log(
    "Express started on http://localhost:" +
      app.get("PORT") +
      "; press Ctrl-C to terminate."
  );
});
