
'use strict'

const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const stringify = require('csv-stringify')
const yaml = require('js-yaml')

const proposals = parse(fs.readFileSync('../../_data/2020 Grants Challenge Submission Tags - masterspreadsheet2_Apr 16 2020 02_14 PM (PDT).csv', 'utf8'), {columns: true})
const targetYear = "2020"

const files = getAllFilesFromFolder('../_organizations')
const properties = ["url","tags_a","tags_b","tags_c"]

const csvArray = [properties]
const csvFilePath = "./spreadsheets/2020-tags.csv"

function addRow(record) {
  const data = []

  // Add the data for this row
  properties.forEach(property => {
    data.push(record[property])
  })

  // Save the next row
  csvArray.push(data)
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

// Make it easy to get the organization name (e.g. “9-dots”) if the challenge URL is known
const organizationsByChallengeUrl = new Map()

function processFile(filename) {

  // Load the contents of the file
  const data = loadMarkdown(filename)
  if (!data) {
    console.error("Found an organization without data")
    return
  }

  if (!data.challenge_url) {
    console.error("Found an organization without challenge URLs")
    return
  }

  // ../_organizations/9-dots.md  ==>  9-dots
  const name = filename.split("/").pop().replace(".md", "")

  for (let url of data.challenge_url) {
    organizationsByChallengeUrl.set(url, name)
  }
}

// For each location file
for (let index = 0; index < files.length; index++) {
  if (files[index].indexOf('.DS_Store') >= 0) continue

  processFile(files[index])
}

for (let record of proposals) {

  // Get the organization URL that matches this record
  const organizationURL = organizationsByChallengeUrl.get(record["Proposal Link"])
  if (!organizationURL) {
    console.error("Couldn’t find a matching organization")
    console.log({record})
    continue
  }

  addRow({
    "url": `${organizationURL}`,
    "tags_a": record["tags_a"],
    "tags_b": record["tags_b"],
    "tags_c": record["tags_c"]
  })
}

stringify(csvArray, function(err, output){     
  fs.writeFile(csvFilePath, output, 'utf8', (err) => {
    if (err) {
      console.log(err)
    }
  }) 
})

