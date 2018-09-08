'use strict';

let fs = require('fs');
let mkdirp = require('mkdirp');
let parse = require('csv-parse/lib/sync');
let yaml = require('js-yaml');
// let request = require("request");

function stringToURI(str) {
  return String(str).toLowerCase()
    .replace(/\s/g, '-')
    .replace(/\//g, '-')
    .replace(/\&/g, '-')
    .replace(/\./g, '-')
    .replace(/\:/g, '-')
    .replace(/\|/g, '-')
    .replace(/\_/g, '-')
    .replace(/\,/g, "-")
    .replace(/\+/g, "-")
    .replace(/\r\n?/, '-')
    .replace(/\'/g, '')
    .replace(/\‘/g, '')
    .replace(/\’/g, '')
    .replace(/\“/g, '')
    .replace(/\”/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/\{/g, '')
    .replace(/\}/g, '')
    .replace(/\"/g, '')
    .replace(/\#/g, '')
    .replace(/\;/g, '')
    .replace(/\-\-\-\-/g, '-')
    .replace(/\-\-\-/g, '-')
    .replace(/\-\-/g, '-')
    .replace(/^\-/g, '') // Remove starting dash
    .replace(/\-$/g, '') // Remove trailing dash
    .replace(' ', '');
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

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createMarkdownFile(data, category) {
  console.log('createMarkdownFile for ' + data.organization_name);
  if (!category) category = data.category.toLowerCase();
  let writePath = './_' + category; // Example: _/connect

  let filename = stringToURI(data.organization_name);

  // Page title
  //data.title = data.title + ' — My LA2050 Activation Challenge';

  // https://stackoverflow.com/questions/1117584/generating-guids-in-ruby#answer-1126031
  // https://gist.github.com/emacip/b28ba7e9203a38d440e23c38586c303d
  // >> rand(36**8).to_s(36)
  // => "uur0cj2h"
  data.unique_identifier = getRandomInt(0, Math.pow(36, 8)).toString(36);

  data.category = category;
  data.uri = '/' + category + '/' + filename + '/';
  data.order = orderCursors[category]++;
  if (!data.project_image) data.project_image = '/assets/images/' + category + '/' + filename + '.jpg';

  // data.organization_website = data.organization_website.split('; ');
  // data.organization_twitter = data.organization_twitter.split('; ');
  // data.organization_facebook = data.organization_facebook.split('; ');
  // data.organization_instagram = data.organization_instagram.split('; ');
  data.project_proposal_mobilize = getArrayFromString(data.project_proposal_mobilize);
  data.project_areas = getArrayFromString(data.project_areas);
  data.project_video = data.project_video.replace('watch', 'embed');

  let metrics = getArrayFromString(data.create_metrics)
        .concat(getArrayFromString(data.connect_metrics))
        .concat(getArrayFromString(data.learn_metrics))
        .concat(getArrayFromString(data.live_metrics))
        .concat(getArrayFromString(data.play_metrics))

  data.project_proposal_impact = metrics;

  console.dir(data);

  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
`---
${yaml.safeDump(data)}
---
`

  mkdirp(writePath, function (err) {
    if (err) {
      console.error(err);
    } else {
      fs.writeFileSync(writePath + '/' +  filename + '.md', output, 'utf8', (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}

let orderCursors = {
  learn: 0,
  create: 0,
  play: 0,
  connect: 0,
  live: 0
}

function fixDataCharacters(data) {
  for (let prop in data) {
    if (typeof(data[prop]) === 'string') {
      data[prop] = data[prop]
        .replace('â€“', '—')
        .replace('â€˜', '‘')
        .replace('â€™', '’')
        .replace('â€¯', '') // ?
        .replace('â€”', '—')
        .replace('â€‹', '') // ?
        .replace('â€œ', '“') // ?
        .replace('â€', '”') // ?
        .replace('â€¢', "*")
        .replace('â€¦', "…")
        .replace('âˆš', '√')
        .replace('â–ª', '*')
        .replace('â—\x8F', '*')
        .replace('â„¢', '™')
        .replace('Â·', '* ')
        .replace('Â½', '½')
        .replace('Ãœ', 'Ü')
        .replace('Ã±', 'ñ')
    }
  }

  return data;
}

function generateCollections(file_name, category) {

  console.log('generateCollections: ' + file_name);

  let input = fs.readFileSync('./_spreadsheets/' + file_name, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

  for (let index = 0; index < records.length; index++) {
    let data = fixDataCharacters(records[index]);
    createMarkdownFile(data, category);
  }
  return records;
}


// generateCollections('learn.csv', 'learn');
// generateCollections('create.csv', 'create');
// generateCollections('play.csv', 'play');
// generateCollections('connect.csv', 'connect');
// generateCollections('live.csv', 'live');

