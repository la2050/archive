
'use strict'

let fs = require('fs')
let mkdirp = require('mkdirp')
let parse = require('csv-parse/lib/sync')
let yaml = require('js-yaml')
// let request = require("request")

function stringToURI(str) {
  return String(str).toLowerCase()
    .replace(/\s/g, '-')
    .replace(/\//g, '-')
    .replace(/\&/g, '-')
    .replace(/\./g, '-')
    .replace(/\:/g, '-')
    .replace(/\!/g, '-')
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
    .replace(' ', '')
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
    .replace(/'\]/g, '"]')
  //string = `${string}`.replace(/'/g, '"')
  console.log('parsing JSON string: ' + string)
  console.log('')
  console.log('')
  console.log('')
  return JSON.parse(string)
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}


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



let makerProjectAnswersLookup
// const test_id = null
const test_id = 8272

function getMakerProject(data) {
  // console.log("getMakerProject")

  // Create an object for quick lookup
  if (!makerProjectAnswersLookup) {
    makerProjectAnswersLookup = {}
    makerProjectAnswers.forEach(answer => {
      // if (answer.project_id == 9541) console.dir(answer)
      if (answer.project_id == test_id) console.log("Adding an answer index for test_id: " + test_id)
      if (!makerProjectAnswersLookup[answer.project_id]) {
        makerProjectAnswersLookup[answer.project_id] = {}
      }
      makerProjectAnswersLookup[answer.project_id][answer.value.trim()] = 1
      if (answer.project_id == test_id) console.log(answer.project_id)
      if (answer.project_id == test_id) console.log(answer.value)
    })
  }

  let match
  makerProjects.forEach(project => {
    if (project.id == test_id) {
      console.log("Checking to see if project matches test_id: " + test_id)
      console.log("makerProjectAnswersLookup[project.id]: " + makerProjectAnswersLookup[project.id])
      console.dir(makerProjectAnswersLookup[project.id])
    }

    if (makerProjectAnswersLookup[project.id] && 
        makerProjectAnswersLookup[project.id][data.organization_name.trim()]) {
      if (project.id == test_id) {
        console.log("makerProjectAnswersLookup[project.id][data.organization_name]: " + makerProjectAnswersLookup[project.id][data.organization_name])
        console.log("*** found a match!")
      }
      match = project
    }
  })
  return match
}

let makerImagesLookup

function getMakerImage(data) {

  // Create an object for quick lookup
  if (!makerImagesLookup) {
    makerImagesLookup = {}
    makerImages.forEach(image => {
      if (image.project_id == test_id) console.log("Adding an image index for test_id: " + test_id)

      if (!makerImagesLookup[image.project_id]) {
        makerImagesLookup[image.project_id] = {}
      }
      makerImagesLookup[image.project_id][image.type] = image
    })
    console.log("makerImagesLookup[test_id]: ")
    console.dir(makerImagesLookup[test_id])
  }

  // console.log("getMakerImage")
  // let project = getMakerProject(data)


  let project
  makerProjects.forEach(item => {
    if (data.title.indexOf("1000 Mentors") >= 0 && item.name.indexOf("1,000 Mentors") >= 0) {
      console.log("Comparing title and name for: " + test_id)
      console.log("item.name.trim(): " + item.name.trim())
      console.log("data.title.trim(): " + data.title.trim())
      console.log("item.name.trim() == data.title.trim(): " + item.name.trim() == data.title.trim())
      console.log(`item.name.toLowerCase().replace(/\,/g, "").trim() : ${item.name.toLowerCase().replace(/\,/g, "").trim()}`)
      console.log(`data.title.toLowerCase().replace(/\,/g, "").trim(): ${data.title.toLowerCase().replace(/\,/g, "").trim()}`)
      console.log('item.name.toLowerCase().replace(/\,/g, "").trim() == data.title.toLowerCase().replace(/\,/g, "").trim(): ' + 
        item.name.toLowerCase().replace(/\,/g, "").trim() == data.title.toLowerCase().replace(/\,/g, "").trim())
      let comparison = item.name.toLowerCase().replace(/\,/g, "").trim() ==
                       data.title.toLowerCase().replace(/\,/g, "").trim()
      console.log(`comparison = ${comparison}`)
    }

    // const similarity = 3
    // let compare = subCompare(item.name, data.title, similarity)
    //if (item.name.trim() == data.title.trim()) {
    if (item.name.toLowerCase().replace(/\,/g, "").trim() == data.title.toLowerCase().replace(/\,/g, "").trim()) {
      project = item
      if (data.title.indexOf("1000 Mentors") >= 0 && item.name.indexOf("1,000 Mentors") >= 0) {
        console.log(`project`)
        console.dir(project)
      }
      
    }
  })

  if (project) {
    if (makerImagesLookup[project.id]) {
      return {
        image: makerImagesLookup[project.id]["ProjectPhoto"],
        video: makerImagesLookup[project.id]["ProjectVideo"]
      }
    }
  } else {
    console.log("couldn’t find image data for project: " + data.title)
  }
}


const projectAnswers = [
  "project_is_collaboration",
  "project_collaborators",
  "project_proposal_description",
  "project_areas",
  "project_proposal_mobilize",
  "project_proposal_best_place",
  "project_proposal_engage",
  "project_proposal_help",
  "project_proposal_impact", // For 2016
  "project_measure",
  "project_five_years",
  "category_metrics",
  "category_other",
  "category"
]

const projectAnswersToRemove = [
  "idea_and_impact",
  "use_resources",
  "resources_needed",
  "measure_success",
  "impact_metrics",
  "make_la_great",
  "Please describe the activation your organization seeks to launch.",
  "Describe in greater detail how your activation will make LA the best place?",
  "How will your activation engage Angelenos to make LA the best place",
  "Please explain how you will define and measure success for your activation.",
  "Where do you hope this activation or your organization will be in five years?"
]

const projectAnswersToRemove2013 = [
  "organization_name",
  "about_organization",
  "ein",
  "empty_column_1",
  "empty_column_2",
  "empty_column_3"
]

const projectAreas2015 = [
  "Central LA",
  "East LA",
  "San Gabriel Valley",
  "San Fernando Valley",
  "South LA",
  "Westside",
  "South Bay",
  "Antelope Valley",
  "County of Los Angeles (countywide)",
  "City of Los Angeles (citywide)",
  "LAUSD",
  'Other:'
]

const projectAreas2014 = [
  "CENTRAL LA",
  "EAST LA",
  "SOUTH LA",
  "SGV",
  "SFV",
  "SOUTH BAY",
  "WESTSIDE",
  "LA COUNTY",
  "OTHER"
]


function addProjectAnswers(data) {


  if (data.year_submitted == 2013) {

    // Remove unneeded answers
    projectAnswersToRemove2013.forEach(answerToRemove => {
      delete data[answerToRemove]
    })

  }


  if (data.year_submitted == 2014) {
    let project_areas = []
    projectAreas2014.forEach(area => {
      if (data[area] == "1" && area != "OTHER") {
        project_areas.push(area)
      }
      delete data[area]
    })
    data.project_areas = project_areas
  }

  if (data.year_submitted == 2015) {
    let project_areas = []
    projectAreas2015.forEach(area => {
      if (data[area] == "1" && area != "Other:") {
        project_areas.push(area.replace(" (citywide)", "").replace(" (countywide)", ""))
      }
      delete data[area]
    })
    data.project_areas = project_areas
  }

  if (data.year_submitted == 2016 ||
      data.year_submitted == 2018) {

    // Find the project in markdownProjects that matches this data
      // If title is the same as one of the project titles

    let project = markdownProjectsLookup[data.title.trim()]
    if (project) {
      projectAnswers.forEach(answer => {
        // if (project[answer] && !data[answer]) {
        if (project[answer]) {
          data[answer] = project[answer]
        }
      })

      if (data.year_submitted == 2018 && project.uri) {
        data.challenge_url = `https://activation.la2050.org${project.uri}`
      }

      // Remove empty or redundant answers
      // projectAnswersToRemove.forEach(answerToRemove => {
      //   if (data[answerToRemove] == "") delete data[answerToRemove]
      //   projectAnswers.forEach(answer => {
      //     if (data[answerToRemove] == data[answer]) delete data[answerToRemove]
      //   })
      // })
    }

  }

}


function createMarkdownFile(data) {

  if (!data.title) {
    console.log("A title is missing")

    let found = false;
    for (let prop in data) {
      if (data.hasOwnProperty(prop) && prop != "year_submitted" && data[prop] && data[prop] != "" && data[prop] != "0") {
        found = true;
      }
    }

    // If this project has no data, stop here
    if (!found) {
      console.log("Project has no data. Skipping…")
      return;
    }

    console.dir(data);

    data.title = "Project title, to be determined"
  }


  // console.log('createMarkdownFile for ' + data.title)
  let writePath = '../_projects/' + data.year_submitted

  let filename = stringToURI(data.title)

  if (data.year_submitted == 2018) {
    data.project_image = data.project_image.replace(/https\:\/\/activation.la2050.org\/([^/]+)\/[^/]+\/([^\.]+)\.jpg/, function(match, p1, p2, offset, string) {
      // p1 is nondigits, p2 digits, and p3 non-alphanumerics
      if (!data.category) data.category = p1
      return `https://activation.la2050.org/assets/images/${p1}/2048-wide/${p2}.jpg`
    })
  } else if (data.year_submitted == 2016) {
    if (!data.project_image.includes('http')) {
      data.project_image = `https://skild-prod.s3.amazonaws.com/myla2050/images/custom540/${data.project_image}`
    }
  } else if (data.year_submitted == 2015 || 
             data.year_submitted == 2014 ||
             data.year_submitted == 2013) {
    if (!data.project_image || data.project_image == "" || data.project_image.includes(".html")) {
      if (data.organization_name == "826LA") console.log("Looking for image for 826LA: " + data.year_submitted + " : " + data.title)
      let match = getMakerImage(data)
      if (match && match.image) {
        // http://maker.good.is/s3/maker/attachments/project_photos/images/23182/display/CCC_pic17_small.jpg=c570x385
        // http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F23182%252Fdisplay%252FCCC_pic17_small.jpg=c570x385

        // http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F22867%252Fdisplay%252FGiveHalf_009.jpg=c570x385
        // http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F17230%252Fdisplay%252Fverynice.jpeg=c570x385#

        let encodedURI = encodeURIComponent(encodeURIComponent(`maker/attachments/project_photos/images/${match.image.id}/display/${match.image.image_file_name}`))
        data.maker_image_id = match.image.id
        data.maker_image_file_name = match.image.image_file_name
        data.project_image = `http://maker.good.is/s3/${encodedURI}=c570x385`
        // console.log(data.project_image)
        // http://img.youtube.com/vi/yeyzmCpYfFk/maxresdefault.jpg
      } else if (match && match.video) {
        // http://maker.good.is/s3/maker/attachments/project_photos/images/23182/display/CCC_pic17_small.jpg=c570x385
        // http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F23182%252Fdisplay%252FCCC_pic17_small.jpg=c570x385
        data.project_image = `https://img.youtube.com/vi/${match.video.youtube_video_identifier}/maxresdefault.jpg`
        data.project_video = `https://www.youtube.com/embed/${match.video.youtube_video_identifier}`

        data.youtube_video_identifier = match.video.youtube_video_identifier
        // console.log(data.project_image)
      }
    } else {
      console.log("image already present: " + data.organization_name + " : " + data.project_image)
    }
  }

  addProjectAnswers(data)

  data.body_class = category_colors[data.category] || "strawberry"

  for (let prop in data) {
    if (data[prop] === '0') data[prop] = ''
  }

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

let orderCursors = {
  learn   : 0,
  create  : 0,
  play    : 0,
  connect : 0,
  live    : 0
}

function fixDataCharacters(data) {
  for (let prop in data) {
    if (typeof(data[prop]) === 'string') {
      data[prop] = data[prop]
        .replace(/â€“/g, '—')
        .replace(/â€˜/g, '‘')
        .replace(/â€™/g, '’')
        .replace(/â€¯/g, '') // ?
        .replace(/â€”/g, '—')
        .replace(/â€‹/g, '') // ?
        .replace(/â€œ/g, '“') // ?
        .replace(/â€/g, '”') // ?
        .replace(/â€¢/g, "*")
        .replace(/â€¦/g, "…")
        .replace(/âˆš/g, '√')
        .replace(/â–ª/g, '*')
        .replace(/â—\x8F/g, '*')
        .replace(/â„¢/g, '™')
        .replace(/Â·/g, '* ')
        .replace(/Â½/g, '½')
        .replace(/Ãœ/g, 'Ü')
        .replace(/Ã±/g, 'ñ')
    }
  }

  return data
}

// function generateCollections(file_name, category) {

//   console.log('generateCollections: ' + file_name)

//   let input = fs.readFileSync('./_spreadsheets/' + file_name, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
//   let records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

//   for (let index = 0; index < records.length; index++) {
//     let data = fixDataCharacters(records[index])
//     createMarkdownFile(data, category)
//   }
//   return records
// }

const categories = ["learn", "create", "play", "connect", "live"]
const category_colors = {
  learn   : "blueberry",
  create  : "banana",
  play    : "strawberry",
  connect : "tangerine",
  live    : "lime"
}

function generateAllCollections(file_name, year) {

  console.log('generateCollections: ' + file_name)

  let input = fs.readFileSync('../_spreadsheets/' + file_name, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

  for (let index = 0; index < records.length; index++) {
    let data = fixDataCharacters(records[index])

    let category
    if (records[index].category) {
      records[index].category = records[index].category.toLowerCase()
    }

    if (!records[index].year_submitted) records[index].year_submitted = year

    records[index].year_submitted = Number(records[index].year_submitted)

    // records[index].project_image = records[index].project_image.split("/")[records[index].project_image.split("/").length - 1]

    createMarkdownFile(records[index])
  }
  return records
}





function getYaml(text, filename) {
  const DELIMITER = '---'
  let items = text.split(DELIMITER)
  if (items.length === 3) {
    return items[1]
  } else {
    console.log('unexpected markdown format detected')
    console.log(items.length)
    console.log(text)
    console.log(filename)
  }
}

function getContent(text, filename) {
  const DELIMITER = '---'
  let items = text.split(DELIMITER)
  if (items.length === 3) {
    return items[2]
  } else {
    console.log('unexpected markdown format detected')
    console.log(items.length)
    console.log(text)
  }
}



// https://stackoverflow.com/questions/20822273/best-way-to-get-folder-and-file-list-in-javascript#21459809
function getAllFilesFromFolder(dir) {

    let filesystem = require("fs")
    let results = []

    filesystem.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file
        let stat = filesystem.statSync(file)

        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFilesFromFolder(file))
        } else results.push(file)

    })

    return results

}


