
'use strict'

let fs = require('fs')
let mkdirp = require('mkdirp')
let parse = require('csv-parse/lib/sync')
let yaml = require('js-yaml')

function stringToURI(str) {
  return String(str).toLowerCase()
    .replace(/\s/g, '-')
    .replace(/\//g, '-')
    .replace(/\&/g, '-')
    .replace(/\./g, '-')
    .replace(/\:/g, '-')
    .replace(/\!/g, '-')
    .replace(/\$/g, '-')
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

let makerProjectAnswersLookup
const test_id = "8115"

function getMakerProject(data, makerProjects, makerProjectAnswers) {
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

function getMakerImage(data, makerProjects, makerImages, makerProjectAnswers) {

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
  let project = getMakerProject(data, makerProjects, makerProjectAnswers)
  if (project) {
    if (makerImagesLookup[project.id]) {
      return {
        image: makerImagesLookup[project.id]["ProjectPhoto"],
        video: makerImagesLookup[project.id]["ProjectVideo"]
      }
    }
  }
}

function createMarkdownFile(data, makerProjects, makerImages, makerProjectAnswers) {
  // console.log('createMarkdownFile for ' + data.title)
  let writePath = '../_organizations'

  // let filename = data.organization_id + "-" + stringToURI(data.title)
  let filename = stringToURI(data.title)

  data.uri = '/organizations/' + filename + '/'
  // data.order = orderCursor++

  data.challenge_url = data.url
  delete data.url

  // TODO: Get the ntee_type from the page located at charity_navigator_url
  delete data.link_to_ntee_code

  if (data.organization_id_2 === data.organization_id) {
    delete data.organization_id_2
  } else {
    console.log("found an organization_id_2 different from organization_id : " + data.organization_id_2)
  }

  try {
    data.areas_impacted = JSON.parse(data.areas_impacted)
  } catch(e) {
    // console.log("Couldn’t parse areas_impacted: " + data.areas_impacted)
  }

  if (data.year_submitted === '2018') {
    data.project_image = data.project_image.replace(/https\:\/\/activation.la2050.org\/([^/]+)\/[^/]+\/([^\.]+)\.jpg/, function(match, p1, p2, offset, string) {
      // p1 is nondigits, p2 digits, and p3 non-alphanumerics
      if (!data.category) data.category = p1
      return `https://activation.la2050.org/assets/images/${p1}/2048-wide/${p2}.jpg`
    })
  } else if (data.year_submitted === '2016') {
    if (!data.project_image.includes('http')) {
      data.project_image = `https://skild-prod.s3.amazonaws.com/myla2050/images/custom540/${data.project_image}`
    }
  } else if (data.year_submitted === "2015" || 
             data.year_submitted === "2014" ||
             data.year_submitted === "2013") {
    if (!data.project_image || data.project_image == "" || data.project_image.includes(".html")) {
      if (data.organization_name == "Alliance for a Better Community") console.log("Looking for image for Alliance for a Better Community, 8115")
      let match = getMakerImage(data, makerProjects, makerImages, makerProjectAnswers)
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

// let orderCursor = 0

function generateAllCollections(file_name, maker_projects, maker_user_media, maker_project_answers) {

  console.log('generateCollections: ' + file_name)

  let input = fs.readFileSync('../_data/' + file_name, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api


  let makerProjectAnswersInput = fs.readFileSync('../_data/' + maker_project_answers, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let makerProjectAnswers = parse(makerProjectAnswersInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api


  let makerUserMediaInput = fs.readFileSync('../_data/' + maker_user_media, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let makerImages = parse(makerUserMediaInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api


  let makerProjectInput = fs.readFileSync('../_data/' + maker_projects, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let makerProjects = parse(makerProjectInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api


  // Sort by most recent year first
  records.sort(function (a, b) {
    // a is less than b by some ordering criterion
    if (a.year_submitted > b.year_submitted) {
      return -1
    }
    // a is greater than b by the ordering criterion
    if (a.year_submitted < b.year_submitted) {
      return 1
    }
    // a must be equal to b
    return 0
  })

  let previously_shown_organization_ids = {}

  records = records.filter(item => {
    if (previously_shown_organization_ids[item['organization_id']]) {
      return false;
    } else {
      previously_shown_organization_ids[item['organization_id']] = 1
      return true
    }
  })

  for (let index = 0; index < records.length; index++) {

    if (!records[index].title) {
      records[index].title = records[index].organization_name || "Organization title, to be determined"
    }

    createMarkdownFile(records[index], makerProjects, makerImages, makerProjectAnswers)
  }
  return records
}

generateAllCollections('organizations-2013-2018.csv', 
                       'maker-projects.csv',
                       'maker-user-media.csv',
                       'maker-project-properties.csv')


