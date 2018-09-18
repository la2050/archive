
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


let makerProjectAnswersLookup
const test_id = null //"8115"

function getMakerProject(data) {
  // console.log("getMakerProject")

  // Create an object for quick lookup
  if (!makerProjectAnswersLookup) {
    makerProjectAnswersLookup = {}
    makerProjectAnswers.forEach(answer => {
      // if (answer.project_id == 9541) console.dir(answer)
      if (answer.project_id == test_id) console.log("Adding an answer index for Alliance for a Better Community, 8115")
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
      console.log("Checking to see if project matches Alliance for a Better Community, 8115")
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
      if (image.project_id == test_id) console.log("Adding an image index for Alliance for a Better Community, 8115")


      if (!makerImagesLookup[image.project_id]) {
        makerImagesLookup[image.project_id] = {}
      }
      makerImagesLookup[image.project_id][image.type] = image
    })
  }

  // console.log("getMakerImage")
  // let project = getMakerProject(data)

  let project
  makerProjects.forEach(item => {
    if (item.name == data.title) {
      project = item
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



function createMarkdownFile(data) {
  console.log('createMarkdownFile for ' + data.title)
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
      if (data.organization_name == "Alliance for a Better Community") console.log("Looking for image for Alliance for a Better Community, 8115")
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
        data.project_image = `http://img.youtube.com/vi/${match.video.youtube_video_identifier}/maxresdefault.jpg`
        data.youtube_video_identifier = match.video.youtube_video_identifier
        // console.log(data.project_image)
      }
    } else {
      console.log("image already present: " + data.organization_name + " : " + data.project_image)
    }
  }

  data.body_class = category_colors[data.category] || "strawberry"

  if (!data.title) {
    data.title = "Project title, to be determined"
    console.log("A title is missing")
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

  return data
}

function generateCollections(file_name, category) {

  console.log('generateCollections: ' + file_name)

  let input = fs.readFileSync('./_spreadsheets/' + file_name, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

  for (let index = 0; index < records.length; index++) {
    let data = fixDataCharacters(records[index])
    createMarkdownFile(data, category)
  }
  return records
}

const categories = ["learn", "create", "play", "connect", "live"]
const category_colors = {
  learn: "blueberry",
  create: "banana",
  play: "strawberry",
  connect: "tangerine",
  live: "lime"
}

function generateAllCollections(file_name, year) {

  console.log('generateCollections: ' + file_name)

  let input = fs.readFileSync('../_data/' + file_name, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

  for (let index = 0; index < records.length; index++) {
    //let data = fixDataCharacters(records[index])

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


// generateCollections('learn.csv', 'learn')
// generateCollections('create.csv', 'create')
// generateCollections('play.csv', 'play')
// generateCollections('connect.csv', 'connect')
// generateCollections('live.csv', 'live')

let maker_projects = 'maker-projects.csv'
let maker_user_media = 'maker-user-media.csv'
let maker_project_answers = 'maker-project-properties.csv'


let makerProjectAnswersInput = fs.readFileSync('../_data/' + maker_project_answers, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
let makerProjectAnswers = parse(makerProjectAnswersInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api


let makerUserMediaInput = fs.readFileSync('../_data/' + maker_user_media, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
let makerImages = parse(makerUserMediaInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api


let makerProjectInput = fs.readFileSync('../_data/' + maker_projects, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
let makerProjects = parse(makerProjectInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api



generateAllCollections('projects-2018.csv', 2018)
generateAllCollections('projects-2015.csv', 2015)
generateAllCollections('projects-2014.csv', 2014)


