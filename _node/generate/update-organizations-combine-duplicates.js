
// 1) Copy data from the duplicate organization (to be deleted) into the primary organization
//   a) tags_indicators
//   b) challenge_url
//   c) project_ids
//   d) project_titles
// 2) Update projects with the primary organization ID
// 3) Create a redirect from the duplicate organization to the primary organization
// 4) Delete the duplicate organization

'use strict'

let fs = require('fs')
let parse = require('csv-parse/lib/sync')
let yaml = require('js-yaml')

const sameOrganizationMap = {
  // primary organization : // duplicate organization

  // "la-river-public-art-project-c-o-erw-design": "erw-design-salt-landscape-architects",

  // "la-river-public-art-project-c-o-erw-design": "erw-design",

  // "central-american-resource-center-carecen-los-angeles": "carecen-central-american-resource-center",
  // "los-angeles-lisc": "local-initiatives-support-corporation-lisc-los-angeles",
  // "communities-in-schools-of-los-angeles": "communities-for-a-better-environment",
  // "lapd-southwest-business-booster-association-inc": "operations-south-bureau-community-stakeholder-collaboration",
  // "play-the-la-river": "l-a-river-revitalization-corporation",
  // "impact-hub-los-angeles": "hub-los-angeles",
  // "data-roads-foundation": "culture-shock-los-angeles",
  // "everyoneon": "connect-to-compete-inc-everyoneon",
  // "mayors-fund-for-los-angeles": "los-angeles-promise-zone-initiative-la-mayors-office-of-economic-development-c-o-mayors-fund-for-los-angeles",
  // "architecture-and-design-museum-a-d": "a-d-architecture-and-design-museum-los-angeles",
  // "kcetlink": "kcet-departures",
  // "los-angeles-county-economic-development-corporation": "center-for-innovation-at-the-laedc",
  // "i-have-a-dream-foundation": "i-have-a-dream-foundation-los-angeles-ihadla",
  // "strategic-concepts-in-organizing-and-policy-education-scope-us-green-building-council-los-angeles-chapter-usgbc-la": "california-calls",
  // "los-angeles-cleantech-incubator": "la-cleantech-incubator-clean-tech-la",
  // "l-a-kitchen": "the-l-a-kitchen",
}






function getRecords(folder) {
  let files = getAllFilesFromFolder(folder);

  let records = []
  for (let index = 0; index < files.length; index++) {
    if (files[index].indexOf('.DS_Store') >= 0) continue

    // Load the contents of the file
    let data = loadMarkdown(files[index]);
    if (!data) continue

    // Add the data to the list of records
    records.push({ yaml: data, filename: files[index] });
  }
  return records;
}

// Create an object for quick lookup
// let markdownOrganizationsLookup = {}
// let markdownOrganizationsAggregatedLookup = {}
let projectMarkdownFiles;

function createProjectsLookup() {

  // Load the markdown files
  let records = getRecords(`../_projects`);

  // records.forEach(record => {
  //   record.project_ids.forEach(project_id => {
  //     markdownOrganizationsLookup[project_id] = record
  //   })
  //   record.aggregated.project_ids.forEach(project_id => {
  //     markdownOrganizationsAggregatedLookup[project_id] = record
  //   })
  // })

  projectMarkdownFiles = records;
}

createProjectsLookup()




function getYaml(text, filename) {
  const DELIMITER = `---
`
  let items = text.split(DELIMITER)
  if (items.length === 3) {
    return `
${items[1]}`
  } else {
    console.log('unexpected markdown format detected')
    console.log(items.length)
    // console.log(text)
    console.log(filename)
  }
}


function loadMarkdown(filename) {
  // let input = fs.readFileSync(filename, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options

  // Get document, or throw exception on error 
  try {
    let text = fs.readFileSync(filename, 'utf8')
    let yamlText = getYaml(text, filename)

    if (!yamlText) return

    let data = yaml.safeLoad(yamlText)
    return data

  } catch (e) {
    console.log(e)
  }
}


const attributes = [
  'published',
  'organization_id',
  'title',
  'org_type',
  'org_summary',
  'tags_indicators',
  'charity_navigator_url',
  'organization_website',
  'twitter',
  'instagram',
  'facebook',
  'ein',
  'zip',
  'project_image',
  'project_video',
  'challenge_url',
  'year_submitted',
  'project_ids',
  'project_titles',
  'calculated_project_ids',
  'original_project_ids',
  'original_project_titles',
  'extrapolated_project_ids',
  'extrapolated_project_titles',
  'youtube_video_identifier',
  'maker_image_file_name',
  'maker_image_id',
  'cached_project_image'
]


function saveMarkdown(filename, data) {

  for (let prop in data) {
    if (data.hasOwnProperty(prop)) {
      if (data[prop] === null) data[prop] = ""
    }
  }

  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
`---
${yaml.safeDump(data, {sortKeys: (a, b) => {
  // a is less than b by some ordering criterion
  if (attributes.indexOf(a) < attributes.indexOf(b)) {
    return -1
  }
  // a is greater than b by the ordering criterion
  if (attributes.indexOf(a) > attributes.indexOf(b)) {
    return 1
  }
  // a must be equal to b
  return 0
}})}
---
`

  fs.writeFileSync(filename, output, 'utf8', (err) => {
    if (err) {
      console.log(err)
    }
  })
}

