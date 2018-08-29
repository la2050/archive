

let fs = require('fs')
let inlineCss = require('inline-css')


const fileInput = '../vote/email-auth0-sendgrid.html'
const fileOutput = '../vote/email-auth0-sendgrid-inline-css.html'


let html = fs.readFileSync(fileInput, 'utf8') // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options

// https://www.npmjs.com/package/inline-css
inlineCss(html, { url: 'https://activation.la2050.org', removeStyleTags: false })
    .then(function(html) {
     console.log(html) 

  fs.writeFileSync(fileOutput, html, 'utf8', (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('wrote email with inline css to file: ' + fileOutput)
    }
  })

 })


