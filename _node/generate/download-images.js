
'use strict'

let fs = require('fs')
let mkdirp = require('mkdirp')
let yaml = require('js-yaml')
let fetch = require('node-fetch')


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


function processFile(filename) {

  // Load the contents of the file
  let data = loadMarkdown(filename)
  if (!data) {
    processNext()
    return
  }

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
  let writePath = `../assets/images/${folder}/${imagePathWithoutHTTPAndFileName}/`


  if (fs.existsSync(writePath + imageName)) {
    // console.log("Skipping because the file already exists: ")
    // console.log(writePath + imageName)
    processNext()
    return
  }

  // if (data.yaml.project_image.includes('35618139_237603167038940_5367380235643781120_n.jpg')) {
  //   mkdirp(writePath)
  //   processNext()
  //   return
  // }

  // https://www.npmjs.com/package/node-fetch
  fetch(data.yaml.project_image)
    .then(res => {
      return new Promise((resolve, reject) => {
        mkdirp(writePath, function (err) {
          if (err) {
            console.error(err)
          } else {
            const dest = fs.createWriteStream(writePath + imageName)
            res.body.pipe(dest)
            res.body.on('error', err => {
              reject(err)
            })
            dest.on('finish', () => {
              resolve()
            })
            dest.on('error', err => {
              reject(err)
            })
          }
        })
      })
    })
    .then(() => {
      console.log("successfully downloaded: ")
      console.log(data.yaml.project_image)
      console.log(writePath + imageName)
      processNext()
    })
    .catch(err => {    
      console.log("error")
      console.log(data.yaml.project_image)
      console.log(writePath + imageName)
      console.log(err)
      processNext()
    })

  // saveMarkdown(filename, data)
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

let cursor = -1
function processNext() {
  cursor++
  if (cursor >= files.length) return

  if (files[cursor].indexOf('.DS_Store') >= 0) {
    processNext()
    return
  }

  processFile(folder + '/' + files[cursor])
}



let folder = '../_projects'
// let folder = '../_organizations'
let files = getAllFilesFromFolder(folder)
processNext()




// let files
// function updateFolder() {
//   files = getAllFilesFromFolder(folder)
//   processNext()

//   // console.dir(files)

//   // For each location file
//   // for (let index = 0; index < files.length; index++) {
//   //   if (files[index].indexOf('.DS_Store') >= 0) continue

//   //   processFile(folder + '/' + files[index])
//   // }
// }



// node 7+ with async function
 
// (async function () {
//   const res = await fetch('https://api.github.com/users/github')
//   const json = await res.json()
//   console.log(json)
// })()


// 
// // https://stackoverflow.com/questions/12740659/downloading-images-with-node-js#12751657
// 
// const fs    = require( 'fs' )
// const axios = require( 'axios' )
// 
// /* ============================================================
//     Function: Download Image
// ============================================================ */
// 
// const download_image = ( url, image_path ) => axios( { 'url' : url, 'responseType' : 'stream' } ).then( response =>
// {
//     response.data.pipe( fs.createWriteStream( image_path ) )
// 
//     return { 'status' : true, 'error' : '' }
// 
// }).catch( error => ( { 'status' : false, 'error' : 'Error: ' + error.message } ) )
// 
// /* ============================================================
//     Download Images in Order
// ============================================================ */
// 
// (async () =>
// {
//     let example_image_1 = await download_image( 'https://example.com/test-1.png', 'example-1.png' )
// 
//     console.log( example_image_1.status ); // true
//     console.log( example_image_1.error );  // ''
// 
//     let example_image_2 = await download_image( 'https://example.com/does-not-exist.png', 'example-2.png' )
// 
//     console.log( example_image_2.status ); // false
//     console.log( example_image_2.error );  // 'Error: Request failed with status code 404'
// 
//     let example_image_3 = await download_image( 'https://example.com/test-3.png', 'example-3.png' )
// 
//     console.log( example_image_3.status ); // true
//     console.log( example_image_3.error );  // ''
// 
// })()
// 
// 
// 
// 
