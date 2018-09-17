
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

function createMarkdownFile(data) {
  console.log('createMarkdownFile for ' + data.title)
  let writePath = '../_organizations'

  // let filename = data.organization_id + "-" + stringToURI(data.title)
  let filename = stringToURI(data.title)

  data.uri = '/organizations/' + filename + '/'
  // data.order = orderCursor++

  try {
    data.areas_impacted = JSON.parse(data.areas_impacted)
  } catch(e) {
    console.log("Couldn’t parse areas_impacted: " + data.areas_impacted)
  }

  if (data.year_submitted === '2016') {
    data.project_image = `https://skild-prod.s3.amazonaws.com/myla2050/images/custom540/${data.project_image}`
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

function generateAllCollections(file_name) {

  console.log('generateCollections: ' + file_name)

  let input = fs.readFileSync('../_data/' + file_name, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

  // Sorty by most recent year first
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

    createMarkdownFile(records[index])
  }
  return records
}

generateAllCollections('organizations-2013-2018.csv')


