import path from "path";
import { config } from "dotenv";

const envPath = path.resolve(process.cwd(), ".env");
config({ path: envPath });
process.env.ENV_PATH = envPath;

const folderid = process.env.WEBSITE_GDRIVE_ROOT_ID || "";
const root = process.env.WEBSITE_LOCAL_ROOT || "";
const suffix = process.env.WEBSITE_SUFFIX || "";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_NAME = process.env.GITHUB_NAME || "";
const GITHUB_EMAIL = process.env.GITHUB_EMAIL || "";
const GITHUB_OWNER = process.env.GITHUB_OWNER || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "";
const GITHUB_BRANCH = JSON.parse(process.env.GITHUB_BRANCH || "{}");
const GITHUB_COMMIT_MESSAGE =
  process.env.GITHUB_COMMIT_MESSAGE || "Update from Google Docs";
const FILE_PREFIX = process.env.FILE_PREFIX || "";
const ENV_TOKEN_VAR = "GOOGLE_DOCS_TOKEN";
const DEFAULT_OPTIONS = {
  debug: false,
  demoteheadings: true,
  folder: folderid,
  imagestarget: path.join(root || "", "assets/images"),
  keepdefaultstyle: false,
  matchpattern: "",
  pagecontext: [],
  savemarkdowntofile: true,
  savemarkdowntogithub: false,
  skipdiv: false,
  skipcodes: false,
  skipfootnotes: false,
  skipheadings: false,
  skipimages: false,
  skiplists: false,
  skipquotes: false,
  skipstyles: false,
  skiptables: false,
  suffix: suffix,
  outputdir: root,
};
export {
  DEFAULT_OPTIONS,
  ENV_TOKEN_VAR,
  FILE_PREFIX,
  GITHUB_TOKEN,
  GITHUB_NAME,
  GITHUB_EMAIL,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_COMMIT_MESSAGE,
  GITHUB_BRANCH,
};
