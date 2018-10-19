
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

  data.yaml.published = true

  if (data.yaml.project_image.startsWith("'")) {
    console.log("*****found image with quote: " + data.yaml.project_image)
    data.yaml.project_image = data.yaml.project_image.replace(/^'/, "").replace(/'$/, "")
  }

  saveMarkdown(filename, data)
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


updateFolder('../_organizations')