function loadMarkdown(filename) {
  // let input = fs.readFileSync(filename, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options

  // Get document, or throw exception on error 
  try {
    let text = fs.readFileSync(filename, 'utf8')
    let yamlText = getYaml(text, filename)
    let contentText = getContent(text, filename)

    if (!yamlText || !contentText) return

    let data = {}
    data.yaml = yaml.safeLoad(yamlText)
    data.content = contentText
    return data

  } catch (e) {
    console.log(e)
  }
}


/*
const skipColumns = {
  "order": 1,
  "project_image_color": 1,
  "link_limit": 1,
  "link_newsletter_note": 1
}


function getColumns(records) {

  let uniqueColumnNames = {}
  records.forEach(item => {
    for (let name in item) {
      if (item.hasOwnProperty(name)) {
        uniqueColumnNames[name] = 1
      }
    }
  })

  let columns = []
  for (let name in uniqueColumnNames) {
    if (uniqueColumnNames.hasOwnProperty(name) && !skipColumns[name]) {
      columns.push(name)
    }
  }

  return columns
}


function saveCSVFile(filePath, records) {

  let data = []
  let columns = getColumns(records)
  data.push(columns)

  records.forEach(item => {
    let array = []
    columns.forEach(column => {
      let value = item[column]
      if (column === "project_image" && value) {
        value = `https://activation.la2050.org${item.uri}${value}`
      }
      if (column === "uri" && value) {
        value = `https://activation.la2050.org${item.uri}`
      }
      if (!skipColumns[column]) {
        array.push(value)
      }
    })
    data.push(array)
  })

  stringify(data, function(err, output){     
    fs.writeFile(filePath, output, 'utf8', (err) => {
      if (err) {
        console.log(err)
      }
    }) 
  })
}
*/


