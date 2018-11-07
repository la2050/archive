
'use strict'

let fs = require('fs')
let yaml = require('js-yaml')


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


function getContent(text, filename) {
  const DELIMITER = `---
`
  let items = text.split(DELIMITER)
  if (items.length === 3) {
    return `
${items[2]}`
  } else {
    console.log('unexpected markdown format detected')
    console.log(items.length)
    // console.log(text)
  }
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
  'project_ids',
  'project_titles',
  'aggregated',
  'year_submitted',
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
  // console.log('filename')
  // console.log(filename)

  // console.dir(data)



  for (let prop in data.yaml) {
    if (data.yaml.hasOwnProperty(prop)) {
      if (data.yaml[prop] === null) data.yaml[prop] = ""
    }
  }

  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
`---
${yaml.safeDump(data.yaml, {sortKeys: (a, b) => {
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

  // console.log("data.yaml.year_submitted: " + data.yaml.year_submitted)

  // if (data.yaml.published == false) return

  /*
  try {
  (function() {
    let imagePathBits = data.yaml.project_image.split("/")
    let filenameBits = filename.split("/")

    let folder
    if (filename.includes("/_projects/")) {
      // projects/2018/826la
      folder = filenameBits.slice(filenameBits.length - 3, filenameBits.length).join("/").replace(/^_/, "").replace(/\.md$/, "")
    } else {
      // organizations/826la
      folder = filenameBits.slice(filenameBits.length - 2, filenameBits.length).join("/").replace(/^_/, "").replace(/\.md$/, "")
    }

    // activation.la2050.org/assets/images/connect/2048-wide
    let imagePathWithoutHTTPAndFileName = imagePathBits.slice(2, imagePathBits.length - 1).join("/")

    // 826la.jpg
    let imageName = imagePathBits[imagePathBits.length - 1]

    // ../assets/images/projects/2018/826la/activation.la2050.org/assets/images/connect/2048-wide/
    let writePath = `/assets/images/${folder}/${imagePathWithoutHTTPAndFileName}/`

    let filesInWritePath = []
    fs.readdirSync(".." + writePath).forEach(function(file) {

        file = ".." + writePath + file
        let stat = fs.statSync(file)

        if (stat && !stat.isDirectory()) {
          filesInWritePath.push(file)
        }

    })

    if (filesInWritePath.length > 0) {
    //if (fs.existsSync(".." + writePath + imageName)) {

      // If the file has a question mark in the name, remove everything after it
      if (filesInWritePath[0].indexOf("?") >= 0) {
        let pathWithQuestionMark    = filesInWritePath[0]
        let pathWithoutQuestionMark = filesInWritePath[0].split("?")[0]

        fs.renameSync(pathWithQuestionMark, pathWithoutQuestionMark, function(err) {
          if ( err ) console.log('ERROR: ' + err);
        });

        filesInWritePath[0] = pathWithoutQuestionMark
      }

      let imageExtension = ""
      if (!filesInWritePath[0].toLowerCase().endsWith(".jpg") && 
          !filesInWritePath[0].toLowerCase().endsWith(".jpeg") && 
          !filesInWritePath[0].toLowerCase().endsWith(".png") && 
          !filesInWritePath[0].toLowerCase().endsWith(".gif")) {
  
        // console.log("file needs an extension: " + filesInWritePath[0])

        let originalPath = filesInWritePath[0]
        if (filesInWritePath[0].toLowerCase().indexOf(".jpg") >= 0) {
          imageExtension = ".jpg"
        } else if (filesInWritePath[0].toLowerCase().indexOf(".jpeg") >= 0) {
          imageExtension = ".jpg"
        } else if (filesInWritePath[0].toLowerCase().indexOf(".png") >= 0) {
          imageExtension = ".png"
        } else if (filesInWritePath[0].toLowerCase().indexOf(".gif") >= 0) {
          imageExtension = ".gif"
        } else {
          imageExtension = ".jpg"
        }

        fs.renameSync(originalPath, filesInWritePath[0] + imageExtension, function(err) {
          if ( err ) console.log('ERROR: ' + err);
        });

        console.log("done renaming file to: " + filesInWritePath[0] + imageExtension)
      } else {
        // console.log("file doesn’t need an extension: " + filesInWritePath[0])
      }

      if (!imageName.toLowerCase().endsWith(".jpg") && 
          !imageName.toLowerCase().endsWith(".jpeg") && 
          !imageName.toLowerCase().endsWith(".png") && 
          !imageName.toLowerCase().endsWith(".gif")) {
  
        // console.log("file needs an extension: " + filesInWritePath[0])

        if (imageName.toLowerCase().indexOf(".jpg") >= 0) {
          imageExtension = ".jpg"
        } else if (imageName.toLowerCase().indexOf(".jpeg") >= 0) {
          imageExtension = ".jpg"
        } else if (imageName.toLowerCase().indexOf(".png") >= 0) {
          imageExtension = ".png"
        } else if (imageName.toLowerCase().indexOf(".gif") >= 0) {
          imageExtension = ".gif"
        } else {
          imageExtension = ".jpg"
        }
      }

      // data.yaml.cached_project_image = writePath + imageName + imageExtension
      data.yaml.cached_project_image = filesInWritePath[0].replace(/^\.\./, "")
    } else {
      console.log("file does not exist: " + filesInWritePath[0])
    }
  })()
  } catch(e) {
    console.log(e)
  }
  */


  // delete data.yaml.project_titles_from_project_ids
  // delete data.yaml.project_titles
  // delete data.yaml.project_titles_flagged
  // delete data.yaml.year_submitted
  // delete data.yaml.organization_name
  // delete data.yaml.ntee_type
  // delete data.yaml.areas_impacted
  // delete data.yaml.project_ids
  // delete data.yaml.challenge_url
  // delete data.yaml.category
  // delete data.yaml.uri
  // if (data.yaml.aggregated) {
  //   delete data.yaml.aggregated.org_summary
  // }

  // let combined_project_ids = data.yaml.original_project_ids.concat(data.yaml.extrapolated_project_ids)
  // data.yaml.project_ids = Array.from(new Set(combined_project_ids))
  // delete data.yaml.original_project_ids
  // delete data.yaml.extrapolated_project_ids

  // data.yaml.project_ids = data.yaml.project_ids.sort((a, b) => {
  //   // a is less than b by some ordering criterion
  //   if (a > b) {
  //     return -1
  //   }
  //   // a is greater than b by the ordering criterion
  //   if (a < b) {
  //     return 1
  //   }
  //   // a must be equal to b
  //   return 0
  // })

  // let combined_project_titles = data.yaml.original_project_titles.concat(data.yaml.extrapolated_project_titles)
  // data.yaml.project_titles = Array.from(new Set(combined_project_titles))
  // delete data.yaml.original_project_titles
  // delete data.yaml.extrapolated_project_titles

  // data.yaml.year_submitted = data.yaml.aggregated.year_submitted[0]

  // data.yaml.published = true

  // if (data.yaml.project_image.startsWith("'")) {
  //   console.log("*****found image with quote: " + data.yaml.project_image)
  //   data.yaml.project_image = data.yaml.project_image.replace(/^'/, "").replace(/'$/, "")
  // }


  /*
  let project_ids = []
  let candidate_project_ids = []
  let suspect_project_ids = []
  projectMarkdownFiles.forEach(item => {

    if (item.project_id == "4102265" && data.yaml.organization_id == "2018128") {
      console.log("Checking 4102265")
    }

    if (!data.yaml.project_ids || !data.yaml.project_ids.length) {
      console.log("Found missing project_ids: " + data.yaml.organization_id + " :: " + data.yaml.title)
    }

    data.yaml.project_ids.forEach(project_id => {
      if (item.project_id == project_id) {
        if (item.project_id == "4102265" && data.yaml.organization_id == "2018128") {
          console.log("match 1")
        }
        project_ids.push(item.project_id)
      }
    })

    data.yaml.aggregated.project_ids.forEach(project_id => {
      if (item.project_id == project_id && item.organization_id == data.yaml.organization_id) {
        if (item.project_id == "4102265" && data.yaml.organization_id == "2018128") {
          console.log("match 2")
        }
        project_ids.push(item.project_id)
      }
    })

    data.yaml.aggregated.project_ids.forEach(project_id => {
      if (item.organization_id == data.yaml.organization_id) {
        if (item.project_id == "4102265" && data.yaml.organization_id == "2018128") {
          console.log("match 3")
        }
        candidate_project_ids.push(item.project_id)
      }
    })

    data.yaml.aggregated.project_ids.forEach(project_id => {
      if (item.project_id == project_id) {
        if (item.project_id == "4102265" && data.yaml.organization_id == "2018128") {
          console.log("match 4")
        }
        suspect_project_ids.push(item.project_id)
      }
    })

  })

  if (project_ids.length <= 0) {
    project_ids = candidate_project_ids
  }
  if (project_ids.length <= 0) {
    project_ids = suspect_project_ids
  }
  if (project_ids.length > 0) {

    project_ids = Array.from(new Set(project_ids)).sort((a, b) => {
      // a is less than b by some ordering criterion
      if (a > b) {
        return -1
      }
      // a is greater than b by the ordering criterion
      if (a < b) {
        return 1
      }
      // a must be equal to b
      return 0
    })

    // console.dir(project_ids)

    // data.yaml.calculated_project_ids = project_ids
  }
  */


  // delete data.yaml.calculated_project_ids


  // data.yaml.project_ids = data.yaml.project_ids.sort((a, b) => {
  //   // a is less than b by some ordering criterion
  //   if (a > b) {
  //     return -1
  //   }
  //   // a is greater than b by the ordering criterion
  //   if (a < b) {
  //     return 1
  //   }
  //   // a must be equal to b
  //   return 0
  // })


  // delete data.yaml.project_ids
  // delete data.yaml.aggregated.project_ids

  // if (!data.yaml.year_submitted || data.yaml.year_submitted == null || data.yaml.year_submitted == "" || typeof(data.yaml.year_submitted) != "string") {
  //   console.log("found missing year_submitted: " + data.yaml.organization_id + " :: " + data.yaml.title)
  // }
  // if (!data.yaml.title) {
  //   console.log("found missing title: " + data.yaml.organization_id)
  // }

  if (data.yaml.year_submitted != data.yaml.aggregated.year_submitted[0]) {
    console.log("**** found mismatched year_submitted")
    console.dir(data.yaml)
  }

  // saveMarkdown(filename, data)
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

  // console.dir(files)

  // For each location file
  for (let index = 0; index < files.length; index++) {
    if (files[index].indexOf('.DS_Store') >= 0) continue

    processFile(folder + '/' + files[index])
  }
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

// Create an object for quick lookup
// let markdownProjectsLookup = {}
// let markdownProjectsAggregatedLookup = {}
let projectMarkdownFiles

function createProjectsLookup() {

  // Load the markdown files
  let records = getRecords(`../_projects`)

  // records.forEach(record => {
  //   record.project_ids.forEach(project_id => {
  //     markdownOrganizationsLookup[project_id] = record
  //   })
  //   record.aggregated.project_ids.forEach(project_id => {
  //     markdownOrganizationsAggregatedLookup[project_id] = record
  //   })
  // })

  projectMarkdownFiles = records
}

createProjectsLookup()



updateFolder('../_organizations')


