
'use strict'

let fs = require('fs')
let parse = require('csv-parse/lib/sync')
let yaml = require('js-yaml')

let updatesToMake = parse(fs.readFileSync('./spreadsheets/2019-ein.csv', 'utf8'), {columns: true})


let urlLookup = {}

function create_url_Lookup() {
  updatesToMake.forEach(organization => {
    const url  = organization.url.replace(/\/$/, "") // Remove trailing slash
    const name = organization.url.split("/").pop() // https://archive.la2050.org/9-dots  ==>  9-dots
    urlLookup[name] = organization
  })
}

create_url_Lookup()
console.log(urlLookup)




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

  let updateByUrl = urlLookup[name]
  if (updateByUrl
    && data.ein
    && data.ein === String(updateByUrl.current_ein).replace(/\-/g, "") // If the record needs an update
    && String(updateByUrl.new_ein).replace(/\-/g, "").length === 9

    // If this is indeed a matching record
    && data.title == updateByUrl.title
    && data.ein   == updateByUrl.current_ein) {
    console.log ("✨ Using URL to update EIN for: " + filename)

    data.ein = String(updateByUrl.new_ein).replace(/\-/g, "");
    saveMarkdown(filename, data)
    count++
    urlLookup[name].updated = true
    return
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

console.log(`Total records updated: ${count}`)

// console.log("No matches were found for these updates")
// console.log(urlLookup.filter(item => item.updated !== true))

for (let prop in urlLookup) {
  if (urlLookup.hasOwnProperty(prop)) {
    if (urlLookup[prop].updated === true) {
      console.log(`${urlLookup[prop].url}, ${urlLookup[prop].current_ein}, ${urlLookup[prop].new_ein}`)
    }
  }
}