function getRecords(folder) {
  let files = getAllFilesFromFolder(folder)

  let records = []
  for (let index = 0; index < files.length; index++) {
    if (files[index].indexOf('.DS_Store') >= 0) continue

    // Load the contents of the file
    let data = loadMarkdown(files[index])
    if (!data) continue

    // Add the data to the list of records
    records.push(data.yaml)
  }
  return records
}






let maker_projects        = 'maker-projects.csv'
let maker_user_media      = 'maker-user-media.csv'
let maker_project_answers = 'maker-project-properties.csv'


let makerProjectAnswersInput = fs.readFileSync('data/' + maker_project_answers, 'utf8')
let makerProjectAnswers      = parse(makerProjectAnswersInput, {columns: true})


let makerUserMediaInput = fs.readFileSync('data/' + maker_user_media, 'utf8')
let makerImages         = parse(makerUserMediaInput, {columns: true})


let makerProjectInput = fs.readFileSync('data/' + maker_projects, 'utf8')
let makerProjects     = parse(makerProjectInput, {columns: true})


// Load the markdown files




let markdownProjects = []
categories.forEach(category => {
  let next = getRecords(`data/projects-2016-2018-markdown/_${category}`)
  markdownProjects = markdownProjects.concat(next)
})

// Create an object for quick lookup
let markdownProjectsLookup = {}
markdownProjects.forEach(project => {
  if (!markdownProjectsLookup[project.title.trim()]) {
    markdownProjectsLookup[project.title.trim()] = project
  }
})




generateAllCollections('projects-2018.csv', 2018)
generateAllCollections('projects-2016.csv', 2016)
generateAllCollections('projects-2015.csv', 2015)
generateAllCollections('projects-2014.csv', 2014)
generateAllCollections('projects-2013.csv', 2013)





