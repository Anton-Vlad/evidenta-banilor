import fs from "fs";
import Parser from "./includes/parser.js";

import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import shortid from "shortid";
shortid.characters(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@"
);

// ===========================================  PDF parser app functions ===================

const STATEMENTS_PATH = "./database/extrase_de_cont/extrase_de_cont.json";

// =========================================== END PDF parser app functions ===================

// ===========================================  File functions ===================
const storage = multer.diskStorage({
  destination: "uploads/", // Choose a folder where the files will be saved
  filename: (req, file, cb) => {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const uniqueSuffix = Date.now() + "-" + shortid.generate();
    const originalExtension = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + originalExtension);
  },
});

const uploadStatement = multer({ storage });

const formatFileSize = (sizeInBytes) => {
  const units = ["B", "KB", "MB", "GB", "TB"];

  let index = 0;
  while (sizeInBytes >= 1024 && index < units.length - 1) {
    sizeInBytes /= 1024;
    index++;
  }

  return `${sizeInBytes.toFixed(2)} ${units[index]}`;
};

const getFilesInfo = (directoryPath) => {
  let out = [];
  try {
    const files = fs.readdirSync(directoryPath);

    files.forEach((file, index) => {
      const filePath = `${directoryPath}/${file}`;
      const stats = fs.statSync(filePath);

      console.log("File Name:", file);
      console.log("File Size:", stats.size);
      console.log("File Modified Date:", stats.mtime);
      console.log("---");

      out.push({
        id: index + 1,
        name: file,
        size: formatFileSize(stats.size),
        modified_at: stats.mtime,
      });
    });

    return out;
  } catch (err) {
    console.error("Error reading directory:", err);
    return null;
  }
};
// ===========================================  END File functions ===================

// ===========================================  SERVER functions ===================
const app = express();
const port = 3000; // Choose a suitable port

// Add your API routes and logic here

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

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
app.post("/upload", uploadStatement.single("extras"), (req, res) => {
  try {
    if (req.file) {
      // Salvez extrasul brut, de la user
      // Am acces la req.file;

      // Creez entry-ul in database/extra_de_cont pentru meta datele extrasului
      let extra_de_cont_data = fs.readFileSync(STATEMENTS_PATH);

      // Parse the JSON data
      extra_de_cont_data = JSON.parse(extra_de_cont_data);

      let fileId = req.file.filename.split("-")[2].split(".")[0];

      extra_de_cont_data.push({
        id: fileId,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        path: req.file.path,
        size: formatFileSize(req.file.size),
        name: req.file.filename,
        uploadedAt: new Date(),
        month: null,
        year: null,
        bank: null,
        bankAccount: null,
        pageDelimitor: null,
      });

      let newJsonData = JSON.stringify(extra_de_cont_data);
      fs.writeFileSync(STATEMENTS_PATH, newJsonData);

      // Return the JSON data as response
      res.json(extra_de_cont_data);

      // De aici se duce la alt buton, alta ruta,  Edit extras => completarea detaliilor lipsa / parametrii necesari pentru procesare.

      // let jsonFilePath2 =
      //   "./rapoarte/" + req.file.filename.replace(".pdf", "") + ".json";

      // // Logica de procesare fisier, dupa ce am toate meta datele necesare.
      // run({ filename: req.file.filename });
      // fs.readFile(jsonFilePath2, "utf8", (err, data) => {
      //   if (err) {
      //     console.error(err);
      //     res.status(500).json({ error: "Error occurred while reading file." });
      //   } else {
      //     // Parse the JSON data
      //     const jsonData = JSON.parse(data);

      //     // Return the JSON data as response
      //     res.json(jsonData);
      //   }
      // });
    } else {
      res.status(400).json({ error: "No file uploaded." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error occurred while uploading file." });
  }
});

app.post("/generate-report", (req, res) => {
  const statementId = req.body.id;

  if (!statementId) {
    return res.status(404).json({ error: "Statement metadata not found." });
  }

  // Get the statement metadata
  let statementMetadataList = fs.readFileSync(STATEMENTS_PATH);
  statementMetadataList = JSON.parse(statementMetadataList);

  let statementMetadata = statementMetadataList.filter(
    (x) => x.id == statementId
  );
  statementMetadata = statementMetadata.length ? statementMetadata[0] : null;

  // nu stii cat dureaza
  const parserC = new Parser();
  parserC.run(statementMetadata);

  return res.status(200).json({ success: "Report generated successfully." });
});

// Handle read existing report files
app.get("/existing-reports", (req, res) => {
  try {
    let files = getFilesInfo("./database/raw_reports");
    res.json({ files });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error occurred while retrieving files." });
  }
});

app.get("/statements", (req, res) => {
  // Get the dabase statmenst
  let extra_de_cont_data = fs.readFileSync(STATEMENTS_PATH);
  extra_de_cont_data = JSON.parse(extra_de_cont_data);

  res.json(extra_de_cont_data);
});
app.post("/edit-statement", (req, res) => {
  const requestBody = req.body;

  // Get the dabase statmenst
  let extra_de_cont_data = fs.readFileSync(STATEMENTS_PATH);
  extra_de_cont_data = JSON.parse(extra_de_cont_data);

  // Save the new statement data
  let newDataID = requestBody.id;

  const new_extra_de_cont_data = extra_de_cont_data.map((obj) => {
    if (obj.id == newDataID) {
      return requestBody;
    } else {
      return obj;
    }
  });

  let newJsonData = JSON.stringify(new_extra_de_cont_data);
  fs.writeFileSync(STATEMENTS_PATH, newJsonData);

  res.json(requestBody);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// ===========================================  END SERVER functions ===================
