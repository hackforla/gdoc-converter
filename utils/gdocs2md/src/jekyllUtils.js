const fs = require("fs");
const path = require("path");
const pkg = require("lodash");
const { writeToGitHub } = require("./githubWrite.js");
const { getData } = require("./utils.js");
const { merge: _merge } = pkg;
const {
  fetchGoogleDocObjs,
} = require("../../googleoauth2-utils/src/google-docs.js");
const { convertGDoc2ElementsObj, convertElements2MD } = require("./convert");
const {
  FILE_PREFIX,
  DEFAULT_OPTIONS,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_EMAIL,
  GITHUB_NAME,
  GITHUB_COMMIT_MESSAGE,
} = require("./constants.js");

/**
 * Update the keyValuePairs object with values from the command line
 *
 * @param {*} keyValuePairs
 */
const setObjectValuesFromParamValues = (keyValuePairs) => {
  const { argv } = process;
  const paramValues = argv.slice(2);
  paramValues.forEach((paramValue) => {
    let [key, value] = paramValue.split("=");
    if (value.toLowerCase() == "true") value = true;
    if (value.toLowerCase() == "false") value = false;
    keyValuePairs[key] = value;
  });
};

/**
 * Convert a google doc object to markdown and save
 * @param {*} gdoc
 * @returns
 */
async function processGdoc(gdoc, options) {
  const { properties } = gdoc;
  const gdocWithElements = await convertGDoc2ElementsObj({
    ...gdoc,
    options,
  });
  const jsonData = options.getData
    ? await getData(
        gdocWithElements.document.documentId,
        gdocWithElements.document.title
      )
    : {};
  gdoc.properties = { ...gdoc.properties, ...jsonData };
  let filename = jsonData.slug || properties.path;
  const prefix =
    FILE_PREFIX && !filename.startsWith(FILE_PREFIX) ? FILE_PREFIX : "";
  console.log("file previx", FILE_PREFIX, filename, prefix);
  filename = prefix + filename;
  if (options.saveGdoc) writeGdoc(options, filename, gdoc);
  if (!options.saveMarkdownToFile && !options.saveMarkdownToGitHub) return;
  const markdown = gdocWithElements.toMarkdown();
  if (options.saveMarkdownToFile) {
    await writeMarkdown(options, filename, markdown);
  }
  if (options.saveMarkdownToGitHub) {
    let githubFile = `${filename ? filename : "index"}${options.suffix}.md`;
    if (githubFile.startsWith("/")) githubFile = githubFile.substring(1);
    await writeToGitHub({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      email: GITHUB_EMAIL,
      githubName: GITHUB_NAME,
      path: githubFile,
      message: GITHUB_COMMIT_MESSAGE,
      content: markdown,
      phase_name: jsonData?.phase_name,
    });
  }
}

/**
 * Based on the options, filter google docs from specified folder and process them,
 * with final product being markdown files
 * @param {*} pluginOptions
 */
const jekyllifyDocs = async (pluginOptions) => {
  console.log("jekyllifyDocs start");
  // todo: extract to a function
  const options = _merge({}, DEFAULT_OPTIONS, pluginOptions);
  if (!options.folder) {
    throw new Error("Must provide a folder");
  }
  const gdocs = await getBasicGdocsFromDrive(options);

  // using "for" loop to avoid async issues
  // otherwise second document will start before everything is done with first
  // end results are fine with "forEach" but cleaner to have all activites done
  // before starting next
  // *** READ ABOVE BEFORE CHANGING TO "forEach" ***
  for (let i = 0; i < gdocs.length; i++) {
    await processGdoc(gdocs[i], options).catch((err) => {
      console.log("Error", err);
    });
  }
};

/**
 * Writes markdown to a file
 * @param {*} options
 * @param {*} filename
 * @param {*} markdown
 */
async function writeMarkdown(options, filename, markdown) {
  await writeContent({
    targetDir: options.targetMarkdownDir,
    suffix: options.suffix,
    filename,
    extension: "md",
    content: markdown,
    options: options,
  });
}

/**
 * Converts googledoc to json and saves to file
 * @param {*} options
 * @param {*} filename
 * @param {*} gdoc
 */
async function writeGdoc(options, filename, gdoc) {
  await writeContent({
    targetDir: options.targetGdocJson,
    suffix: options.suffix,
    filename,
    extension: "json",
    content: JSON.stringify(gdoc),
  });
}

/**
 * Filter google docs based on options
 * @param {*} options
 * @returns
 */
async function getBasicGdocsFromDrive(options) {
  let gdocs = await fetchGoogleDocObjs(options);
  // ?? TODO: change to use more standard -- prefix (--var value) instead of split =
  if (options.matchPattern) {
    gdocs = gdocs.filter(({ document }) => {
      return document.title
        .toLowerCase()
        .includes(options.matchPattern.toLowerCase());
    });
  }
  return gdocs;
}

/**
 * Saves google docs as json to use for testing.  Does not save markdown.
 * Calls jeklifyDocs with saveMarkdownToFile set to false, saveGdoc set to true
 * @param {*} pluginOptions
 */
const jsonifyDocs = async (pluginOptions) => {
  const options = _merge(
    { saveMarkdownToFile: false, saveGdoc: true },
    DEFAULT_OPTIONS,
    pluginOptions
  );
  await jekyllifyDocs(options);
};

/**
 * Saves contentto a local file.
 * @param { content, filename, target, suffix, extension }
 */
async function writeContent({
  content,
  targetDir,
  filename,
  suffix,
  extension,
  options,
}) {
  // todo: make location to write dependent on phase (draft, etc)
  // todo: create a map for status to google folder id
  //${targetDir}/${filename}${suffix}.${extension
  const file = path.join(
    targetDir,
    `${filename ? filename : "index"}${suffix}.${extension}`
  );
  const dir = path.dirname(file);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content);
}

module.exports = { setObjectValuesFromParamValues, jekyllifyDocs, jsonifyDocs };
