import { DEFAULT_OPTIONS } from "./constants";
import { merge } from "lodash";

import {
  fetchGdocsPropertiesFromTopFolder,
  fetchAndSetGdocsContent,
} from "./multi-gdocs";
import { GdocObj } from "./gdoc-obj";
import { saveMarkdown, saveContentToFile } from "./save";
import { deriveMarkdown } from "./single-gdoc";
import { ioptions } from "./ioptions";

/**
 * Based on the options, filter google docs from specified folder and process them,
 * with final product being markdown files
 * @param {*} customOptions
 */

export async function fetchGdocs(customOptions: any) {
  const options: ioptions = merge({}, DEFAULT_OPTIONS, customOptions);
  const gdocs = await fetchGdocsPropertiesFromTopFolder(options);
  await fetchAndSetGdocsContent(gdocs);
  return gdocs;
}

export async function deriveAndSaveMarkdowns(options: ioptions) {
  const gdocs = await fetchGdocs(options);
  for (const gdoc of gdocs) {
    const gdocObj = new GdocObj(gdoc);
    gdocObj.setElements({}, options);
    const { filename, markdown, phase_name } = deriveMarkdown(gdocObj, options);
    const filedata = {
      filename,
      content: markdown,
      extension: "md",
      branch: phase_name,
    };
    await saveMarkdown(filedata, options);
  }
}

export async function deriveAndSaveElements(options: ioptions) {
  const gdocs = await fetchGdocs(options);
  for (const gdoc of gdocs) {
    const gdocObj = new GdocObj(gdoc);
    gdocObj.setElements({}, options);
    const filename = gdocObj.properties.name;
    const content = JSON.stringify(gdocObj.elements);
    const filedata = { filename, content, extension: "elements.json" };
    await saveContentToFile(filedata, options);
  }
}

export async function saveGdocs(options: any) {
  const gdocs = await fetchGdocs(options);
  for (const gdoc of gdocs) {
    const filedata = {
      filename: gdoc.properties.name,
      content: JSON.stringify(gdoc),
      extension: "md",
    };
    await saveContentToFile(filedata, options);
  }
}
