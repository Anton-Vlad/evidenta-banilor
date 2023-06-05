import { PdfReader } from "pdfreader";
import fs from "fs";

import express from "express";
import multer from "multer";

let rows = {}; // indexed by y-position
let pages = {};
let results = [];
let canRead = false;

const transactionMonth = "mai";
const transactionYear = "2023";

// const pdfFilePath = "./docs/mai_2023.pdf";
const jsonFilePath =
  "./rapoarte/raport-" + transactionMonth + "-" + transactionYear + ".json";

function flushRows(pageNum) {
  let pageObj = [];
  Object.keys(rows) // => array of y-positions (type: float)
    .sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions
    .forEach((y) => {
      // console.log((rows[y] || []).join("|"))
      pageObj.push((rows[y] || []).join("|"));
    });

  pages[pageNum] = pageObj;
  rows = {}; // clear rows for next page
}

function saveJson(data, filename) {
  fs.writeFile("./rapoarte/" + filename, JSON.stringify(data), (error) => {
    if (error) {
      console.error("Error writing JSON file:", error);
    } else {
      console.log("PDF converted to JSON and saved successfully.");
    }
  });
}

function parsePage(page, pageNumber = 0) {
  let rowActions = {};
  let actions = [];

  let pageId = "page-" + pageNumber;

  for (let i = 0; i < page.length; i++) {
    if (page[i].includes("Terminal:")) {
      const mainData = page[i].split(":");
      rowActions.location = mainData[1];

      continue;
    }

    if (page[i].includes(transactionMonth)) {
      //page[i].includes("Cumparare POS")) {

      if (Object.keys(rowActions).length > 0) {
        actions.push(rowActions);
        rowActions = {};
      }

      const mainData = page[i].split("|");

      rowActions.price = mainData[0];

      if (rowActions.price.includes("Incasare")) {
        // Logica de Incasare
        rowActions.price = mainData[2];
        rowActions.type = mainData[0];
        rowActions.date = mainData[1];
      } else {
        // Logica implicita de debit
        rowActions.type = mainData[1];
        rowActions.date = mainData[2];
      }

      rowActions.details = [];
      rowActions.id = pageId + "" + i;

      continue;
    }

    if (rowActions.details != undefined) {
      rowActions.details.push(page[i]);
    }

    if (i == page.length - 1) {
      if (Object.keys(rowActions).length > 0) {
        actions.push(rowActions);
        rowActions = {};
      }
    }
  }

  //   console.log(actions);

  return actions;
}

function run(params) {
  const filename = params.filename;

  new PdfReader().parseFileItems("./uploads/" + filename, (err, item) => {
    if (err) console.error("error:", err);
    else if (!item) {
      // console.log(pages)
      Object.values(pages).forEach((page, index) => {
        // if (index < 6 && index > 4) {
        //   console.log("PAGE CONTENT " + index, page);
        results.push(...parsePage(page, index));
        // }
      });

      saveJson(results, filename.replace(".pdf", ".json"));
      console.warn("end of file");
    } else if (item.page) {
      flushRows(item.page); // print the rows of the previous page
      //   console.log("PAGE:", item.page);
    } else if (item.text) {
      if (item.text == "Roxana Petria") {
        canRead = false;
      }

      if (canRead) {
        // console.log(item.text);

        (rows[item.y] = rows[item.y] || []).push(item.text);
      }

      if (item.text == "Data") {
        canRead = true;
      }
    }
  });
}

// run(params);

// const express = require("express");
const app = express();
const port = 3000; // Choose a suitable port

// Add your API routes and logic here

const storage = multer.diskStorage({
  destination: "uploads/", // Choose a folder where the files will be saved
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Adjust the origin value as needed
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Handle file upload endpoint
app.post("/upload", upload.single("pdfFile"), (req, res) => {
  try {
    if (req.file) {
      // Perform any asynchronous operations here
      run({ filename: req.file.filename });

      let jsonFilePath2 =
        "./rapoarte/" + req.file.filename.replace(".pdf", "") + ".json";

      fs.readFile(jsonFilePath2, "utf8", (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Error occurred while reading file." });
        } else {
          // Parse the JSON data
          const jsonData = JSON.parse(data);

          // Return the JSON data as response
          res.json(jsonData);
        }
      });
    } else {
      res.status(400).json({ error: "No file uploaded." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error occurred while uploading file." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