let count = 0
function processFile(filename) {

  // Load the contents of the file
  let data = loadMarkdown(filename)
  if (!data) return

  // ../_organizations/9-dots.md  ==>  9-dots
  let name = filename.split("/").pop().replace(".md", "")

  const isPrimary = sameOrganizationMap[name];
  if (isPrimary) {
    console.log ("✨ Found a primary: " + filename)

    combineOrganizations({
      duplicateFilename: filename.replace(name, sameOrganizationMap[name]),
      primaryFilename: filename
    });
  }
}

function combineOrganizations({ duplicateFilename, primaryFilename }) {

  let duplicateData = loadMarkdown(duplicateFilename);
  let primaryData = loadMarkdown(primaryFilename);
  if (!duplicateData || !primaryData) return;
  
  // 1) Copy data from the duplicate organization (to be deleted) into the primary organization
  //   a) tags_indicators
  //   b) challenge_url
  //   c) project_ids
  //   d) project_titles
  if (duplicateData.tags_indicators) {
    for (let item of duplicateData.tags_indicators) {
      if (!primaryData.tags_indicators) primaryData.tags_indicators = [];
      primaryData.tags_indicators.push(item);
    }
  }
  if (duplicateData.challenge_url) {
    for (let item of duplicateData.challenge_url) {
      if (!primaryData.challenge_url) primaryData.challenge_url = [];
      primaryData.challenge_url.push(item);
    }
  }
  if (duplicateData.project_ids) {
    for (let item of duplicateData.project_ids) {
      if (!primaryData.project_ids) primaryData.project_ids = [];
      primaryData.project_ids.push(item);
    }
  }
  if (duplicateData.project_titles) {
    for (let item of duplicateData.project_titles) {
      if (!primaryData.project_titles) primaryData.project_titles = [];
      primaryData.project_titles.push(item);
    }
  }

  console.log(`Data to update for primary organization ${primaryData.title}`);
  console.log(primaryData.tags_indicators);
  console.log(primaryData.challenge_url);
  console.log(primaryData.project_ids);
  console.log(primaryData.project_titles);
  saveMarkdown(primaryFilename, primaryData);
  
  // 2) Update projects with the primary organization ID
  updateMatchingProjecs({
    duplicateOrganizationID: duplicateData.organization_id,
    primaryOrganizationID: primaryData.organization_id
  });

  // 3) Create a redirect from the duplicate organization to the primary organization
  const duplicateURI = duplicateFilename.split("/")[duplicateFilename.split("/").length - 1].split(".")[0];
  const primaryURI = primaryFilename.split("/")[primaryFilename.split("/").length - 1].split(".")[0];
  const redirectOutput =
`---
title: This page has moved
permalink: "/${duplicateURI}/"
redirect: "/${primaryURI}/"
canonical_url: "/${primaryURI}/"
layout: redirect
---
`;
  fs.writeFileSync(`../redirects/${duplicateURI}.md`, redirectOutput, 'utf8', (err) => {
    if (err) {
      console.log(err)
    }
  })

  // 4) Delete the duplicate organization
  // console.log('to delete: ' + duplicateFilename);
  fs.unlink(duplicateFilename, (err) => {
    if (err) throw err;
    console.log(duplicateFilename + ' was deleted');
  });
}


function updateMatchingProjecs({ duplicateOrganizationID, primaryOrganizationID }) {
  for (let project of projectMarkdownFiles) {
    if (project.yaml.organization_id == duplicateOrganizationID) {
      updateProjectOrganizationID({
        project,
        organizationID: primaryOrganizationID
      });
    }
  }
}


function updateProjectOrganizationID({ project, organizationID }) {

  // project.yaml.organization_id = organizationID;

  console.log(`Data to up date for project ${project.yaml.title}`);
  console.log('organizationID' + organizationID);
  
  const projectText = fs.readFileSync(project.filename, 'utf8');
  const output = projectText.replace(project.yaml.organization_id, organizationID);
  fs.writeFileSync(project.filename, output, 'utf8', (err) => {
    if (err) {
      console.log(err)
    }
  })
}


// https://stackoverflow.com/questions/20822273/best-way-to-get-folder-and-file-list-in-javascript#21459809
function getAllFilesFromFolder(dir) {

  let results = []

  fs.readdirSync(dir).forEach(function(file) {

      file = dir+'/'+file
      let stat = fs.statSync(file)

      if (stat && stat.isDirectory()) {
          results = results.concat(getAllFilesFromFolder(file))
      } else results.push(file)

  })

  return results
}


function updateFolder(folder) {
  let files = getAllFilesFromFolder(folder)

  // For each location file
  for (let index = 0; index < files.length; index++) {
    if (files[index].indexOf('.DS_Store') >= 0) continue

    processFile(files[index]);
    
  }
}


updateFolder('../_organizations')

// console.log(`Total records updated: ${count}`)
// 
// // console.log("No matches were found for these updates")
// // console.log(urlLookup.filter(item => item.updated !== true))
// 
// for (let prop in urlLookup) {
//   if (urlLookup.hasOwnProperty(prop)) {
//     if (urlLookup[prop].updated === true) {
//       console.log(`${urlLookup[prop].url}, ${urlLookup[prop].current_ein}, ${urlLookup[prop].new_ein}`)
//     }
//   }
// }

