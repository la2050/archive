
'use strict'

let fs = require('fs')
let mkdirp = require('mkdirp')
let yaml = require('js-yaml')

const yearSubmitted = 2019
const dataPath = `../../git-challenge/_2019/`
const categories = ["learn", "create", "play", "connect", "live"]
const category_colors = {
  learn   : "blueberry",
  create  : "banana",
  play    : "strawberry",
  connect : "tangerine",
  live    : "lime"
}

let organizationCounter = 1
let projectCounter = 1
function processFile(filepath) {

  // Load the contents of the file
  let data = loadMarkdownYaml(filepath)
  if (!data) return

  // Examples:
  //   2019001
  //   2019002
  //   2019003
  let organization_id = `${ yearSubmitted }${ String(organizationCounter++).padStart(3, "0") }`

  // Examples:
  //   9102001
  //   9102002
  //   9102003
  let project_id = `${ reverseString(String(yearSubmitted)) }${ String(projectCounter++).padStart(3, "0") }`

  let project_image = `https://challenge.la2050.org/assets/images/${ data.year }/${ data.category }/2048-wide/${ data.filename }.jpg`
  let cached_project_image = ''
    //`https://archive-assets.la2050.org/images/${ data.filename }/challenge.la2050.org/assets/images/${ data.year }/${ data.category }/2048-wide/${ data.filename }.jpg`

  let challengeURL = `https://challenge.la2050.org/${ data.year }/${ data.category }/${ data.filename }/`

  let tagsIndicatorsArray = [ ]
  let challengeURLArray = [ challengeURL ]
  let yearSubmittedArray = [ String(yearSubmitted) ]
  let projectIDArray = [ project_id ]
  let projectTitlesArray = [ data.title ]

  let existingOrganization = getExistingOrganization(data)

  if (existingOrganization) {
    organization_id = existingOrganization.organization_id
    
    tagsIndicatorsArray  = tagsIndicatorsArray.concat(existingOrganization.tags_indicators)
    challengeURLArray    = challengeURLArray.concat(existingOrganization.challenge_url)
    yearSubmittedArray   = yearSubmittedArray.concat(existingOrganization.year_submitted)
    if (existingOrganization.project_ids) {
      projectIDArray     = projectIDArray.concat(existingOrganization.project_ids)
    }
    projectTitlesArray   = projectTitlesArray.concat(existingOrganization.project_titles)
  }

  let organization = {
    published: true,
    organization_id: organization_id,
    title: data.organization_name,
    org_type:
      (data.organization_description == "Non-profit organization") ? 
        `Nonprofit`: '',
    org_summary: data.organization_activity,
    tags_indicators: tagsIndicatorsArray,
    charity_navigator_url: 
      (data.organization_description == "Non-profit organization") ? 
        `https://www.charitynavigator.org/index.cfm?bay=search.profile&ein=${ data.ein.replace("-", "") }`: '',
    organization_website: [ data.organization_website ],
    twitter: data.organization_twitter,
    instagram: data.organization_instagram,
    facebook: data.organization_facebook,
    ein: data.ein.replace("-", ""),
    zip: data.mailing_address_zip,
    project_image: project_image,
    project_video: data.project_video,
    challenge_url: challengeURLArray,
    year_submitted: yearSubmittedArray,
    project_ids: projectIDArray,
    project_titles: projectTitlesArray
  }

  let project = {
    published: true,
    organization_id: organization_id,
    year_submitted: yearSubmitted,
    category: data.category,
    body_class: category_colors[data.category],
    project_id: project_id,
    challenge_url: challengeURL,
    title: data.title,
    project_summary: data.project_description,
    project_image: project_image,
    project_video: data.project_video,
    "What does your organization do?": 
      data.organization_activity,
    "Please list the organizations collaborating on this proposal.": 
      (data.project_is_collaboration != "No" && data.project_collaborators && data.project_collaborators.length > 0) ? 
        data.project_collaborators : [],
    "Briefly tell us a story that demonstrates how your organization turns inspiration into impact.": 
      data.project_proposal_description,
    "Which metrics will your submission impact?": data.category_metrics,
    "Will your proposal impact any other LA2050 goal categories?": 
      (data.category_other && data.category_other.size > 0) ? 
        data.category_other : [],
    "In which areas of Los Angeles will you be directly working?": 
      data.project_areas,
    "How will your project make LA the best place?": 
      data.project_proposal_best_place,
    "In what stage of innovation is this project?": 
      data.project_innovation_stage,
    "Please explain how you will define and measure success for your project.": 
      data.project_measure,
    "How can the LA2050 community and other stakeholders help your proposal succeed?": 
      (data.project_la2050_community_resource && data.project_la2050_community_resources.size > 0) ? 
        data.project_la2050_community_resources : [],
    organization_name: data.organization_name
  }

  createOrganizationMarkdown(organization)
  createProjectMarkdown(project)
}

