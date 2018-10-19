
'use strict'

let fs = require('fs')
let mkdirp = require('mkdirp')
let yaml = require('js-yaml')


function saveMarkdown(filename, data) {
  // console.log('filename')
  // console.log(filename)

  // console.d
  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
`---
${yaml.safeDump(data)}
---`


//console.log(output)
//return

  fs.writeFileSync(filename, output, 'utf8', (err) => {
    if (err) {
      console.log(err)
    }
  })
}



let parentTagsData = yaml.safeLoad(fs.readFileSync('../_data/tags.yaml', 'utf8'));

for (let prop in parentTagsData) {
  if (parentTagsData.hasOwnProperty(prop)) {
    let tag = prop
    saveMarkdown(`../_tags/${tag.replace(/\s/g, "-").toLowerCase()}.md`, { title: `${tag}, My LA2050 Ideas Archive`, tag: tag, is_search_results: true })
    parentTagsData[prop].forEach(tag => {
      saveMarkdown(`../_tags/${tag.replace(/\s/g, "-").toLowerCase()}.md`, { title: `${tag}, My LA2050 Ideas Archive`, tag: tag, is_search_results: true })
    })
  }
}

