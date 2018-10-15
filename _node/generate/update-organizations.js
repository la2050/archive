
'use strict'

let fs = require('fs')
let yaml = require('js-yaml')


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


function loadMarkdown(filename) {
  let input = fs.readFileSync(filename, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options

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


function saveMarkdown(filename, data) {
  // console.log('filename')
  // console.log(filename)

  // console.dir(data)

  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
`---
${yaml.safeDump(data.yaml)}
---${data.content}`


//console.log(output)
//return

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

  delete data.yaml.project_titles_from_project_ids
  delete data.yaml.project_titles
  delete data.yaml.project_titles_flagged
  delete data.yaml.year_submitted
  delete data.yaml.organization_name
  delete data.yaml.ntee_type
  delete data.yaml.areas_impacted
  delete data.yaml.project_ids
  delete data.yaml.challenge_url
  delete data.yaml.category
  delete data.yaml.uri
  if (data.yaml.aggregated) {
    delete data.yaml.aggregated.org_summary
  }

  saveMarkdown(filename, data)
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


function updateFolder(folder) {
  let files = getAllFilesFromFolder(folder)

  console.dir(files)

  // For each location file
  for (let index = 0; index < files.length; index++) {
    processFile(folder + '/' + files[index])
  }
}


updateFolder('../_organizations')