let seenOrganizationFilenames = {}
function createOrganizationMarkdown(data) {
  let writePath = '../_organizations'
  let filename = stringToURI(data.title)
  if (seenOrganizationFilenames[filename]) {
    console.log("Found a duplicate organization: " + filename)
    console.dir(data)
    return
  } else {
    seenOrganizationFilenames[filename] = 1
  }
  saveMarkdown(writePath, filename, data)
}

function createProjectMarkdown(data) {
  let writePath = '../_projects/' + yearSubmitted
  let filename = stringToURI(data.title)
  saveMarkdown(writePath, filename, data)
}

function getExistingOrganization(data) {
  
  let filename = stringToURI(data.organization_name)
  let filepath = `../_organizations/${filename}.md`

  return loadMarkdownYaml(filepath)
}

function loadMarkdownYaml(filepath) {
  // let input = fs.readFileSync(filename, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options

  // Get document, or throw exception on error 
  try {
    let text = fs.readFileSync(filepath, 'utf8');
    let yamlText = getYaml(text, filepath);

    if (!yamlText) return;

    let data = yaml.safeLoad(yamlText);
    return data;

  } catch (e) {
    // console.log(e);
  }
}

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

function saveMarkdown(writePath, filename, data) {

// console.dir(data)

  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
`---
${yaml.safeDump(data)}
---
`

  mkdirp(writePath, function (err) {
    if (err) {
      console.error(err)
    } else {
      fs.writeFileSync(writePath + '/' +  filename + '.md', output, 'utf8', (err) => {
        if (err) {
          console.log(err)
        }
      })
    }
  })
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

function stringToURI(str) {
  return String(str).toLowerCase()
    .replace(/\s/g, '-')
    .replace(/\//g, '-')
    .replace(/\&/g, '-')
    .replace(/\./g, '-')
    .replace(/\:/g, '-')
    .replace(/\!/g, '-')
    .replace(/…/g, '-')
    .replace(/\?/g, '-')
    .replace(/\$/g, '-')
    .replace(/\%/g, '-')
    .replace(/\≠/g, '-')
    .replace(/\–/g, '-')
    .replace(/\—/g, '-')
    .replace(/\|/g, '-')
    .replace(/\_/g, '-')
    .replace(/\,/g, "-")
    .replace(/\+/g, "-")
    .replace(/\>/g, "-")
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
    .replace(/ /g, '')
}

// KUDOS: https://stackoverflow.com/questions/958908/how-do-you-reverse-a-string-in-place-in-javascript#answer-36525647
function reverseString(str){
  return Array.from(str).reverse().join('')
}

function importChallengeEntries(folder) {
  let files = getAllFilesFromFolder(folder);

  // For each location file
  for (let index = 0; index < files.length; index++) {
    if (files[index].indexOf('.DS_Store') >= 0) continue;
    processFile(files[index]);
  }
}

categories.forEach(category => {
  importChallengeEntries(`${ dataPath }${ category }`)
})

