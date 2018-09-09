
'use strict';

let fs = require('fs');
let parse = require('csv-parse/lib/sync');
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

function saveMarkdown(filename, data) {
  // console.log('filename')
  // console.log(filename);

  // console.dir(data);

  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
`---
${yaml.safeDump(data.yaml)}
---
`
// ${data.content}

//console.log(output);
//return;

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

function processFile(filename, projects, organizations) {

  // Load the contents of the file
  let data = loadMarkdown(filename);
  if (!data) return;

  if (data.yaml.year != 2018) return;

  // data.yaml.year = year;

  console.log("------------")

  // SHIM: It might be better to match by the original challenge URL instead
  let project = projects.filter(project => {
    if ((project.title === data.yaml.title)) {
      console.log("found a match for data.yaml.title: " + data.yaml.title)
    }
    return (project.title === data.yaml.title)
  })[0]


  if (project) {

    // SHIM: This might not work if an organization has more than one project
    let organization = organizations.filter(organization => {
      if ((organization.project_id === project.project_id)) {
        console.log("found a match for project.project_id: " + project.project_id)
      }
      return (organization.project_id === project.project_id)
    })[0]

    if (organization) {

      // if (organization.zip && organization.zip != "" && organization.zip != "0") {
      //   data.yaml.zip = organization.zip
      // } else {
      //   console.log("no zip found for organization: ")
      //   console.dir(organization)
      // }

      // if (organization.charity_navigator_url && organization.charity_navigator_url != "" && organization.charity_navigator_url != "0") {
      //   data.yaml.charity_navigator_url = organization.charity_navigator_url
      // }

      if (organization.aidens_tags && organization.aidens_tags != "" && organization.aidens_tags != "0") {
        let tags = organization.aidens_tags.split(",");
        tags = tags.map(string => string.trim());
        tags = tags.filter(string => (string !== "0" && string !== 0 && string !== "#N/A"));
        console.dir(tags);
        if (tags && tags.length > 0) {
          data.yaml.aidens_tags = tags;
        }

      }
    } else {
      console.log("no match found for project.project_id: " + project.project_id);
    }

    console.log("------------")

    saveMarkdown(filename, data);
  }



  // SHIM: This might not work if an organization has more than one project
  // let organization = organizations.filter(organization => {
  //   return (organization.project_id === project.project_id)
  // })

  // if (project && project.length > 0) {
  //   // console.dir(project)
  //   // console.log("organization: " + organization)
  // } else {
  //   console.log("couldn’t find a match for data.yaml.title: " + data.yaml.title)
  // }

  // saveMarkdown(filename, data);


  // Simplify image URL
  // let project_image_paths = data.yaml.project_image.split('/');
  // data.yaml.project_image = project_image_paths[project_image_paths.length - 1];

  // if (data.yaml.project_video !== '' && data.yaml.project_video.indexOf('youtu') < 0 && data.yaml.project_video.indexOf('vimeo') < 0) {
  //   console.log(filename)
  //   console.log(data.yaml.project_video)
  // }

  // if (data.yaml.project_video.indexOf('https://www.youtube.com/embed?') >= 0 && data.yaml.project_video.indexOf('https://www.youtube.com/embed?v=') < 0) {
  //   console.log(filename)
  //   console.log(data.yaml.project_video)
  // }

  // if (data.yaml.project_video.indexOf('#') >= 0 ||
  //     data.yaml.project_video.indexOf(' ') >= 0) {
  //   console.log('*******');
  //   console.log(data.yaml.uri)
  //   console.log(data.yaml.project_video);
  // }


  // if (data.yaml.organization_website.indexOf('/') === 0 ||
  //     data.yaml.organization_twitter.indexOf('/') === 0 ||
  //     data.yaml.organization_facebook.indexOf('/') === 0 ||
  //     data.yaml.organization_instagram.indexOf('/') === 0 ||
  //     data.yaml.link_newsletter.indexOf('/') === 0 ||
  //     data.yaml.link_donate.indexOf('/') === 0 ||
  //     data.yaml.link_volunteer.indexOf('/') === 0) {
  //   console.log(filename)
  // }

  /*
  if (data.yaml.organization_website.indexOf('#') >= 0 ||
      data.yaml.organization_twitter.indexOf('#') >= 0 ||
      data.yaml.organization_facebook.indexOf('#') >= 0 ||
      data.yaml.organization_instagram.indexOf('#') >= 0 ||
      data.yaml.link_newsletter.indexOf('#') >= 0 ||
      data.yaml.link_donate.indexOf('#') >= 0 ||
      data.yaml.link_volunteer.indexOf('#') >= 0) {

    //console.log('uri, organization_name, problem detected with');

    console.log('*******');
    console.log(data.yaml.uri)

    let problemList = []

    if (data.yaml.organization_website.indexOf('#') >= 0) {
      problemList.push('organization_website');
    }
    if (data.yaml.organization_twitter.indexOf('#') >= 0) {
      problemList.push('organization_twitter');
    }
    if (data.yaml.organization_facebook.indexOf('#') >= 0) {
      problemList.push('organization_facebook');
    }
    if (data.yaml.organization_instagram.indexOf('#') >= 0) {
      problemList.push('organization_instagram');
    }
    if (data.yaml.link_newsletter.indexOf('#') >= 0) {
      problemList.push('link_newsletter');
    }
    if (data.yaml.link_donate.indexOf('#') >= 0) {
      problemList.push('link_donate');
    }
    if (data.yaml.link_volunteer.indexOf('#') >= 0) {
      problemList.push('link_volunteer');
    }

    problemList.forEach(function(problemField) {
      console.log(data.yaml[problemField]);
    });

    // console.log(`https://staging-activation.la2050.org${data.yaml.uri}, https://github.com/la2050/activation/edit/staging/_${data.yaml.category}/${filename}, ${data.yaml.organization_name}, ${problemList.join('; ')}`);
    // console.log(`https://github.com/la2050/activation/edit/staging/_${data.yaml.category}/${filename.split('/')[filename.split('/').length - 1]}`);
  }
  */
  
  

  // data.yaml = changeNAtoEmpty(data.yaml);
  // data.yaml = addMailTo(data.yaml);

  // delete data.yaml.project_proposal_impact;
  // delete data.yaml.unique_identifier;

  // data.yaml = convertStringsToJSON(data.yaml)

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

  let projectsInput = fs.readFileSync('../_data/projects.csv', 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let projects = parse(projectsInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

  let organizationsInput = fs.readFileSync('../_data/organizations.csv', 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let organizations = parse(organizationsInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

  for (let index = 0; index < files.length; index++) {
    if (files[index].indexOf('.DS_Store') >= 0) continue;

    processFile(files[index], projects, organizations);
  }
}

updateMarkdownFiles('learn');
updateMarkdownFiles('create');
updateMarkdownFiles('play');
updateMarkdownFiles('connect');
updateMarkdownFiles('live');
