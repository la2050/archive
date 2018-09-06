
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
  // let input = fs.readFileSync(filename, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options

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

let writtenFileNames = {}


/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function saveMarkdown(filepath, data) {
  // console.log('filename')
  // console.log(filename);

  // console.dir(data);

  /*

projects:
  - 
    uri: /connect/big-citizen-hub/
    category: connect
    title: >-
      Big Citizen HUB: Building a pipeline of social change makers via leadership
      and community service
    project_description: >-
      Big Citizen HUB will connect 236 diverse young people, ages 11-26, from all
      across Los Angeles for 22 Saturdays to learn about our communities and address
      local issues through service.
    project_image: https://skild-prod.s3.amazonaws.com/myla2050/images/custom540/9500569955741-team90.jpg
  - 
    uri: /live/big-citizen-hub/
    category: live
    title: >-
      Invest in Youth Coalition: Advocating for a Los Angeles that prioritizes young
      people
    project_description: >-
      We demand an equitable strategy and coordinated approach to comprehensive
      youth development, led by a city department focused on creating prosperity for
      all of LA’s young people.
    project_image: https://activation.la2050.org/assets/images/live/2048-wide/big-citizen-hub.jpg
  */

  data.yaml.projects = [
    {
      uri: data.yaml.uri,
      category: data.yaml.category,
      title: data.yaml.title,
      project_description: data.yaml.project_description,
      project_image: data.yaml.plan_id ? 
        "https://skild-prod.s3.amazonaws.com/myla2050/images/custom540/" + data.yaml.project_image :
        "https://activation.la2050.org/assets/images/live/2048-wide/"    + data.yaml.project_image
    }
  ]



  let names = filepath.split("/");
  let filename = names[names.length - 1];

  if (writtenFileNames[filename]) {
    console.log(`duplicate file name detected: ${filename}`);

    data.yaml.projects = data.yaml.projects.concat(writtenFileNames[filename]);

    writtenFileNames[filename] = data.yaml.projects;

  } else {
    writtenFileNames[filename] = data.yaml.projects;
  }


  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
`---
${yaml.safeDump(data.yaml)}
---
`
// ${data.content}

//console.log(output);
//return;


  fs.writeFileSync(`../_organizations/${filename}`, output, 'utf8', (err) => {
    if (err) {
      console.log(err);
    }
  });
}

function getArrayFromString(string) {
  if (!string) return []

  string = string
    .replace('undefined:1', '')
    .replace("\"open spaces\"", "“open spaces”")
    .replace(/^"/g, '')  // Remove leading quote
    .replace(/"$/g, '')  // Remove trailing quote
    .replace(/', '/g, '", "') // Change single quotes into double quotes (since that’s require for valid JSON)
    .replace(/', "/g, '", "')
    .replace(/", '/g, '", "')
    .replace(/\['/g, '["')
    .replace(/'\]/g, '"]');
  //string = `${string}`.replace(/'/g, '"');
  console.log('parsing JSON string: ' + string);
  console.log('');
  console.log('');
  console.log('');
  return JSON.parse(string);
}

function convertStringsToJSON(data) {
  console.log('before: ' + data.category_metrics);
  data.category_metrics = getArrayFromString(data.category_metrics);
  console.log('after: ' + data.category_metrics);
  console.log('before: ' + data.category_other);
  data.category_other   = getArrayFromString(data.category_other);
  console.log('after: ' + data.category_metrics);
  return data;
}

// https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript#46181
function isEmailAddress(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function addMailTo(data) {
  for (var prop in data) {
    if (isEmailAddress(data[prop])) {
      data[prop] = `mailto:${data[prop]}`
    }
  }
  return data;
}

function changeNAtoEmpty(data) {
  for (var prop in data) {
    if (typeof(data[prop]) === 'string' && (data[prop].toLowerCase() === 'n/a' || data[prop].toLowerCase() === 'none')) {
      data[prop] = ''
    }
  }

  return data;
}

function is_valid_url(url) {
  return url.match(/^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/);
}

function processFile(filename) {

  // Load the contents of the file
  let data = loadMarkdown(filename);
  if (!data) return;

  saveMarkdown(filename, data);
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

function updateMarkdownFiles(folder) {
  let files = getAllFilesFromFolder('../_' + folder);

  //console.log(files);

  for (let index = 0; index < files.length; index++) {
    if (files[index].indexOf('.DS_Store') >= 0) continue;

    let names = files[index].split("/");
    let fileName = names[names.length - 1];

    processFile(files[index]);
  }
}

updateMarkdownFiles('learn');
updateMarkdownFiles('create');
updateMarkdownFiles('play');
updateMarkdownFiles('connect');
updateMarkdownFiles('live');




