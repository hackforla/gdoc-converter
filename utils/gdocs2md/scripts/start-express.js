import express from "express";
import path from "path";
import { jekyllifyDocs } from "../src/jekyllUtils.js";
import { config } from "dotenv";
const envPath = path.resolve(process.cwd(), ".env");
config({ path: envPath }); // specifies the path to your .env file
process.env.ENV_PATH = envPath;

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/convert-all", (req, res) => {
  // default options saveGdoc is false, savemarkdowntofile is true
  jekyllifyDocs({});
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
