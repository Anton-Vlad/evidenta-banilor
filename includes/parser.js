import { PdfReader } from "pdfreader";
import fs from "fs";
import path from "path";

// const absolutePath = path.resolve("database/raw_reports");
const REPORTS_TABLE = path.resolve("database/raw_reports");

export default class Parser {
  constructor() {
    this.resetFlags();
  }

  resetFlags(defaults = {}) {
    this.rows = {}; // indexed by y-position
    this.pages = {};
    this.results = [];
    this.canRead = false;
    this.transactionMonth = defaults.month ? defaults.month : null;
  }

  flushRows(pageNum) {
    let pageObj = [];
    Object.keys(this.rows) // => array of y-positions (type: float)
      .sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions
      .forEach((y) => {
        // console.log((rows[y] || []).join("|"))
        pageObj.push((this.rows[y] || []).join("|"));
      });

    this.pages[pageNum] = pageObj;
    this.rows = {}; // clear rows for next page
  }

  saveJson(data, filename) {
    fs.writeFile(
      REPORTS_TABLE + "/" + filename,
      JSON.stringify(data),
      (error) => {
        if (error) {
          console.error("Error writing JSON file:", error);
        } else {
          console.log("PDF converted to JSON and saved successfully.");
        }
      }
    );
  }

  parsePage(page, pageNumber = 0) {
    let rowActions = {};
    let actions = [];

    let pageId = "page-" + pageNumber;

    for (let i = 0; i < page.length; i++) {
      if (page[i].includes("Terminal:")) {
        const mainData = page[i].split(":");
        rowActions.location = mainData[1];

        continue;
      }

      if (page[i].includes(this.transactionMonth)) {
        //page[i].includes("Cumparare POS")) {

        if (Object.keys(rowActions).length > 0) {
          actions.push(rowActions);
          rowActions = {};
        }

        const mainData = page[i].split("|");

        rowActions.price = mainData[0];

        if (rowActions.price.includes("Incasare")) {
          // atentie la "Cumparare POS corectie"/ ex: aprilie 2023.pdf
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

  run(params) {
    const fileName = params.name;
    const filePath = params.path;
    const TABLE_START_DELIMITATOR = "Data";

    this.resetFlags({ month: params.month });

    new PdfReader().parseFileItems(filePath, (err, item) => {
      if (err) console.error("error:", err);
      else if (!item) {
        // Is end of pdf file
        Object.values(this.pages).forEach((page, index) => {
          this.results.push(...this.parsePage(page, index));
        });

        this.saveJson(this.results, fileName.replace(".pdf", ".json"));
      } else if (item.page) {
        // print the rows of the previous page
        this.flushRows(item.page);
      } else if (item.text) {
        if (item.text == params.pageDelimitor) {
          this.canRead = false;
        }

        if (this.canRead) {
          (this.rows[item.y] = this.rows[item.y] || []).push(item.text);
        }

        if (item.text == TABLE_START_DELIMITATOR) {
          this.canRead = true;
        }
      }
    });
  }
}
