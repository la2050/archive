
'use strict'

let fs = require('fs')
let parse = require('csv-parse/lib/sync')
let yaml = require('js-yaml')

let tags = parse(fs.readFileSync('./spreadsheets/2020-tags.csv', 'utf8'), {columns: true})
const targetYear = "2020"

let tagsLookup

function createTagsLookup() {
  if (!tagsLookup) {
    tagsLookup = {}
    tags.forEach(item => {
      let tags = []
      if (item["tags_a"]) tags.push(item["tags_a"])
      if (item["tags_b"]) tags.push(item["tags_b"])
      if (item["tags_c"]) tags.push(item["tags_c"])
      if (tags.length > 0) {
        tagsLookup[item.url.replace(/\//g, "")] = tags
      }
    })
  }
}

createTagsLookup()

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


let updateCount = 0
function processFile(filename) {

  // Load the contents of the file
  let data = loadMarkdown(filename)
  if (!data) return

  if ((!data.tags_indicators || data.tags_indicators.length <= 0) && data.year_submitted.includes(targetYear)) {
    console.log ("Adding tags to: " + filename)

    // ../_organizations/9-dots.md  ==>  9-dots
    let name = filename.split("/").pop().replace(".md", "")
    console.log("name")

    let tags_indicators = tagsLookup[name]
    if (tags_indicators) {
      // combine the tags with existing tags, while keeping them unique (not yet tested)
      data.tags_indicators = [...new Set(data.tags_indicators.concat(tags_indicators))]
      console.log ("Tags found: " + data.tags_indicators)
      saveMarkdown(filename, data)
    } else {
      console.log ("********************************************")
      console.log ("Couldn’t find tags for: " + filename)
      console.log ("********************************************")
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

    processFile(files[index])
  }
}


updateFolder('../_organizations')

