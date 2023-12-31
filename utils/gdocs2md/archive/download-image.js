var fs = require("fs"),
  axios = require("axios");

var path = require("path");

var downloadImageFromURL = async (url, filename, callback) => {
  // const url = "https://unsplash.com/photos/AaEQmoufHLk/download?force=true";
  // TODO: try jpeg
  const dir = path.dirname(filename);

  fs.mkdirSync(dir, { recursive: true });
  // console.log("Downloading image", filename);
  const writer = fs.createWriteStream(filename);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

module.exports = { downloadImageFromURL };
