
'use strict'

let fs = require('fs')
let mkdirp = require('mkdirp')
let yaml = require('js-yaml')

const yearSubmitted = 2020
const dataPath = `../../git-challenge/_2020/`
const categories = ["learn", "create", "play", "connect", "live"]
const category_colors = {
  learn   : "blueberry",
  create  : "banana",
  play    : "strawberry",
  connect : "tangerine",
  live    : "lime"
}

const sameOrganizationMap = {
  // new name : // old name
  // 2020
  "grid110": "grid110-inc",

  // 2019
  // "changeist-formerly-big-citizen-hub": "big-citizen-hub",
  // "charles-r-drew-university-of-medicine-and-science-cdu": "charles-r-drew-university-of-medicine-and-science",
  // "charles-r-drew-university-of-medicine-and-science-cdu": "charles-r-drew-university-of-medicine-and-science",
  // "encorps-inc": "encorps-inc",
  // "los-angeles-service-academy": "los-angeles-service-academy-lasa",
  // "spark-program-inc": "spark-los-angeles",
  // "the-engineer-factory-a-project-of-community-partners": "the-engineer-factory-a-project-of-community-partners",
  // "unite-la": "unite-la",
  // "la-bioscience-hub": "los-angeles-bioscience-hub",
  // "natch": "the-natch-inc",
  // "new-america-ca": "new-america-foundation-ca-civic-innovation-project",
  // "the-national-association-of-latino-independent-producers-nalip": "the-national-association-of-latino-independent-producers-nalip",
  // "harlem-lacrosse": "harlem-lacrosse-los-angeles",
  // "los-angeles-audubon-society": "los-angeles-audubon-society-laas",
  // "theodore-payne-foundation-for-wild-flowers": "theodore-payne-foundation-for-wild-flower-and-native-plants",
  // "lawmaker": "lawmaker-io",
  // "mighty-companions-inc": "mighty-companions",
  // "voterunlead": "voterunlead",
  // "world-harvest": "world-harvest-charities-family-services",
  // "cardborigami-inc": "cardborigami-inc",
  // "my-friends-house": "my-friends-house-inc",
  // "safecast-momoko-ito-foundation": "safecast",
  // "the-youth-movement-against-alzheimers": "the-youth-movement-against-alzheimers"
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

  let project_image
  if (yearSubmitted == 2020) {
    project_image = `https://images.la2050.org/challenge/${ data.year }/${ data.category }/2048-wide/${ data.filename }.jpg`;
  } else if (yearSubmitted == 2019) {
    project_image = `https://challenge.la2050.org/assets/images/${ data.year }/${ data.category }/2048-wide/${ data.filename }.jpg`;
  }
  let cached_project_image = ''
    //`https://archive-assets.la2050.org/images/${ data.filename }/challenge.la2050.org/assets/images/${ data.year }/${ data.category }/2048-wide/${ data.filename }.jpg`

  let challengeURL = `https://challenge.la2050.org/${ data.year }/${ data.category }/${ data.filename }/`

  let tagsIndicatorsArray = [ ]
  let challengeURLArray = [ challengeURL ]
  let yearSubmittedArray = [ String(yearSubmitted) ]
  let projectIDArray = [ project_id ]
  let projectTitlesArray = [ data.title ]

  let existingOrganization = 
    getExistingOrganizationDuringImport(data)  ||
    getExistingOrganizationByFilename(data)    || 
    getExistingOrganizationByManualMatch(data)

  if (existingOrganization) {
    // if (existingOrganization.title !== data.organization_name && !sameOrganizationMap[data.organization_name]) {
      // console.log("*******")
      // console.log("Found an existing organization with a new name")
      // console.log("Old name: " + existingOrganization.title)
      // console.log("New name: " + data.organization_name)
      // console.log("The new concatenated information will be stored in a new markdown file:")
      // console.log('../_organizations/' + stringToURI(data.organization_name))
      // console.log("You may want to change the old markdown file into a redirect:")
      // console.log('../_organizations/' + stringToURI(existingOrganization.title))
      // console.log("*******")
      // console.log(`"${ stringToURI(data.organization_name) }": "${ stringToURI(existingOrganization.title) }"`)
      // console.log("*******")
    // }
    organization_id = existingOrganization.organization_id
    
    tagsIndicatorsArray  = tagsIndicatorsArray.concat(existingOrganization.tags_indicators || [])
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
        `Nonprofit`: data.organization_description,
    org_summary: null,
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
    project_video: data.project_video || "",
    challenge_url: challengeURLArray,
    year_submitted: yearSubmittedArray,
    project_ids: projectIDArray,
    project_titles: projectTitlesArray
  }

  if (existingOrganization && existingOrganization.removed_ein) {
    organization.removed_ein = existingOrganization.removed_ein;
  }
  if (existingOrganization && existingOrganization.removed_ein_note) {
    organization.removed_ein_note = existingOrganization.removed_ein_note;
  }

  if (yearSubmitted == 2020) {
    organization.org_summary = data["Please describe the mission of your organization."];
  } else if (yearSubmitted == 2019) {
    organization.org_summary = data.organization_activity;
  }

  let project
  if (yearSubmitted == 2020) {
    project = {
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
      project_video: data.project_video || "",
      "Which LA2050 goal will your submission most impact?": data["Which LA2050 goal will your submission most impact?"],
      "In which areas of Los Angeles will you be directly working?": data["In which areas of Los Angeles will you be directly working?"],
      "In what stage of innovation is this project?": data["In what stage of innovation is this project?"],
      "What is the need you’re responding to?": data["What is the need you’re responding to?"],
      "Why is this project important to the work of your organization?": data["Why is this project important to the work of your organization?"],
      "Please explain how you will define and measure success for your project.": data["Please explain how you will define and measure success for your project."],
      "Approximately how many people will be directly impacted by this proposal?": data["Approximately how many people will be directly impacted by this proposal?"],
      "Approximately how many people will be indirectly impacted by this proposal?": data["Approximately how many people will be indirectly impacted by this proposal?"],
      "Please describe the broader impact of your proposal.": data["Please describe the broader impact of your proposal."],
      "If you are submitting a collaborative proposal, please describe the specific role of partner organizations in the project.": data["If you are submitting a collaborative proposal, please describe the specific role of partner organizations in the project."] || "",
      "Which of LA2050’s resources will be of the most value to you?": data["Which of LA2050’s resources will be of the most value to you?"],
      "Please list the organizations collaborating on this proposal.": data["Please list the organizations collaborating on this proposal."],
      "Which metrics will your submission impact?": data["Which metrics will your submission impact?"],
      "Are there any other LA2050 goal categories that your proposal will impact?": data["Are there any other LA2050 goal categories that your proposal will impact?"],
      "Has your proposal changed due to COVID-19?": data["Has your proposal changed due to COVID-19?"] || "",
      organization_name: data.organization_name
    }
  } else if (yearSubmitted == 2019) {
    project = {
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
  }
  
  importedOrganizationsByName[data.organization_name.toLowerCase()] = organization

  createOrganizationMarkdown(organization, existingOrganization)
  createProjectMarkdown(project)
}

let importedOrganizationsByName = {}
function createOrganizationMarkdown(data, existingOrganization) {
  // if (existingOrganization && stringToURI(existingOrganization.title) != stringToURI(data.title)) {
  //   console.log("createOrganizationMarkdown")
  //   console.log("existingOrganization: " + existingOrganization)
  //   console.log("writing file to : " + stringToURI(existingOrganization.title))
  //   console.log("instead of : " + stringToURI(data.title))
  // }
  let writePath = '../_organizations'
  let filename = existingOrganization ? stringToURI(existingOrganization.title) : stringToURI(data.title)
  // if (importedOrganizationsByFilename[filename]) {
  //   console.log("Found a duplicate organization: " + filename)
  //   console.dir(data)
  //   return
  // } else {
  //   importedOrganizationsByFilename[filename] = data
  // }

  if (existingOrganization) {
    for (let key of Object.keys(existingOrganization)) {
      if (data[key] == undefined && 
          key != "cached_project_image" && 
          key != "youtube_video_identifier" && 
          key != "maker_image_file_name" &&
          key != "maker_image_id" &&
          key != "original_project_image") {
        console.log(`Found missing key ${key}`);
        console.log({data});
        console.log({existingOrganization});
        throw new Error(`Data will be lost if organizations ${stringToURI(data.title)} and ${stringToURI(existingOrganization.title)} are combined. Stopping early…`);
      }
    }
  }

  saveMarkdown(writePath, filename, data)
}

function createProjectMarkdown(data) {
  let writePath = '../_projects/' + yearSubmitted
  let filename = stringToURI(data.title)
  saveMarkdown(writePath, filename, data)
}

function getExistingOrganizationByFilename(data) {
  
  let filename = stringToURI(data.organization_name)
  let filepath = `../_organizations/${filename}.md`

  return loadMarkdownYaml(filepath)
}

function getExistingOrganizationByManualMatch(data) {
  // if (markdownOrganizationsLookupByEIN[data.ein.replace("-", "")]) {
  //   console.log("Found an EIN match: " + data.title)
  // }
  // if (data.organization_name.includes("Big Citizen")) {
  //   console.log("Big Citizen");
  //   console.log(`data.ein: ${data.ein.replace("-", "")}`);
  //   console.log(`markdownOrganizationsLookupByEIN[data.ein]: ${markdownOrganizationsLookupByEIN[data.ein]}`);
  // }
  // return markdownOrganizationsLookupByEIN[data.ein.replace("-", "")] || null

  if (sameOrganizationMap[stringToURI(data.organization_name)]) {
    // console.log("Found a match in sameOrganizationMap")
    let filename = sameOrganizationMap[stringToURI(data.organization_name)]
    let filepath = `../_organizations/${filename}.md`

    return loadMarkdownYaml(filepath)
  }
}

function getExistingOrganizationDuringImport(data) {
  if (importedOrganizationsByName[data.organization_name.toLowerCase()]) {
    console.log("getExistingOrganizationDuringImport: " + data.organization_name)
    return importedOrganizationsByName[data.organization_name.toLowerCase()]
  }
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

  console.dir(data)

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

// Create an object for quick lookup
// let markdownOrganizationsLookup = {}
let markdownOrganizationsLookupByEIN = {}

function createOrganizationsLookup() {

  // Load the markdown files
  let records = getRecords(`../_organizations`)
  records.forEach(organization => {
    // if (!markdownOrganizationsLookup[getStringForComparison(organization.title)]) {
    //   markdownOrganizationsLookup[getStringForComparison(organization.title)] = organization
    // }
    
    if (!markdownOrganizationsLookupByEIN[organization.ein]) {
      markdownOrganizationsLookupByEIN[organization.ein] = organization
    }
    // if (organization.title.includes("Big Citizen")) {
    //   console.log("creating lookup")
    //   console.log("Big Citizen");
    //   console.log(`data.ein: ${organization.ein}`);
    //   console.log(`markdownOrganizationsLookupByEIN[organization.ein]: ${markdownOrganizationsLookupByEIN[organization.ein]}`);
    //   console.log("done")
    // }
  })

}

function getRecords(folder) {
  let files = getAllFilesFromFolder(folder)

  let records = []
  for (let index = 0; index < files.length; index++) {
    if (files[index].indexOf('.DS_Store') >= 0) continue

    // Load the contents of the file
    let data = loadMarkdownYaml(files[index])
    if (!data) continue

    // Add the data to the list of records
    records.push(data)
  }
  return records
}

createOrganizationsLookup()

categories.forEach(category => {
  importChallengeEntries(`${ dataPath }${ category }`)
})
