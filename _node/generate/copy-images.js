
'use strict';

let fs = require('fs');
let yaml = require('js-yaml');

function getYaml(text, filename) {
  const DELIMITER = '---';
  let items = text.split(DELIMITER);
  if (items.length === 3) {
    return items[1];
  } else {
    console.log('unexpected markdown format detected');
    console.log(items.length);
    console.log(text);
    console.log(filename);
  }
}

function getContent(text, filename) {
  const DELIMITER = '---';
  let items = text.split(DELIMITER);
  if (items.length === 3) {
    return items[2];
  } else {
    console.log('unexpected markdown format detected');
    console.log(items.length);
    console.log(text);
  }
}


function loadMarkdown(filename) {
  let input = fs.readFileSync(filename, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options

  // Get document, or throw exception on error 
  try {
    let text = fs.readFileSync(filename, 'utf8');
    let yamlText = getYaml(text, filename);
    let contentText = getContent(text, filename);

    if (!yamlText || !contentText) return;

    let data = {}
    data.yaml = yaml.safeLoad(yamlText);
    data.content = contentText;
    return data;

  } catch (e) {
    console.log(e);
  }
}


function getMatchingFile(application_id) {
  // console.dir(submissionFiles);
  for (let index = 0; index < submissionFiles.length; index++) {
    if (submissionFiles[index].indexOf(application_id) >= 0 &&
        submissionFiles[index].indexOf('.pdf') < 0) {
        return submissionFiles[index];
    }
  }
}


function processFile(filename) {

  // Load the contents of the file
  let data = loadMarkdown(filename).yaml;
  if (!data) return;

  // console.log('data.application_id: ' + data.application_id);

  // Get the application ID
  // Look for the image folder that matches
  let fromFilePath = getMatchingFile(data.application_id);

  if (!fromFilePath) {
    console.log('couldn’t find a matching image file for: ' + filename + ' with application_id: ' + data.application_id);
    return;
  }

  console.log('found a matching file: ' + fromFilePath);

  let imageExtension = fromFilePath.split('.')[fromFilePath.split('.').length - 1];

  let markdownFilename = filename.split('/');
  let toImageName = markdownFilename[markdownFilename.length - 1].replace(/md$/, imageExtension)

  // Copy the image inside that folder to /assets-submission-images/<markdown-filename>.<file ext>
  let toFilePath = `./assets-submissions-images/${data.category}/${toImageName}`;

  // https://stackoverflow.com/questions/4980243/how-to-copy-a-file#11334246
  // let fromFile = fs.createWriteStream(fromFilePath); 
  // let toFile   = fs.createReadStream(toFilePath);

  // fromFile.on('end', function(){ console.log('copied image successfully to ' + toFilePath) });

  // fromFile.pipe(toFile);

  let encoding = 'binary';
  let content = fs.readFileSync(fromFilePath, encoding);
  // console.log('content: ' + content);
  fs.writeFileSync(toFilePath, content, encoding);

  // Use image magic to make images smaller (and normalize to JPG?)
}


// https://stackoverflow.com/questions/20822273/best-way-to-get-folder-and-file-list-in-javascript#21459809
function getAllFilesFromFolder(dir) {

    let filesystem = require("fs");
    let results = [];

    filesystem.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file;
        let stat = filesystem.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFilesFromFolder(file))
        } else results.push(file);

    });

    return results;

};


function updateLocations(folder) {

  // Get a list of markdown files
  let locations = getAllFilesFromFolder(folder);

  console.log(locations);

  // For each location file
  for (let index = 0; index < locations.length; index++) {
    processFile(/*folder + '/' + */locations[index]);
  }
}

let submissionFiles = getAllFilesFromFolder('./assets-submissions');

updateLocations('./_learn');
updateLocations('./_create');
updateLocations('./_play');
updateLocations('./_connect');
updateLocations('./_live');
