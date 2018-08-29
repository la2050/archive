
'use strict'

let fs = require('fs')
let mkdirp = require('mkdirp')
let parse = require('csv-parse/lib/sync')
let stringify = require('csv-stringify')
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


const categories = ["learn", "create", "play", "connect", "live"]

let records = []
categories.forEach(category => {
  let next = getRecords(`../_${category}`)
  records = records.concat(next)
})
saveCSVFile("../_data-export/2018.csv", records)


