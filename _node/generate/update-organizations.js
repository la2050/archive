
'use strict';

let fs = require('fs');
let parse = require('csv-parse/lib/sync');
let yaml = require('js-yaml');
let mkdirp = require('mkdirp');

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

function saveMarkdown(filename, data) {

  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
`---
${yaml.safeDump(data.yaml)}
---
`
// ${data.content}


  fs.writeFileSync(filename, output, 'utf8', (err) => {
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

/*
// KUDOS: https://stackoverflow.com/questions/13006556/check-if-two-strings-share-a-common-substring-in-javascript
// Note: not fully tested, there may be bugs:
function subCompare (needle, haystack, min_substring_length) {

    // Min substring length is optional, if not given or is 0 default to 1:
    min_substring_length = min_substring_length || 1;

    // Search possible substrings from largest to smallest:
    for (let i=needle.length; i>=min_substring_length; i--) {
        for (let j=0; j <= (needle.length - i); j++) {
            let substring = needle.substr(j,i);
            let k = haystack.indexOf(substring);
            if (k != -1) {
                return {
                    found : 1,
                    substring : substring,
                    needleIndex : j,
                    haystackIndex : k
                }
            }
        }
    }
    return {
        found : 0
    }
}

function collapseSimilarTags(tags, counts) {
  const similarity = 3 // https://en.wikipedia.org/wiki/Levenshtein_distance

  let collapsedTags = []
  let collapsedTagCounts = counts
  tags.forEach(tag => {
    collapsedTags.forEach(toCompare => {
      if (tag === toCompare)
      let compare = subCompare(tag, toCompare, similarity)
      if (compare.found === 1) {
        similarValues.push(value)
      }

    })
  })
}
*/

function generateTagJSON(organizations) {
  let writePath = '../_data';

  let tags = [];
  for (let index = 0; index < organizations.length; index++) {

    // Load the contents of the file
    let data = loadMarkdown(organizations[index]);

    if (data.yaml.aidens_tags) {
      tags = tags.concat(data.yaml.aidens_tags);
    }
  }

  let simpleTags = []
  tags.forEach(tag => {
    if (tag.includes(":")) {
      let bits = tag.split(":");
      bits.forEach(bit => { 
        if (tag.includes(".")) {
          let microbits = tag.split(".");
          microbits.forEach(microbit => { 
            simpleTags.push(microbit.trim())
          })
        } else {
          simpleTags.push(bit.trim())
        }
      })
    } else {
      simpleTags.push(tag.trim())
    }
  })

  let tagCounts = {}
  let uniqueTags = simpleTags.filter(function(tag) {
    let name = tag.toLowerCase();
    if (!tagCounts[name]) {
      tagCounts[name] = 1;
      return true;
    } else {
      tagCounts[name]++;
      return false;
    }
  });

  // let uniqueTags = collapseSimilarTags(uniqueTags, tagCounts);

  uniqueTags.sort(function(a, b) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    // a must be equal to b
    return 0;
  });

  let uniqueTagWithCounts = []
  uniqueTags.forEach(tag => {
    console.log(`${tag}: ${tagCounts[tag.toLowerCase()]}`);
    uniqueTagWithCounts.push({
      tag: tag,
      count: tagCounts[tag.toLowerCase()]
    })
  })

  let output = JSON.stringify(uniqueTagWithCounts, null, 4);

  mkdirp(writePath, function (err) {
    if (err) {
      console.error(err);
    } else {
      fs.writeFileSync(writePath + '/' + 'tags.json', output, 'utf8', (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}

function processFile(filename, projects, organizations, neighborhoods) {

  // Load the contents of the file
  let data = loadMarkdown(filename);
  if (!data) return;

  // if (data.yaml.year != 2018) return;

  // data.yaml.year = year;

  // SHIM: It might be better to match by the original challenge URL instead
  let organization = organizations.filter(organization => {
    // if ((organization.title === data.yaml.organization_name)) {
    //   console.log("found a match for data.yaml.organization_name: " + data.yaml.organization_name)
    // }
    return (organization.title === data.yaml.organization_name)
  })[0]


  // SHIM: It might be better to match by the original challenge URL instead
  /*
  let project = projects.filter(project => {
    // if ((project.title === data.yaml.title)) {
    //   console.log("found a match for data.yaml.title: " + data.yaml.title)
    // }
    return (project.title === data.yaml.title)
  })[0]
  */


  // if (project && project.length > 0) {
  //   // console.dir(project)
  //   // console.log("organization: " + organization)
  // } else {
  //   console.log("couldn’t find a match for data.yaml.title: " + data.yaml.title)
  // }





  if (organization) {
    if (organization.zip && organization.zip != "" && organization.zip != "0") {
      data.yaml.zip = organization.zip
      let match = neighborhoods.filter(item => item.zip.indexOf(organization.zip.split("-")[0]) >= 0)
      // console.dir(match)
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
      if (match && match.length > 0) {
        data.yaml.neighborhood = match[0].neighborhood
          .replace(/Los Angeles \(([^\)]+)\)/g, function(match, p1, p2, p3, offset, string) {
            return p1;
          })
          .replace(" (Los Angeles)", "")
      }
    } else {
      // console.log("no zip found for organization: ")
      // console.dir(organization)
    }

    if (organization.charity_navigator_url && organization.charity_navigator_url != "" && organization.charity_navigator_url != "0") {
      data.yaml.charity_navigator_url = organization.charity_navigator_url
    }

    if (organization.aidens_tags && organization.aidens_tags != "" && organization.aidens_tags != "0") {
      let tags = organization.aidens_tags.split(",");
      tags = tags.map(string => string.trim());
      tags = tags.filter(string => (string !== "0" && string !== 0 && string !== "#N/A"));
      // console.dir(tags);
      if (tags && tags.length > 0) {
        data.yaml.aidens_tags = tags;
      }
    }

    // console.log("------------")

    saveMarkdown(filename, data);
  }


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

    return results.filter(filename => !filename.includes('.DS_Store'));
};

function updateMarkdownFiles(folder) {
  let files = getAllFilesFromFolder('../_' + folder);

  //console.log(files);

  let projectsInput = fs.readFileSync('../_data/projects-2018.csv', 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let projects = parse(projectsInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

  let organizationsInput = fs.readFileSync('../_data/organizations-2018.csv', 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let organizations = parse(organizationsInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

  let neighborhoodsInput = fs.readFileSync('../_data/neighborhoods.csv', 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let neighborhoods = parse(neighborhoodsInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

  // console.dir(neighborhoods);

  for (let index = 0; index < files.length; index++) {
    processFile(files[index], projects, organizations, neighborhoods);
  }

  generateTagJSON(files);
}

updateMarkdownFiles('organizations');


