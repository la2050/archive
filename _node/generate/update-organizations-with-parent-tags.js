
'use strict'

let fs = require('fs')
let yaml = require('js-yaml')

// let parentTags = yaml.safeLoad(fs.readFileSync("../data/tags.yaml", 'utf8'))
// 
// let parentTagsLookup
// 
// function getChildTags
// 
// function createParentTagsLookup() {
//   if (!parentTagsLookup) {
//     parentTagsLookup = {}
// 
//     for (let prop in parentTags) {
//       if (parentTags.hasOwnProperty(prop)) {
//         parentTags[prop]
//       }
//     }
//   }
// }

// createParentTagsLookup()

let parentTags = [
  "Education & youth",
  "Income & employment",
  "Housing & homelessness",
  "Health",
  "Environmental quality & sustainability",
  "Public safety & public space",
  "Social connectedness",
  "Arts & cultural vitality",
  "Mobility"
]

let tagParents = {
  "STEM & Digital literacy": "Education & youth",
  "College prep": "Education & youth",
  "Teaching & mentorship": "Education & youth",
  "Early childhood": "Education & youth",

  "Workforce development": "Income & employment",
  "Access to capital & benefits": "Income & employment",
  "Entrepreneurship & innovation": "Income & employment",

  "Affordable housing": "Housing & homelessness",
  "Homelessness": "Housing & homelessness",

  "Access to healthy food": "Health",
  "Mental & emotional health": "Health",
  "Community health": "Health",
  "Fitness & sports": "Health",

  "Air & water": "Environmental quality & sustainability",
  "Climate change": "Environmental quality & sustainability",

  "Access to parks & green space": "Public safety & public space",
  "Community safety": "Public safety & public space",
  "Resiliency": "Public safety & public space",

  "Voting & civic engagement": "Social connectedness",
  "Volunteerism": "Social connectedness",
  "Community gatherings": "Social connectedness",

  "Art": "Arts & cultural vitality",
  "Creative economy": "Arts & cultural vitality",

  "Transportation": "Mobility",
  "Disability & aging": "Mobility"

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
    console.log(text.substring(text.length - 3, text.length))
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


let updateCount = 0
function processFile(filename) {

  // Load the contents of the file
  let data = loadMarkdown(filename)
  if (!data) return

  if (data.tags_indicators && data.tags_indicators.length > 0 && data.year_submitted.includes("2019")) {
    console.log ("Updating tags for: " + filename)

    let tagsUpdated = false

    data.tags_indicators.forEach(tag => {
      if (tagParents[tag] && !data.tags_indicators.includes(tagParents[tag])) {
        console.log ("Adding parent tag: " + tagParents[tag])
        data.tags_indicators.push(tagParents[tag])
        tagsUpdated = true
      } else if (!tagParents[tag] && !parentTags.includes(tag)) {
        console.log ("********************************************")
        console.log ("Couldn’t find parent tag for: " + tag)
        console.log ("********************************************")
      }
    })

    if (tagsUpdated) {
      saveMarkdown(filename, data)
    }
  }
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

    // console.log(files[index])

    processFile(files[index])
  }
}


updateFolder('../_organizations')

