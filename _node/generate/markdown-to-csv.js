
'use strict'

let fs = require('fs')
let mkdirp = require('mkdirp')
let parse = require('csv-parse/lib/sync')
let stringify = require('csv-stringify')
let yaml = require('js-yaml')

let fetch = require('node-fetch');

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


const includeColumns = {
  // "published": 1,
  // "organization_id": 1,
  "title": 1,
  "org_type": 1,
  // "org_summary": 1,
  // "tags_indicators": 1,
  // "charity_navigator_url": 1,
  // "organization_website": 1,
  // "twitter": 1,
  // "instagram": 1,
  // "facebook": 1,
  "ein": 1,
  // "zip": 1,
  // "project_image": 1,
  // "project_video": 1,
  // "challenge_url": 1,
  // "year_submitted": 1,
  // "project_ids": 1,
  // "project_titles": 1,
  // "maker_image_file_name": 1,
  // "maker_image_id": 1,
  // "cached_project_image": 1,
  // "youtube_video_identifier": 1,
  "awarded": 1,
  "awarded_details": 1,
  "archive_url": 1,
  "pledgling_check": 1,
  "pledgling_url": 1
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
    if (uniqueColumnNames.hasOwnProperty(name) && includeColumns[name]) {
      columns.push(name)
    }
  }

  return columns
}


function getFormattedEIN(ein) {
  // Remove everything except numeric characters
  ein = ein.replace(/[^0-9]/g, "");

  // Re-add dashes in valid locations
  var einArray = [];
  einArray.push(ein.slice(0, 2));
  einArray.push(ein.slice(2, 9));
  if (ein.length > 9) {
    einArray.push(ein.slice(9));
  }
  ein = einArray.join("-");

  return ein;
}


function saveCSVFile(filePath, records) {

  let data = []
  let columns = getColumns(records)
  data.push(columns)

  records.forEach(item => {
    let array = []
    columns.forEach(column => {
      let value = item[column]
      // if (column === "project_image" && value) {
      //   value = `https://challenge.la2050.org${item.url}${value}`
      // }
      if (column === "organization_website" && value && value.length > 0) {
        value = value[0]
      }
      if (column === "ein" && value && value.length >= 9) {
        value = getFormattedEIN(value)
      }
      if (includeColumns[column]) {
        array.push(value)
      }
    })
    if (item.org_type === "Nonprofit") {
      data.push(array)
    }
  })

  stringify(data, function(err, output){     
    fs.writeFile(filePath, output, 'utf8', (err) => {
      if (err) {
        console.log(err)
      }
    }) 
  })
}


async function getRecords(folder) {
  let files = getAllFilesFromFolder(folder)

  let records = []
  for (let index = 0; index < files.length; index++) {
  // for (let index = 0; index < 10; index++) {
    if (files[index].indexOf('.DS_Store') >= 0) continue

    // Load the contents of the file
    let data = loadMarkdown(files[index])
    if (!data) continue

    // Skip unpublished organizations
    if (data.yaml.published != true) continue

    const uri = files[index].split("/").pop().split(".").shift()

    data.yaml.archive_url = `https://archive.la2050.org/${uri}`
    // console.log(data.yaml.archive_url)

    const awarded = notableLookup[uri]
    if (awarded) {
      if (awarded.is_winner) {
        data.yaml.awarded = "winner"
      } else if (awarded.is_finalist) {
        data.yaml.awarded = "finalist"
      } else if (awarded.is_honorable_mention) {
        data.yaml.awarded = "honorable_mention"
      }
      data.yaml.awarded_details = awarded.notableText
    }

    if (data.yaml.org_type === "Nonprofit" &&
        data.yaml.ein && data.yaml.ein.length >= 9) {

      data.yaml.pledgling_url = `https://hello.pledgeling.com/widgets/donate/9c525e74792245ce4c4d5b96fc51b67b/ein/${getFormattedEIN(data.yaml.ein)}?subscription=monthly`
      const response = await fetch(data.yaml.pledgling_url);

      if (response.status == 404) {
        data.yaml.pledgling_check = "404"
      } else {
        data.yaml.pledgling_check = ""
      }
    } else {
      data.yaml.pledgling_check = ""
    }

    // Add the data to the list of records
    records.push(data.yaml)
  }
  return records
}


/*
To generate notableText…

1) Visit: https://archive.la2050.org/search/?keywords=

2) Run this JavaScript in the console:

```
let list = document.getElementById("project-list")

let items = list.querySelectorAll("li")

let data = []
for (let item of items) {
  if (item.querySelector("small")) {
    data.push({
      url: item.querySelector("a").getAttribute("href"),
      notableText: item.querySelector("small").innerText
    })
  }
}

JSON.stringify(data)
```



3) Copy the result and paste into a beautifier:
https://duckduckgo.com/?q=json+beautify&t=ffab&ia=answer

4) Copy and paste the JSON into this file
*/



const notableText = [
  {
    "url": "/casa-of-los-angeles/",
    "notableText": "2019 Winner, 2015 Winner"
  },
  {
    "url": "/the-youth-movement-against-alzheimers/",
    "notableText": "2019 Winner"
  },
  {
    "url": "/harlem-lacrosse-los-angeles/",
    "notableText": "2019 Winner"
  },
  {
    "url": "/la-plaza-de-cultura-y-artes/",
    "notableText": "2019 Winner"
  },
  {
    "url": "/natural-history-museum-of-los-angeles-county/",
    "notableText": "2019 Winner"
  },
  {
    "url": "/venice-community-housing/",
    "notableText": "2019 Winner"
  },
  {
    "url": "/rock-the-vote/",
    "notableText": "2019 Winner"
  },
  {
    "url": "/rise-inc/",
    "notableText": "2019 Winner"
  },
  {
    "url": "/defy-ventures-inc/",
    "notableText": "2019 Winner"
  },
  {
    "url": "/9-dots/",
    "notableText": "2019 Winner"
  },
  {
    "url": "/center-for-innovation-in-stem-education-cise/",
    "notableText": "2018 Winner, 2019 Finalist"
  },
  {
    "url": "/united-way-of-greater-los-angeles/",
    "notableText": "2018 Winner"
  },
  {
    "url": "/east-la-community-corporation-elacc/",
    "notableText": "2018 Winner, 2013 Winner"
  },
  {
    "url": "/the-brady-center-to-prevent-gun-violence/",
    "notableText": "2018 Winner"
  },
  {
    "url": "/mirys-list/",
    "notableText": "2018 Winner"
  },
  {
    "url": "/big-citizen-hub/",
    "notableText": "2016 Winner"
  },
  {
    "url": "/lost-angels-childrens-project/",
    "notableText": "2016 Winner, 2019 Finalist"
  },
  {
    "url": "/opportunity-fund/",
    "notableText": "2016 Winner"
  },
  {
    "url": "/surf-bus-foundation/",
    "notableText": "2016 Winner"
  },
  {
    "url": "/tierra-del-sol-foundation/",
    "notableText": "2016 Winner"
  },
  {
    "url": "/the-sierra-club-foundation/",
    "notableText": "2016 Winner"
  },
  {
    "url": "/the-triforium-project/",
    "notableText": "2016 Winner"
  },
  {
    "url": "/geena-davis-institute-on-gender-in-media-at-mount-saint-marys-university/",
    "notableText": "2016 Winner"
  },
  {
    "url": "/friends-of-the-family/",
    "notableText": "2016 Winner"
  },
  {
    "url": "/covenant-house-california/",
    "notableText": "2016 Winner"
  },
  {
    "url": "/california-institute-of-technology/",
    "notableText": "2016 Winner"
  },
  {
    "url": "/altasea-at-the-port-of-los-angeles/",
    "notableText": "2016 Winner"
  },
  {
    "url": "/los-angeles-review-of-books/",
    "notableText": "2015 Winner"
  },
  {
    "url": "/los-angeles-bioscience-hub/",
    "notableText": "2015 Winner"
  },
  {
    "url": "/people-for-parks/",
    "notableText": "2015 Winner, 2018 Honorable Mention"
  },
  {
    "url": "/girls-academic-leadership-academy-gala/",
    "notableText": "2015 Winner"
  },
  {
    "url": "/citizens-of-the-world-charter-schools-los-angeles/",
    "notableText": "2015 Winner"
  },
  {
    "url": "/heal-the-bay/",
    "notableText": "2015 Winner"
  },
  {
    "url": "/performing-arts-center-of-los-angeles-county-aka-the-music-center-grand-park/",
    "notableText": "2015 Winner"
  },
  {
    "url": "/los-angeles-promise-zone-initiative-la-mayors-office-of-economic-development-c-o-mayors-fund-for-los-angeles/",
    "notableText": "2015 Winner"
  },
  {
    "url": "/iraq-and-afghanistan-veterans-of-america-iava/",
    "notableText": "2015 Winner"
  },
  {
    "url": "/city-year-los-angeles/",
    "notableText": "2014 Winner"
  },
  {
    "url": "/move-la/",
    "notableText": "2014 Winner, 2019 Finalist"
  },
  {
    "url": "/ucla-grand-challenges/",
    "notableText": "2014 Winner, 2019 Finalist"
  },
  {
    "url": "/the-trust-for-public-land/",
    "notableText": "2014 Winner, 2018 Finalist"
  },
  {
    "url": "/sbcc-thrive-la/",
    "notableText": "2014 Winner"
  },
  {
    "url": "/downtown-womens-center/",
    "notableText": "2014 Winner"
  },
  {
    "url": "/the-incubator-school/",
    "notableText": "2014 Winner"
  },
  {
    "url": "/pershing-square-park-advisory-board/",
    "notableText": "2014 Winner"
  },
  {
    "url": "/enrichla/",
    "notableText": "2014 Winner"
  },
  {
    "url": "/special-olympics-world-games-2015/",
    "notableText": "2014 Winner"
  },
  {
    "url": "/homeboy-industries/",
    "notableText": "2013 Winner, 2018 Honorable Mention, 2019 Finalist"
  },
  {
    "url": "/ciclavia/",
    "notableText": "2013 Winner"
  },
  {
    "url": "/826la/",
    "notableText": "2013 Winner"
  },
  {
    "url": "/community-health-councils/",
    "notableText": "2013 Winner"
  },
  {
    "url": "/public-matters/",
    "notableText": "2013 Winner"
  },
  {
    "url": "/trust-south-la-tenemos-que-reclamar-y-unidos-salvar-la-tierra-south-la/",
    "notableText": "2013 Winner"
  },
  {
    "url": "/no-right-brain-left-behind-and-green-dot-schools/",
    "notableText": "2013 Winner"
  },
  {
    "url": "/mission-asset-fund/",
    "notableText": "2013 Winner"
  },
  {
    "url": "/hammer-museum/",
    "notableText": "2013 Winner"
  },
  {
    "url": "/youth-policy-institute/",
    "notableText": "2018 Honorable Mention, 2019 Finalist"
  },
  {
    "url": "/children-now/",
    "notableText": "2018 Honorable Mention"
  },
  {
    "url": "/investing-in-place/",
    "notableText": "2018 Honorable Mention, 2019 Finalist"
  },
  {
    "url": "/one-degree/",
    "notableText": "2018 Honorable Mention"
  },
  {
    "url": "/make-it-in-la/",
    "notableText": "2018 Honorable Mention"
  },
  {
    "url": "/two-bit-circus-foundation/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/world-harvest-charities-family-services/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/voterunlead/",
    "notableText": "2018 Finalist"
  },
  {
    "url": "/los-angeles-dodgers-foundation/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/larchmont-charter-school/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/charles-r-drew-university-of-medicine-and-science/",
    "notableText": "2018 Finalist"
  },
  {
    "url": "/cardborigami-inc/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/city-of-los-angeles-department-of-recreation-and-parks/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/union-rescue-mission/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/los-angeles-audubon-society-laas/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/planned-parenthood-pasadena-and-san-gabriel-valley/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/treepeople/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/womens-center-for-creative-work/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/fulfillment-fund/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/women-in-film/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/turnaround-arts-california/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/the-tiyya-foundation/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/the-midnight-mission/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/the-fit-kids-foundation/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/stoked-mentoring-inc/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/santa-monica-college/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/plus-me-project/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/onegeneration/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/justice-for-my-sister-collective/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/international-association-for-human-values/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/human-rights-foundation/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/green-girl-farms/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/gladeo/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/freedom-and-fashion/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/everybody-world/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/c-it-productions-llc/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/breathe-california-of-los-angeles-county/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/bob-baker-marionette-theater/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/american-heart-association/",
    "notableText": "2019 Finalist"
  },
  {
    "url": "/big-brothers-big-sisters-of-greater-los-angeles/",
    "notableText": "2018 Finalist"
  },
  {
    "url": "/kounkuey-design-initiative/",
    "notableText": "2018 Finalist"
  },
  {
    "url": "/long-beach-downtown-development-corporation/",
    "notableText": "2018 Finalist"
  },
  {
    "url": "/l-a-kitchen/",
    "notableText": "2018 Finalist"
  },
  {
    "url": "/environment-california-research-policy-center/",
    "notableText": "2018 Finalist"
  },
  {
    "url": "/common-sense/",
    "notableText": "2018 Finalist"
  },
  {
    "url": "/brioxy/",
    "notableText": "2018 Finalist"
  },
  {
    "url": "/crayon-collection/",
    "notableText": "2019"
  },
  {
    "url": "/lift-los-angeles/",
    "notableText": "2019"
  },
  {
    "url": "/los-angeles-service-academy-lasa/",
    "notableText": "2019"
  },
  {
    "url": "/the-natch-inc/",
    "notableText": "2019"
  },
  {
    "url": "/team-rubicon/",
    "notableText": "2019"
  },
  {
    "url": "/red-hen-press/",
    "notableText": "2019"
  },
  {
    "url": "/the-national-association-of-latino-independent-producers-nalip/",
    "notableText": "2019"
  },
  {
    "url": "/united-parents-and-students/",
    "notableText": "2019"
  },
  {
    "url": "/the-people-of-change/",
    "notableText": "2019"
  },
  {
    "url": "/shoes-that-fit/",
    "notableText": "2019"
  },
  {
    "url": "/my-friends-house-inc/",
    "notableText": "2019"
  },
  {
    "url": "/living-through-giving-foundation/",
    "notableText": "2019"
  },
  {
    "url": "/lawmaker-io/",
    "notableText": "2019"
  },
  {
    "url": "/la-forward/",
    "notableText": "2019"
  },
  {
    "url": "/hacker-fund/",
    "notableText": "2019"
  },
  {
    "url": "/film-independent/",
    "notableText": "2019"
  },
  {
    "url": "/civic-innovation-lab/",
    "notableText": "2019"
  },
  {
    "url": "/scv-adventure-play-foundation/",
    "notableText": "2019"
  },
  {
    "url": "/theodore-payne-foundation-for-wild-flower-and-native-plants/",
    "notableText": "2019"
  },
  {
    "url": "/spark-los-angeles/",
    "notableText": "2019"
  },
  {
    "url": "/3-d-space/",
    "notableText": "2019"
  },
  {
    "url": "/pacoima-beautiful/",
    "notableText": "2019"
  },
  {
    "url": "/usc-annenberg-innovation-lab/",
    "notableText": "2019"
  },
  {
    "url": "/the-engineer-factory-a-project-of-community-partners/",
    "notableText": "2019"
  },
  {
    "url": "/perceptoscope/",
    "notableText": "2019"
  },
  {
    "url": "/icon-cdc/",
    "notableText": "2019"
  },
  {
    "url": "/encorps-inc/",
    "notableText": "2019"
  },
  {
    "url": "/el-porto-shark/",
    "notableText": "2019"
  },
  {
    "url": "/unycyn-civic-arts/",
    "notableText": "2019"
  },
  {
    "url": "/unite-la/",
    "notableText": "2019"
  },
  {
    "url": "/root-down-la/",
    "notableText": "2019"
  },
  {
    "url": "/partnership-for-los-angeles-schools/",
    "notableText": "2019"
  },
  {
    "url": "/boys-girls-clubs-of-carson/",
    "notableText": "2019"
  },
  {
    "url": "/after-school-all-stars-los-angeles/",
    "notableText": "2019"
  },
  {
    "url": "/advancement-project-california/",
    "notableText": "2019"
  },
  {
    "url": "/safecast/",
    "notableText": "2019"
  },
  {
    "url": "/newfilmmakers-los-angeles/",
    "notableText": "2019"
  },
  {
    "url": "/new-america-foundation-ca-civic-innovation-project/",
    "notableText": "2019"
  },
  {
    "url": "/mighty-companions/",
    "notableText": "2019"
  },
  {
    "url": "/yes-we-can-world-foundation/",
    "notableText": "2019"
  },
  {
    "url": "/w-tenth-co/",
    "notableText": "2019"
  },
  {
    "url": "/urban-encore-symphony-and-singers/",
    "notableText": "2019"
  },
  {
    "url": "/unlitterla/",
    "notableText": "2019"
  },
  {
    "url": "/tunson-leadership-foundation/",
    "notableText": "2019"
  },
  {
    "url": "/the-urban-warehouse/",
    "notableText": "2019"
  },
  {
    "url": "/the-institution-for-art-and-olfaction/",
    "notableText": "2019"
  },
  {
    "url": "/the-editorialist-la/",
    "notableText": "2019"
  },
  {
    "url": "/the-civics-center/",
    "notableText": "2019"
  },
  {
    "url": "/the-abc-club/",
    "notableText": "2019"
  },
  {
    "url": "/shared-harvest/",
    "notableText": "2019"
  },
  {
    "url": "/sense-la/",
    "notableText": "2019"
  },
  {
    "url": "/rebel-labs-inc/",
    "notableText": "2019"
  },
  {
    "url": "/procon-org/",
    "notableText": "2019"
  },
  {
    "url": "/pop-culture-hero-coalition/",
    "notableText": "2019"
  },
  {
    "url": "/office-of-mayor-eric-garcetti-census-2020-initiative/",
    "notableText": "2019"
  },
  {
    "url": "/novelly/",
    "notableText": "2019"
  },
  {
    "url": "/new-earth/",
    "notableText": "2019"
  },
  {
    "url": "/navel/",
    "notableText": "2019"
  },
  {
    "url": "/national-health-foundation/",
    "notableText": "2019"
  },
  {
    "url": "/mrs-hr/",
    "notableText": "2019"
  },
  {
    "url": "/mayors-fund-for-education-fiscal-sponsor-community-partners/",
    "notableText": "2019"
  },
  {
    "url": "/manifestworks/",
    "notableText": "2019"
  },
  {
    "url": "/m2m-bell/",
    "notableText": "2019"
  },
  {
    "url": "/los-angeles-county-grand-park-foundation/",
    "notableText": "2019"
  },
  {
    "url": "/los-angeles-conservation-corps/",
    "notableText": "2019"
  },
  {
    "url": "/los-angeles-blockchain-lab/",
    "notableText": "2019"
  },
  {
    "url": "/joy-factory/",
    "notableText": "2019"
  },
  {
    "url": "/international-visitors-council-of-los-angeles/",
    "notableText": "2019"
  },
  {
    "url": "/inspiring-service/",
    "notableText": "2019"
  },
  {
    "url": "/infinity-studio-8/",
    "notableText": "2019"
  },
  {
    "url": "/in-the-making/",
    "notableText": "2019"
  },
  {
    "url": "/hytch-llc/",
    "notableText": "2019"
  },
  {
    "url": "/human-i-t/",
    "notableText": "2019"
  },
  {
    "url": "/housing-corporation-of-america/",
    "notableText": "2019"
  },
  {
    "url": "/havasole/",
    "notableText": "2019"
  },
  {
    "url": "/glendale-college-parent-education-association/",
    "notableText": "2019"
  },
  {
    "url": "/getglobal-inc/",
    "notableText": "2019"
  },
  {
    "url": "/futureports/",
    "notableText": "2019"
  },
  {
    "url": "/foodcycle-la/",
    "notableText": "2019"
  },
  {
    "url": "/esperanza-community-housing-healthy-breathing-program/",
    "notableText": "2019"
  },
  {
    "url": "/equal-pay-company/",
    "notableText": "2019"
  },
  {
    "url": "/earios/",
    "notableText": "2019"
  },
  {
    "url": "/deedly-inc/",
    "notableText": "2019"
  },
  {
    "url": "/creator-force-at-civic-nation/",
    "notableText": "2019"
  },
  {
    "url": "/community-vitalization-council/",
    "notableText": "2019"
  },
  {
    "url": "/community-veteran-justice-project/",
    "notableText": "2019"
  },
  {
    "url": "/climate-uprising-interconnected-media/",
    "notableText": "2019"
  },
  {
    "url": "/circle-of-friends-the-path-to-inclusion-a-project-of-community-partners/",
    "notableText": "2019"
  },
  {
    "url": "/calmatters/",
    "notableText": "2019"
  },
  {
    "url": "/california-common-cause-naleo-educational-fund-disability-rights-california-and-asian-americans-advancing-justice-la/",
    "notableText": "2019"
  },
  {
    "url": "/california-center-for-economic-initiatives/",
    "notableText": "2019"
  },
  {
    "url": "/cal-state-l-a-university-auxiliary-services-inc/",
    "notableText": "2019"
  },
  {
    "url": "/b~stem-project-foundation/",
    "notableText": "2019"
  },
  {
    "url": "/building-skills-partnership/",
    "notableText": "2019"
  },
  {
    "url": "/american-digital-diversity-initiative/",
    "notableText": "2019"
  },
  {
    "url": "/ahdom-sayre/",
    "notableText": "2019"
  },
  {
    "url": "/neighborhood-housing-services-of-los-angeles-county/",
    "notableText": "2018"
  },
  {
    "url": "/data-roads-foundation/",
    "notableText": "2018"
  },
  {
    "url": "/synaccord-llc/",
    "notableText": "2018"
  },
  {
    "url": "/la-compost/",
    "notableText": "2018"
  },
  {
    "url": "/citizens-of-culture/",
    "notableText": "2018"
  },
  {
    "url": "/university-of-southern-california/",
    "notableText": "2018"
  },
  {
    "url": "/las-best/",
    "notableText": "2018"
  },
  {
    "url": "/global-green/",
    "notableText": "2018"
  },
  {
    "url": "/childrens-action-network/",
    "notableText": "2018"
  },
  {
    "url": "/think-tank-productions-inc-dba-think-tank-gallery/",
    "notableText": "2018"
  },
  {
    "url": "/seedla/",
    "notableText": "2018"
  },
  {
    "url": "/produceathon/",
    "notableText": "2018"
  },
  {
    "url": "/podshare/",
    "notableText": "2018"
  },
  {
    "url": "/imagine-la/",
    "notableText": "2018"
  },
  {
    "url": "/get-lit-words-ignite/",
    "notableText": "2018"
  },
  {
    "url": "/los-angeles-alliance-for-a-new-economy-fair-workweek/",
    "notableText": "2018"
  },
  {
    "url": "/promesa-boyle-heights-at-proyecto-pastoral/",
    "notableText": "2018"
  },
  {
    "url": "/la-river-public-art-project-c-o-erw-design/",
    "notableText": "2018"
  },
  {
    "url": "/grid110-inc/",
    "notableText": "2018"
  },
  {
    "url": "/center-for-council-a-project-of-community-partners/",
    "notableText": "2018"
  },
  {
    "url": "/peer-health-exchange/",
    "notableText": "2018"
  },
  {
    "url": "/raise-a-child-inc/",
    "notableText": "2018"
  },
  {
    "url": "/proyecto-jardin-a-project-of-hunger-action-la/",
    "notableText": "2018"
  },
  {
    "url": "/los-angeles-lgbt-center/",
    "notableText": "2018"
  },
  {
    "url": "/la-commons-a-project-of-community-partners/",
    "notableText": "2018"
  },
  {
    "url": "/child360-formerly-los-angeles-universal-preschool/",
    "notableText": "2018"
  },
  {
    "url": "/boys-girls-clubs-of-venice/",
    "notableText": "2018"
  },
  {
    "url": "/world-famous-vip-records-llc/",
    "notableText": "2018"
  },
  {
    "url": "/we-are-the-mighty/",
    "notableText": "2018"
  },
  {
    "url": "/we-are-enough-c-o-social-environmental-entrepreneurs/",
    "notableText": "2018"
  },
  {
    "url": "/walk-with-sally/",
    "notableText": "2018"
  },
  {
    "url": "/ucla-mobile-eye-clinic-umec/",
    "notableText": "2018"
  },
  {
    "url": "/ucla-center-for-health-services-and-society/",
    "notableText": "2018"
  },
  {
    "url": "/twigg-how-to/",
    "notableText": "2018"
  },
  {
    "url": "/topanga-womens-circle/",
    "notableText": "2018"
  },
  {
    "url": "/the-glue/",
    "notableText": "2018"
  },
  {
    "url": "/the-burg-llc/",
    "notableText": "2018"
  },
  {
    "url": "/s%C3%BCprseed-inc/",
    "notableText": "2018"
  },
  {
    "url": "/stellas-socks/",
    "notableText": "2018"
  },
  {
    "url": "/south-bay-bicycle-coalition/",
    "notableText": "2018"
  },
  {
    "url": "/smartairla/",
    "notableText": "2018"
  },
  {
    "url": "/small-business-majority/",
    "notableText": "2018"
  },
  {
    "url": "/science-academy-for-all/",
    "notableText": "2018"
  },
  {
    "url": "/roots-wings/",
    "notableText": "2018"
  },
  {
    "url": "/roadtrip-nation/",
    "notableText": "2018"
  },
  {
    "url": "/revolutionize-hollywood/",
    "notableText": "2018"
  },
  {
    "url": "/regional-la/",
    "notableText": "2018"
  },
  {
    "url": "/notow/",
    "notableText": "2018"
  },
  {
    "url": "/not-impossible-foundation/",
    "notableText": "2018"
  },
  {
    "url": "/national-veterans-transition-services-inc-aka-reboot/",
    "notableText": "2018"
  },
  {
    "url": "/mutuo/",
    "notableText": "2018"
  },
  {
    "url": "/multicultural-communities-for-mobility-a-project-of-community-partners/",
    "notableText": "2018"
  },
  {
    "url": "/mentoring-adolescents-for-personal-professional-success/",
    "notableText": "2018"
  },
  {
    "url": "/mayors-fund-for-los-angeles/",
    "notableText": "2018"
  },
  {
    "url": "/mar-vista-family-center/",
    "notableText": "2018"
  },
  {
    "url": "/lumos-transforms/",
    "notableText": "2018"
  },
  {
    "url": "/los-angeles-master-chorale/",
    "notableText": "2018"
  },
  {
    "url": "/los-angeles-county-registrar-recorder-county-clerk/",
    "notableText": "2018"
  },
  {
    "url": "/lola/",
    "notableText": "2018"
  },
  {
    "url": "/lola-techsystems-inc/",
    "notableText": "2018"
  },
  {
    "url": "/lava-mae/",
    "notableText": "2018"
  },
  {
    "url": "/kitchen-table-app/",
    "notableText": "2018"
  },
  {
    "url": "/justice-la-dignity-and-power-now/",
    "notableText": "2018"
  },
  {
    "url": "/health-core-possibilities/",
    "notableText": "2018"
  },
  {
    "url": "/happyperiod/",
    "notableText": "2018"
  },
  {
    "url": "/gracias-music-foundation/",
    "notableText": "2018"
  },
  {
    "url": "/good-shine-studio/",
    "notableText": "2018"
  },
  {
    "url": "/geffen-academy-at-ucla/",
    "notableText": "2018"
  },
  {
    "url": "/future-america/",
    "notableText": "2018"
  },
  {
    "url": "/freefrom/",
    "notableText": "2018"
  },
  {
    "url": "/family-promise-of-the-south-bay/",
    "notableText": "2018"
  },
  {
    "url": "/everwild/",
    "notableText": "2018"
  },
  {
    "url": "/eayikes/",
    "notableText": "2018"
  },
  {
    "url": "/data-360/",
    "notableText": "2018"
  },
  {
    "url": "/coro-southern-california/",
    "notableText": "2018"
  },
  {
    "url": "/connect-to-compete-inc-everyoneon/",
    "notableText": "2018"
  },
  {
    "url": "/city-of-los-angeles-information-technology-agency/",
    "notableText": "2018"
  },
  {
    "url": "/city-of-los-angeles-bureau-of-street-lighting/",
    "notableText": "2018"
  },
  {
    "url": "/city-impact-lab-powered-by-stratiscope/",
    "notableText": "2018"
  },
  {
    "url": "/city-fabrick/",
    "notableText": "2018"
  },
  {
    "url": "/caleitc4me/",
    "notableText": "2018"
  },
  {
    "url": "/black-women-for-wellness/",
    "notableText": "2018"
  },
  {
    "url": "/all-in-urban-summer-academy/",
    "notableText": "2018"
  },
  {
    "url": "/action-civics-la-an-initiative-of-mikva-challenge/",
    "notableText": "2018"
  },
  {
    "url": "/a-healthier-community-starts-with-youth/",
    "notableText": "2018"
  },
  {
    "url": "/t4t-org/",
    "notableText": "2016"
  },
  {
    "url": "/bicycle-culture-institute/",
    "notableText": "2016"
  },
  {
    "url": "/teach-for-america-los-angeles/",
    "notableText": "2016"
  },
  {
    "url": "/jenesse-center-inc/",
    "notableText": "2016"
  },
  {
    "url": "/college-track/",
    "notableText": "2016"
  },
  {
    "url": "/united-friends-of-the-children/",
    "notableText": "2016"
  },
  {
    "url": "/tickleberry-place/",
    "notableText": "2016"
  },
  {
    "url": "/the-childrens-lifesaving-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/t-l-foundation-for-child-care-information/",
    "notableText": "2016"
  },
  {
    "url": "/powermylearning-inc/",
    "notableText": "2016"
  },
  {
    "url": "/mujeres-de-la-tierra/",
    "notableText": "2016"
  },
  {
    "url": "/milk-bookies/",
    "notableText": "2016"
  },
  {
    "url": "/groceryships-and-netiya/",
    "notableText": "2016"
  },
  {
    "url": "/grid-logistics/",
    "notableText": "2016"
  },
  {
    "url": "/dstl-arts-the-partnership-for-los-angeles-creative-education-the-place/",
    "notableText": "2016"
  },
  {
    "url": "/the-river-project/",
    "notableText": "2016"
  },
  {
    "url": "/people-for-the-american-way-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/youth-business-alliance/",
    "notableText": "2016"
  },
  {
    "url": "/the-ojai-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/the-love-story-media-inc/",
    "notableText": "2016"
  },
  {
    "url": "/the-edible-apartment/",
    "notableText": "2016"
  },
  {
    "url": "/the-academy-project/",
    "notableText": "2016"
  },
  {
    "url": "/tech-la-cares/",
    "notableText": "2016"
  },
  {
    "url": "/sola-food-co-op/",
    "notableText": "2016"
  },
  {
    "url": "/richstone-family-center/",
    "notableText": "2016"
  },
  {
    "url": "/relational-medicine-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/planned-parenthood-los-angeles-ppla/",
    "notableText": "2016"
  },
  {
    "url": "/pieces/",
    "notableText": "2016"
  },
  {
    "url": "/patrick-henry-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/parents-education-league/",
    "notableText": "2016"
  },
  {
    "url": "/la-voice/",
    "notableText": "2016"
  },
  {
    "url": "/l-a-works/",
    "notableText": "2016"
  },
  {
    "url": "/kcrw/",
    "notableText": "2016"
  },
  {
    "url": "/joyful-heart-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/impact-hub-los-angeles/",
    "notableText": "2016"
  },
  {
    "url": "/hollywood-fringe-festival-hatchery-arts/",
    "notableText": "2016"
  },
  {
    "url": "/girls-inc-of-greater-los-angeles/",
    "notableText": "2016"
  },
  {
    "url": "/concerned-capital/",
    "notableText": "2016"
  },
  {
    "url": "/common-threads/",
    "notableText": "2016"
  },
  {
    "url": "/coachart/",
    "notableText": "2016"
  },
  {
    "url": "/blacklistla/",
    "notableText": "2016"
  },
  {
    "url": "/arts-for-incarcerated-youth-network/",
    "notableText": "2016"
  },
  {
    "url": "/los-angeles-food-policy-council/",
    "notableText": "2016"
  },
  {
    "url": "/us-green-building-council-la/",
    "notableText": "2016"
  },
  {
    "url": "/the-jester-pharley-phund/",
    "notableText": "2016"
  },
  {
    "url": "/pen-center-usa-pen-usa/",
    "notableText": "2016"
  },
  {
    "url": "/land-los-angeles-nomadic-division/",
    "notableText": "2016"
  },
  {
    "url": "/everyoneon/",
    "notableText": "2016"
  },
  {
    "url": "/digdeep-water/",
    "notableText": "2016"
  },
  {
    "url": "/college-bridge/",
    "notableText": "2016"
  },
  {
    "url": "/california-partnership/",
    "notableText": "2016"
  },
  {
    "url": "/ryman-arts/",
    "notableText": "2016"
  },
  {
    "url": "/fallen-fruit/",
    "notableText": "2016"
  },
  {
    "url": "/educators-4-excellence-los-angeles/",
    "notableText": "2016"
  },
  {
    "url": "/big-sunday/",
    "notableText": "2016"
  },
  {
    "url": "/zeneith-performing-arts/",
    "notableText": "2016"
  },
  {
    "url": "/wyota-workshop-inc/",
    "notableText": "2016"
  },
  {
    "url": "/wow-imagined-inc/",
    "notableText": "2016"
  },
  {
    "url": "/worthy-of-love/",
    "notableText": "2016"
  },
  {
    "url": "/wish-academy-high-school/",
    "notableText": "2016"
  },
  {
    "url": "/wisdom-arts-laboratory/",
    "notableText": "2016"
  },
  {
    "url": "/whitaker-peace-development-initiative-wpdi/",
    "notableText": "2016"
  },
  {
    "url": "/wethrive/",
    "notableText": "2016"
  },
  {
    "url": "/westside-urban-forum/",
    "notableText": "2016"
  },
  {
    "url": "/verdical-group/",
    "notableText": "2016"
  },
  {
    "url": "/valley-relics/",
    "notableText": "2016"
  },
  {
    "url": "/university-of-southern-california-viterbi-stem-educational-outreach-programs-office/",
    "notableText": "2016"
  },
  {
    "url": "/university-of-southern-california-mobile-environmental-media-lab-in-the-school-of-cinematic-arts/",
    "notableText": "2016"
  },
  {
    "url": "/united-nations-association-usa-pasadena-chapter-inc/",
    "notableText": "2016"
  },
  {
    "url": "/unite-a-nation-inc/",
    "notableText": "2016"
  },
  {
    "url": "/unified-everything-project/",
    "notableText": "2016"
  },
  {
    "url": "/ucla-institute-of-the-environment-and-sustainability-ioes/",
    "notableText": "2016"
  },
  {
    "url": "/thecool/",
    "notableText": "2016"
  },
  {
    "url": "/the-ron-finley-project/",
    "notableText": "2016"
  },
  {
    "url": "/the-pedagogical-institute-of-los-angeles/",
    "notableText": "2016"
  },
  {
    "url": "/the-now-institute-ucla/",
    "notableText": "2016"
  },
  {
    "url": "/the-national-wildlife-federation/",
    "notableText": "2016"
  },
  {
    "url": "/the-ladyparts-collective-fiscally-sponsored-by-fractured-atlas/",
    "notableText": "2016"
  },
  {
    "url": "/the-jane-goodall-institute/",
    "notableText": "2016"
  },
  {
    "url": "/the-integrated-learning-annex/",
    "notableText": "2016"
  },
  {
    "url": "/the-help-groups-stem3-academy/",
    "notableText": "2016"
  },
  {
    "url": "/the-harmony-project/",
    "notableText": "2016"
  },
  {
    "url": "/the-garage-board-shop/",
    "notableText": "2016"
  },
  {
    "url": "/the-c-i-t-y-x1-youth-group/",
    "notableText": "2016"
  },
  {
    "url": "/the-burg/",
    "notableText": "2016"
  },
  {
    "url": "/the-billboard-creative-tbc/",
    "notableText": "2016"
  },
  {
    "url": "/tampon-tribe/",
    "notableText": "2016"
  },
  {
    "url": "/sundance-institute/",
    "notableText": "2016"
  },
  {
    "url": "/stem-advantage/",
    "notableText": "2016"
  },
  {
    "url": "/sportup/",
    "notableText": "2016"
  },
  {
    "url": "/southern-california-public-radio-kpcc/",
    "notableText": "2016"
  },
  {
    "url": "/southern-california-center-for-nonprofit-management/",
    "notableText": "2016"
  },
  {
    "url": "/south-bay-center-for-counseling-sbcc/",
    "notableText": "2016"
  },
  {
    "url": "/sound-body-sound-mind-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/sky-source/",
    "notableText": "2016"
  },
  {
    "url": "/silvermotion-inc/",
    "notableText": "2016"
  },
  {
    "url": "/sijcc/",
    "notableText": "2016"
  },
  {
    "url": "/sca-larc/",
    "notableText": "2016"
  },
  {
    "url": "/say-word-and-4c-lab/",
    "notableText": "2016"
  },
  {
    "url": "/safe-streets-are-for-everyone/",
    "notableText": "2016"
  },
  {
    "url": "/safe-refuge/",
    "notableText": "2016"
  },
  {
    "url": "/river-la-formerly-la-river-revitalization-corporation/",
    "notableText": "2016"
  },
  {
    "url": "/represent/",
    "notableText": "2016"
  },
  {
    "url": "/regents-of-the-university-of-california/",
    "notableText": "2016"
  },
  {
    "url": "/public-health-foundation-enterprises/",
    "notableText": "2016"
  },
  {
    "url": "/pssst/",
    "notableText": "2016"
  },
  {
    "url": "/proyecto-pastoral/",
    "notableText": "2016"
  },
  {
    "url": "/pretty-good-cat/",
    "notableText": "2016"
  },
  {
    "url": "/port-of-los-angeles-high-school/",
    "notableText": "2016"
  },
  {
    "url": "/plantaware/",
    "notableText": "2016"
  },
  {
    "url": "/pedagogics-coaching-group/",
    "notableText": "2016"
  },
  {
    "url": "/peaceworks-international/",
    "notableText": "2016"
  },
  {
    "url": "/patrick-mccaffrey-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/pasadena-educational-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/operation-gratitude/",
    "notableText": "2016"
  },
  {
    "url": "/office-of-exposition-park-management/",
    "notableText": "2016"
  },
  {
    "url": "/new-roads-school/",
    "notableText": "2016"
  },
  {
    "url": "/new-directions-for-youth-inc/",
    "notableText": "2016"
  },
  {
    "url": "/national-foster-youth-institute/",
    "notableText": "2016"
  },
  {
    "url": "/national-council-of-jewish-women-los-angeles/",
    "notableText": "2016"
  },
  {
    "url": "/nation-of-vibration/",
    "notableText": "2016"
  },
  {
    "url": "/nami-san-fernando-valley/",
    "notableText": "2016"
  },
  {
    "url": "/muscular-dystrophy-association/",
    "notableText": "2016"
  },
  {
    "url": "/mitu/",
    "notableText": "2016"
  },
  {
    "url": "/metro-charter-elementary-school/",
    "notableText": "2016"
  },
  {
    "url": "/melrose-elementary-pto/",
    "notableText": "2016"
  },
  {
    "url": "/make-music-los-angeles/",
    "notableText": "2016"
  },
  {
    "url": "/maiden-la/",
    "notableText": "2016"
  },
  {
    "url": "/lynne-cohen-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/lucie-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/los-angeles-world-airports/",
    "notableText": "2016"
  },
  {
    "url": "/los-angeles-neighborhood-initiative-lani/",
    "notableText": "2016"
  },
  {
    "url": "/los-angeles-magazine/",
    "notableText": "2016"
  },
  {
    "url": "/los-angeles-lisc/",
    "notableText": "2016"
  },
  {
    "url": "/los-angeles-cleantech-incubator/",
    "notableText": "2016"
  },
  {
    "url": "/living-spring-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/light-sprout/",
    "notableText": "2016"
  },
  {
    "url": "/light-and-life-christian-fellowship-community-center/",
    "notableText": "2016"
  },
  {
    "url": "/library/",
    "notableText": "2016"
  },
  {
    "url": "/launchcode/",
    "notableText": "2016"
  },
  {
    "url": "/las-fotos-project/",
    "notableText": "2016"
  },
  {
    "url": "/landscape-integrity-films-and-education-life/",
    "notableText": "2016"
  },
  {
    "url": "/la-promise-fund/",
    "notableText": "2016"
  },
  {
    "url": "/la-metro/",
    "notableText": "2016"
  },
  {
    "url": "/la-derby-dolls/",
    "notableText": "2016"
  },
  {
    "url": "/l-a-theatre-works/",
    "notableText": "2016"
  },
  {
    "url": "/knit-marketing/",
    "notableText": "2016"
  },
  {
    "url": "/just-as-you-are-legacy/",
    "notableText": "2016"
  },
  {
    "url": "/jobs-to-move-america/",
    "notableText": "2016"
  },
  {
    "url": "/international-trade-education-programs-itep/",
    "notableText": "2016"
  },
  {
    "url": "/institute-of-contemporary-art-los-angeles-ica-la/",
    "notableText": "2016"
  },
  {
    "url": "/inner-city-arts/",
    "notableText": "2016"
  },
  {
    "url": "/im-a-movement-not-a-monument/",
    "notableText": "2016"
  },
  {
    "url": "/i3-arts-fest/",
    "notableText": "2016"
  },
  {
    "url": "/i-have-a-dream-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/hyphenus-inc/",
    "notableText": "2016"
  },
  {
    "url": "/homeless-health-care-los-angeles/",
    "notableText": "2016"
  },
  {
    "url": "/hollywood-arts-council/",
    "notableText": "2016"
  },
  {
    "url": "/historic-core-bid/",
    "notableText": "2016"
  },
  {
    "url": "/here-to-serve-inc/",
    "notableText": "2016"
  },
  {
    "url": "/helpline-youth-counseling-hyc/",
    "notableText": "2016"
  },
  {
    "url": "/healthy-living-productions/",
    "notableText": "2016"
  },
  {
    "url": "/habidatum/",
    "notableText": "2016"
  },
  {
    "url": "/grown-in-la/",
    "notableText": "2016"
  },
  {
    "url": "/grassroots-training-for-health/",
    "notableText": "2016"
  },
  {
    "url": "/give-today-la/",
    "notableText": "2016"
  },
  {
    "url": "/girls-in-tech/",
    "notableText": "2016"
  },
  {
    "url": "/future-fields/",
    "notableText": "2016"
  },
  {
    "url": "/friends-of-king/",
    "notableText": "2016"
  },
  {
    "url": "/friends-of-glenfeliz/",
    "notableText": "2016"
  },
  {
    "url": "/four-rings/",
    "notableText": "2016"
  },
  {
    "url": "/food-water-watch/",
    "notableText": "2016"
  },
  {
    "url": "/food-oasis-los-angeles/",
    "notableText": "2016"
  },
  {
    "url": "/first-place-for-youth/",
    "notableText": "2016"
  },
  {
    "url": "/filmlit-mission/",
    "notableText": "2016"
  },
  {
    "url": "/evolve-la-project-of-la-m%C3%A1s/",
    "notableText": "2016"
  },
  {
    "url": "/equallet/",
    "notableText": "2016"
  },
  {
    "url": "/epage/",
    "notableText": "2016"
  },
  {
    "url": "/emx-los-angeles/",
    "notableText": "2016"
  },
  {
    "url": "/drizzle-connect/",
    "notableText": "2016"
  },
  {
    "url": "/doctors-for-america/",
    "notableText": "2016"
  },
  {
    "url": "/dear-mama/",
    "notableText": "2016"
  },
  {
    "url": "/d-a-d-project/",
    "notableText": "2016"
  },
  {
    "url": "/county-of-los-angeles-public-library/",
    "notableText": "2016"
  },
  {
    "url": "/cornerstone-theater-company/",
    "notableText": "2016"
  },
  {
    "url": "/core-innovate-inc-century-academy-for-excellence/",
    "notableText": "2016"
  },
  {
    "url": "/continuous-good/",
    "notableText": "2016"
  },
  {
    "url": "/connected/",
    "notableText": "2016"
  },
  {
    "url": "/compassionate-santa-monica/",
    "notableText": "2016"
  },
  {
    "url": "/community-healing-gardens/",
    "notableText": "2016"
  },
  {
    "url": "/community-corporation-of-santa-monica/",
    "notableText": "2016"
  },
  {
    "url": "/come-alive-long-beach/",
    "notableText": "2016"
  },
  {
    "url": "/coligo-inc/",
    "notableText": "2016"
  },
  {
    "url": "/coalition-for-responsible-community-development/",
    "notableText": "2016"
  },
  {
    "url": "/co-led-by-industrial-district-green-and-cal-poly-pomona-department-of-landscape-architecture/",
    "notableText": "2016"
  },
  {
    "url": "/clockshop-california-state-parks/",
    "notableText": "2016"
  },
  {
    "url": "/civic-nation/",
    "notableText": "2016"
  },
  {
    "url": "/city-of-west-hollywood/",
    "notableText": "2016"
  },
  {
    "url": "/chrysalis/",
    "notableText": "2016"
  },
  {
    "url": "/center-for-the-study-of-los-angeles/",
    "notableText": "2016"
  },
  {
    "url": "/capital-main/",
    "notableText": "2016"
  },
  {
    "url": "/camino-nuevo-charter-academy/",
    "notableText": "2016"
  },
  {
    "url": "/calo-youthbuild/",
    "notableText": "2016"
  },
  {
    "url": "/california-state-university-northridge-csun/",
    "notableText": "2016"
  },
  {
    "url": "/california-aquatic-therapy-wellness-center-dba-pools-of-hope/",
    "notableText": "2016"
  },
  {
    "url": "/building-healthy-communities-long-beach/",
    "notableText": "2016"
  },
  {
    "url": "/build/",
    "notableText": "2016"
  },
  {
    "url": "/breastfeedla/",
    "notableText": "2016"
  },
  {
    "url": "/break-the-cycle/",
    "notableText": "2016"
  },
  {
    "url": "/braille-institute-of-america/",
    "notableText": "2016"
  },
  {
    "url": "/braid-theory-inc/",
    "notableText": "2016"
  },
  {
    "url": "/boxcar-muse/",
    "notableText": "2016"
  },
  {
    "url": "/avas-heart/",
    "notableText": "2016"
  },
  {
    "url": "/avalon-carver-community-center/",
    "notableText": "2016"
  },
  {
    "url": "/arts-bridging-the-gap/",
    "notableText": "2016"
  },
  {
    "url": "/arts-and-living-charitable-foundation/",
    "notableText": "2016"
  },
  {
    "url": "/argo-labs/",
    "notableText": "2016"
  },
  {
    "url": "/annenberg-innovation-lab/",
    "notableText": "2016"
  },
  {
    "url": "/anna-bing-arnold-childrens-center/",
    "notableText": "2016"
  },
  {
    "url": "/andesign-lab/",
    "notableText": "2016"
  },
  {
    "url": "/america-scores-la/",
    "notableText": "2016"
  },
  {
    "url": "/alliance-building-construction-services/",
    "notableText": "2016"
  },
  {
    "url": "/able-arts-work/",
    "notableText": "2016"
  },
  {
    "url": "/a-sense-of-home/",
    "notableText": "2016"
  },
  {
    "url": "/50-50-leadership/",
    "notableText": "2016"
  },
  {
    "url": "/urban-environmental-institute-occidental-college-and-east-yards-communities-for-environmental-justice/",
    "notableText": "2015"
  },
  {
    "url": "/mountains-recreation-and-conservation-authority/",
    "notableText": "2015"
  },
  {
    "url": "/iridescent/",
    "notableText": "2015"
  },
  {
    "url": "/los-angeles-trade-technical-college/",
    "notableText": "2015"
  },
  {
    "url": "/prototypes/",
    "notableText": "2015"
  },
  {
    "url": "/netiya/",
    "notableText": "2015"
  },
  {
    "url": "/los-angeles-neighborhood-land-trust-lanlt-leadership-for-urban-renewal-lurn-trust-south-la-konkuey-design-initiative-kdi-esperanza-community-housing-corporation-community-health-councils-chc/",
    "notableText": "2015"
  },
  {
    "url": "/hollywood-heart/",
    "notableText": "2015"
  },
  {
    "url": "/from-lot-to-spot/",
    "notableText": "2015"
  },
  {
    "url": "/american-red-cross-los-angeles-region/",
    "notableText": "2015"
  },
  {
    "url": "/usac-office-of-the-president-and-usac-student-wellness-commission-at-ucla/",
    "notableText": "2015"
  },
  {
    "url": "/ucla/",
    "notableText": "2015"
  },
  {
    "url": "/thinking-about-tomorrow/",
    "notableText": "2015"
  },
  {
    "url": "/the-dinner-party-the-kitchen-widow-hope-after-project-first-seating/",
    "notableText": "2015"
  },
  {
    "url": "/the-center-of-medical-multimedia-education-and-technology-commet/",
    "notableText": "2015"
  },
  {
    "url": "/the-alternative-travel-project/",
    "notableText": "2015"
  },
  {
    "url": "/spcala/",
    "notableText": "2015"
  },
  {
    "url": "/southeast-asian-community-alliance-seaca-and-public-counsel/",
    "notableText": "2015"
  },
  {
    "url": "/social-action-partners-soact/",
    "notableText": "2015"
  },
  {
    "url": "/shanes-inspiration/",
    "notableText": "2015"
  },
  {
    "url": "/seepolitical/",
    "notableText": "2015"
  },
  {
    "url": "/santa-monica-cradle-to-career-led-by-city-of-santa-monica-in-partnership-with-smmusd/",
    "notableText": "2015"
  },
  {
    "url": "/porttech-los-angeles-international-trade-education-programs-itep-port-of-los-angeles-high-school-polahs/",
    "notableText": "2015"
  },
  {
    "url": "/maps-4-college/",
    "notableText": "2015"
  },
  {
    "url": "/los-angeles-worlds-fair-fpc/",
    "notableText": "2015"
  },
  {
    "url": "/lab-launch/",
    "notableText": "2015"
  },
  {
    "url": "/fly-yoga-arts/",
    "notableText": "2015"
  },
  {
    "url": "/fallen-fruit-from-rising-women-crossroads-inc-scripps-college/",
    "notableText": "2015"
  },
  {
    "url": "/facing-history-and-ourselves-inc/",
    "notableText": "2015"
  },
  {
    "url": "/clothes-the-deal/",
    "notableText": "2015"
  },
  {
    "url": "/climate-cents/",
    "notableText": "2015"
  },
  {
    "url": "/c5-youth-foundation-of-southern-california-c5la/",
    "notableText": "2015"
  },
  {
    "url": "/ambulante/",
    "notableText": "2015"
  },
  {
    "url": "/tia-chuchas-centro-cultural/",
    "notableText": "2015"
  },
  {
    "url": "/the-institute-for-nonviolence-in-los-angeles/",
    "notableText": "2015"
  },
  {
    "url": "/south-bay-contemporary-crafted/",
    "notableText": "2015"
  },
  {
    "url": "/p-f-bresee-foundation/",
    "notableText": "2015"
  },
  {
    "url": "/network-for-teaching-entrepreneurship-nfte-greater-los-angeles/",
    "notableText": "2015"
  },
  {
    "url": "/levitt-pavilion-greater-los-angeles-pasadena/",
    "notableText": "2015"
  },
  {
    "url": "/las-promise/",
    "notableText": "2015"
  },
  {
    "url": "/jumpstart-for-young-children-inc/",
    "notableText": "2015"
  },
  {
    "url": "/imagination-foundation/",
    "notableText": "2015"
  },
  {
    "url": "/i-have-a-dream-foundation-los-angeles-ihadla/",
    "notableText": "2015"
  },
  {
    "url": "/dublab/",
    "notableText": "2015"
  },
  {
    "url": "/council-for-watershed-health/",
    "notableText": "2015"
  },
  {
    "url": "/communities-in-schools-of-los-angeles/",
    "notableText": "2015"
  },
  {
    "url": "/communities-for-a-better-environment/",
    "notableText": "2015"
  },
  {
    "url": "/climate-resolve/",
    "notableText": "2015"
  },
  {
    "url": "/childrens-bureau-of-southern-california/",
    "notableText": "2015"
  },
  {
    "url": "/youth-justice-coalition/",
    "notableText": "2015"
  },
  {
    "url": "/yes4arts/",
    "notableText": "2015"
  },
  {
    "url": "/wise-guys-events/",
    "notableText": "2015"
  },
  {
    "url": "/wheels-of-hope-la-fred-jordan-mission/",
    "notableText": "2015"
  },
  {
    "url": "/westcal-academy/",
    "notableText": "2015"
  },
  {
    "url": "/voter-llc/",
    "notableText": "2015"
  },
  {
    "url": "/urban-word-los-angeles/",
    "notableText": "2015"
  },
  {
    "url": "/ucla-luskin-school-of-public-affairs/",
    "notableText": "2015"
  },
  {
    "url": "/trojan-swim-club/",
    "notableText": "2015"
  },
  {
    "url": "/tiny-rebellion/",
    "notableText": "2015"
  },
  {
    "url": "/thelab-inc/",
    "notableText": "2015"
  },
  {
    "url": "/the-venice-place-project-tedxvenicebeach-72andsunny/",
    "notableText": "2015"
  },
  {
    "url": "/the-university-corporation/",
    "notableText": "2015"
  },
  {
    "url": "/the-story-project/",
    "notableText": "2015"
  },
  {
    "url": "/the-sound-body-sound-mind-foundation/",
    "notableText": "2015"
  },
  {
    "url": "/the-ripple-effect/",
    "notableText": "2015"
  },
  {
    "url": "/the-moving-museum/",
    "notableText": "2015"
  },
  {
    "url": "/the-council-of-mexican-federations-cofem/",
    "notableText": "2015"
  },
  {
    "url": "/tempest-action-parks/",
    "notableText": "2015"
  },
  {
    "url": "/tagliaferri-howard-architecture/",
    "notableText": "2015"
  },
  {
    "url": "/sustaynabl/",
    "notableText": "2015"
  },
  {
    "url": "/sustainablesurf-org/",
    "notableText": "2015"
  },
  {
    "url": "/strategic-concepts-in-organizing-and-policy-education-scope-us-green-building-council-los-angeles-chapter-usgbc-la/",
    "notableText": "2015"
  },
  {
    "url": "/southern-california-water-committee/",
    "notableText": "2015"
  },
  {
    "url": "/southern-california-college-access-network-a-project-of-community-partners/",
    "notableText": "2015"
  },
  {
    "url": "/social-environmental-entrepreneurs/",
    "notableText": "2015"
  },
  {
    "url": "/smart-gals-productions/",
    "notableText": "2015"
  },
  {
    "url": "/siqueiros-foundation-of-the-arts/",
    "notableText": "2015"
  },
  {
    "url": "/silverlake-independent-jewish-community-center/",
    "notableText": "2015"
  },
  {
    "url": "/sequoyah-school/",
    "notableText": "2015"
  },
  {
    "url": "/san-fernando-valley-arts-cultural-center-and-the-valley-economic-alliance/",
    "notableText": "2015"
  },
  {
    "url": "/ruckus-projects/",
    "notableText": "2015"
  },
  {
    "url": "/rrm-design-group-and-los-angeles-neighborhood-initiative/",
    "notableText": "2015"
  },
  {
    "url": "/robey-theatre-company/",
    "notableText": "2015"
  },
  {
    "url": "/river-wild-llc/",
    "notableText": "2015"
  },
  {
    "url": "/reframe-labs/",
    "notableText": "2015"
  },
  {
    "url": "/redeemer-baptist-elementary-school/",
    "notableText": "2015"
  },
  {
    "url": "/reading-partners/",
    "notableText": "2015"
  },
  {
    "url": "/re-ciclos-and-bicycle-kitchen/",
    "notableText": "2015"
  },
  {
    "url": "/project-muszed/",
    "notableText": "2015"
  },
  {
    "url": "/project-backboard/",
    "notableText": "2015"
  },
  {
    "url": "/polar-tech-ed-and-consulting-llc-patrick-leon/",
    "notableText": "2015"
  },
  {
    "url": "/plug-in-south-la/",
    "notableText": "2015"
  },
  {
    "url": "/play-with-music-the-new-history-parent-organization-of-play-with-music-current-transition-filing-501c3-status-for-play-with-music/",
    "notableText": "2015"
  },
  {
    "url": "/pass-tha-ball/",
    "notableText": "2015"
  },
  {
    "url": "/para-los-ni%C3%B1os/",
    "notableText": "2015"
  },
  {
    "url": "/pando-populus-inc-world-studio-foundation-inc/",
    "notableText": "2015"
  },
  {
    "url": "/palisades-charter-high-school-pchs/",
    "notableText": "2015"
  },
  {
    "url": "/operations-south-bureau-community-stakeholder-collaboration/",
    "notableText": "2015"
  },
  {
    "url": "/off-the-saw/",
    "notableText": "2015"
  },
  {
    "url": "/neighborhood-council-sustainability-alliance/",
    "notableText": "2015"
  },
  {
    "url": "/national-park-foundation/",
    "notableText": "2015"
  },
  {
    "url": "/motor-avenue-improvement-association/",
    "notableText": "2015"
  },
  {
    "url": "/microenterprise-org/",
    "notableText": "2015"
  },
  {
    "url": "/mentormint/",
    "notableText": "2015"
  },
  {
    "url": "/melrose-world-cinema-centers/",
    "notableText": "2015"
  },
  {
    "url": "/media-done-responsibly-c-o-pasadena-arts-council/",
    "notableText": "2015"
  },
  {
    "url": "/maternal-mental-health-now/",
    "notableText": "2015"
  },
  {
    "url": "/los-angeles-underwater-explorers-ghost-fishing/",
    "notableText": "2015"
  },
  {
    "url": "/los-angeles-southwest-college-foundation-innovate-globally-and-los-angeles-southwest-college-career-technical-education/",
    "notableText": "2015"
  },
  {
    "url": "/los-angeles-mayor-eric-garcetti-great-streets-initiative/",
    "notableText": "2015"
  },
  {
    "url": "/los-angeles-maritime-institute/",
    "notableText": "2015"
  },
  {
    "url": "/los-angeles-flag/",
    "notableText": "2015"
  },
  {
    "url": "/los-angeles-fire-department-foundation/",
    "notableText": "2015"
  },
  {
    "url": "/los-angeles-county-economic-development-corporation/",
    "notableText": "2015"
  },
  {
    "url": "/los-angeles-community-action-network/",
    "notableText": "2015"
  },
  {
    "url": "/los-angeles-center-of-photography/",
    "notableText": "2015"
  },
  {
    "url": "/localism-inc/",
    "notableText": "2015"
  },
  {
    "url": "/local-roots/",
    "notableText": "2015"
  },
  {
    "url": "/local-initiatives-support-corporation-lisc-los-angeles/",
    "notableText": "2015"
  },
  {
    "url": "/living-advantage-inc/",
    "notableText": "2015"
  },
  {
    "url": "/life-change-up/",
    "notableText": "2015"
  },
  {
    "url": "/lapd-southwest-business-booster-association-inc/",
    "notableText": "2015"
  },
  {
    "url": "/lact-los-angeles-community-theatre/",
    "notableText": "2015"
  },
  {
    "url": "/la-makerspace/",
    "notableText": "2015"
  },
  {
    "url": "/koreatown-immigrant-worker-alliance/",
    "notableText": "2015"
  },
  {
    "url": "/knucklebones/",
    "notableText": "2015"
  },
  {
    "url": "/kensington-presents/",
    "notableText": "2015"
  },
  {
    "url": "/keith-a-somers-international-foundation/",
    "notableText": "2015"
  },
  {
    "url": "/jvs-los-angeles/",
    "notableText": "2015"
  },
  {
    "url": "/justice-lab/",
    "notableText": "2015"
  },
  {
    "url": "/junior-statesmen-foundation-alliance-college-ready-public-schools/",
    "notableText": "2015"
  },
  {
    "url": "/julie-rico-dba-as-o-fine-art/",
    "notableText": "2015"
  },
  {
    "url": "/jobcouch/",
    "notableText": "2015"
  },
  {
    "url": "/ironbox-education-inc/",
    "notableText": "2015"
  },
  {
    "url": "/instituto-de-educacion-popular-del-sur-de-california-idepsca/",
    "notableText": "2015"
  },
  {
    "url": "/individual-submitter/",
    "notableText": "2015"
  },
  {
    "url": "/independent-team-of-la-residents/",
    "notableText": "2015"
  },
  {
    "url": "/holy-family-school/",
    "notableText": "2015"
  },
  {
    "url": "/hollywood-curling/",
    "notableText": "2015"
  },
  {
    "url": "/heart-of-art-gallery/",
    "notableText": "2015"
  },
  {
    "url": "/heart-and-soul-design-communications-center/",
    "notableText": "2015"
  },
  {
    "url": "/hdomes-com-shacklebrand-designs/",
    "notableText": "2015"
  },
  {
    "url": "/haunted-play-llc/",
    "notableText": "2015"
  },
  {
    "url": "/happycity-los-angeles/",
    "notableText": "2015"
  },
  {
    "url": "/growgood-inc/",
    "notableText": "2015"
  },
  {
    "url": "/greenboxfarms/",
    "notableText": "2015"
  },
  {
    "url": "/green-institute-for-village-empowerment-give-program-at-tom-bradley-legacy-foundation-at-ucla-l-a-urban-farms-union-rescue-mission-union-church-l-a/",
    "notableText": "2015"
  },
  {
    "url": "/green-commuter/",
    "notableText": "2015"
  },
  {
    "url": "/great-minds-stem-society/",
    "notableText": "2015"
  },
  {
    "url": "/grand-performances/",
    "notableText": "2015"
  },
  {
    "url": "/golden-heart-ranch/",
    "notableText": "2015"
  },
  {
    "url": "/get-on-the-bus-a-program-of-the-center-for-restorative-justice-works/",
    "notableText": "2015"
  },
  {
    "url": "/fruit-change/",
    "notableText": "2015"
  },
  {
    "url": "/friends-of-the-hollywood-central-park-fhcp/",
    "notableText": "2015"
  },
  {
    "url": "/freeway-farm/",
    "notableText": "2015"
  },
  {
    "url": "/foundation-for-second-chances/",
    "notableText": "2015"
  },
  {
    "url": "/feal-la/",
    "notableText": "2015"
  },
  {
    "url": "/farm-la/",
    "notableText": "2015"
  },
  {
    "url": "/exchangeworks/",
    "notableText": "2015"
  },
  {
    "url": "/environmental-charter-schools/",
    "notableText": "2015"
  },
  {
    "url": "/entertainment-industries-council-inc/",
    "notableText": "2015"
  },
  {
    "url": "/el-basurero/",
    "notableText": "2015"
  },
  {
    "url": "/eezitec/",
    "notableText": "2015"
  },
  {
    "url": "/eastside-rehearsal/",
    "notableText": "2015"
  },
  {
    "url": "/earn/",
    "notableText": "2015"
  },
  {
    "url": "/dreamhaus-inc/",
    "notableText": "2015"
  },
  {
    "url": "/downtown-los-angeles-art-walk/",
    "notableText": "2015"
  },
  {
    "url": "/diy-girls/",
    "notableText": "2015"
  },
  {
    "url": "/dharma-health-institute/",
    "notableText": "2015"
  },
  {
    "url": "/culture-shock-los-angeles/",
    "notableText": "2015"
  },
  {
    "url": "/connect-the-dots-la/",
    "notableText": "2015"
  },
  {
    "url": "/compiler-la-utopiad-org/",
    "notableText": "2015"
  },
  {
    "url": "/colossi/",
    "notableText": "2015"
  },
  {
    "url": "/clinica-msr-oscar-a-romero/",
    "notableText": "2015"
  },
  {
    "url": "/classnube-nube-means-cloud-in-spanish/",
    "notableText": "2015"
  },
  {
    "url": "/civic-tech-usc/",
    "notableText": "2015"
  },
  {
    "url": "/city-of-glendora/",
    "notableText": "2015"
  },
  {
    "url": "/childrens-institute-inc-cii/",
    "notableText": "2015"
  },
  {
    "url": "/change-better/",
    "notableText": "2015"
  },
  {
    "url": "/challengemaker/",
    "notableText": "2015"
  },
  {
    "url": "/center-for-innovation-at-the-laedc/",
    "notableText": "2015"
  },
  {
    "url": "/cell-ed/",
    "notableText": "2015"
  },
  {
    "url": "/casa-libre/",
    "notableText": "2015"
  },
  {
    "url": "/career-college-clubs/",
    "notableText": "2015"
  },
  {
    "url": "/bunch-magazine-dba-bunch-media/",
    "notableText": "2015"
  },
  {
    "url": "/bruce-lee-foundation/",
    "notableText": "2015"
  },
  {
    "url": "/breaking-into-hollywood/",
    "notableText": "2015"
  },
  {
    "url": "/bookartsla/",
    "notableText": "2015"
  },
  {
    "url": "/blueprint-earth/",
    "notableText": "2015"
  },
  {
    "url": "/blind-childrens-center/",
    "notableText": "2015"
  },
  {
    "url": "/bill-weber-studios/",
    "notableText": "2015"
  },
  {
    "url": "/artists-for-literacy-litremix/",
    "notableText": "2015"
  },
  {
    "url": "/art-of-acting-studio/",
    "notableText": "2015"
  },
  {
    "url": "/arroyo-seco-foundation/",
    "notableText": "2015"
  },
  {
    "url": "/architecture-and-design-museum-a-d/",
    "notableText": "2015"
  },
  {
    "url": "/applicantlab/",
    "notableText": "2015"
  },
  {
    "url": "/anti-recidivism-coalition/",
    "notableText": "2015"
  },
  {
    "url": "/angel-city-lumber/",
    "notableText": "2015"
  },
  {
    "url": "/alliance-for-childrens-rights/",
    "notableText": "2015"
  },
  {
    "url": "/adventure-playhouse-indoor-activity-center/",
    "notableText": "2015"
  },
  {
    "url": "/academy-of-music-for-the-blind/",
    "notableText": "2015"
  },
  {
    "url": "/a-place-called-home/",
    "notableText": "2015"
  },
  {
    "url": "/the-exploratory-maker-guilds/",
    "notableText": "2014"
  },
  {
    "url": "/home-community-inc/",
    "notableText": "2014"
  },
  {
    "url": "/youth-speak-collective/",
    "notableText": "2014"
  },
  {
    "url": "/young-invincibles/",
    "notableText": "2014"
  },
  {
    "url": "/writegirl-a-project-of-community-partners/",
    "notableText": "2014"
  },
  {
    "url": "/women-against-gun-violence/",
    "notableText": "2014"
  },
  {
    "url": "/urban-teens-exploring-technology-txt/",
    "notableText": "2014"
  },
  {
    "url": "/urban-air/",
    "notableText": "2014"
  },
  {
    "url": "/the-los-angeles-forum-for-architecture-and-urban-design/",
    "notableText": "2014"
  },
  {
    "url": "/the-gabriella-foundation/",
    "notableText": "2014"
  },
  {
    "url": "/strivers-la-via-new-economy-campaigns/",
    "notableText": "2014"
  },
  {
    "url": "/skid-row-housing-trust/",
    "notableText": "2014"
  },
  {
    "url": "/sabio-enterprises-inc/",
    "notableText": "2014"
  },
  {
    "url": "/peace-over-violence/",
    "notableText": "2014"
  },
  {
    "url": "/muir-ranch/",
    "notableText": "2014"
  },
  {
    "url": "/mia-lehrer-associates-la-mas-arid-lands-institute/",
    "notableText": "2014"
  },
  {
    "url": "/la-stage-alliance/",
    "notableText": "2014"
  },
  {
    "url": "/l-a-freewaves/",
    "notableText": "2014"
  },
  {
    "url": "/jovenes-inc/",
    "notableText": "2014"
  },
  {
    "url": "/i-am-angel-foundation/",
    "notableText": "2014"
  },
  {
    "url": "/eagle-rock-yacht-club/",
    "notableText": "2014"
  },
  {
    "url": "/droplabs/",
    "notableText": "2014"
  },
  {
    "url": "/do-good-bus/",
    "notableText": "2014"
  },
  {
    "url": "/alliance-for-community-transit-los-angeles-fiscal-sponsor-ltsc-community-development-corporation/",
    "notableText": "2014"
  },
  {
    "url": "/alliance-college-ready-public-schools/",
    "notableText": "2014"
  },
  {
    "url": "/zanja-madre-the-shed-pasadena-la-loma-development/",
    "notableText": "2014"
  },
  {
    "url": "/would-works/",
    "notableText": "2014"
  },
  {
    "url": "/world-peace-one/",
    "notableText": "2014"
  },
  {
    "url": "/woodbury-university/",
    "notableText": "2014"
  },
  {
    "url": "/womenshelter-of-long-beach/",
    "notableText": "2014"
  },
  {
    "url": "/with-love-market-and-cafe-with-love-community-market-and-cafe/",
    "notableText": "2014"
  },
  {
    "url": "/will-company/",
    "notableText": "2014"
  },
  {
    "url": "/westside-infant-family-network-win/",
    "notableText": "2014"
  },
  {
    "url": "/western-justice-center-wjc/",
    "notableText": "2014"
  },
  {
    "url": "/western-center-on-law-poverty-wclp/",
    "notableText": "2014"
  },
  {
    "url": "/violence-prevention-coalition/",
    "notableText": "2014"
  },
  {
    "url": "/usc-game-innovation-lab/",
    "notableText": "2014"
  },
  {
    "url": "/urban-collaborations-group-partnering-with-fast-org/",
    "notableText": "2014"
  },
  {
    "url": "/ucla-extension-landscape-architecture-program/",
    "notableText": "2014"
  },
  {
    "url": "/ucla-advance-heart-failure-heal-my-heart-ucla-department-of-medicine/",
    "notableText": "2014"
  },
  {
    "url": "/toberman-neighborhood-center/",
    "notableText": "2014"
  },
  {
    "url": "/theatrum-elysium-san-pedro-rep/",
    "notableText": "2014"
  },
  {
    "url": "/the-transit-coalition/",
    "notableText": "2014"
  },
  {
    "url": "/the-project-for-the-imagined-futures/",
    "notableText": "2014"
  },
  {
    "url": "/the-prep-source/",
    "notableText": "2014"
  },
  {
    "url": "/the-new-history/",
    "notableText": "2014"
  },
  {
    "url": "/the-mirror-mirror-project/",
    "notableText": "2014"
  },
  {
    "url": "/the-los-angeles-fund-for-public-education-the-la-fund/",
    "notableText": "2014"
  },
  {
    "url": "/the-laurel-foundation/",
    "notableText": "2014"
  },
  {
    "url": "/the-la-brea-tar-pits-museum/",
    "notableText": "2014"
  },
  {
    "url": "/the-l-a-fort/",
    "notableText": "2014"
  },
  {
    "url": "/the-kitchen-community/",
    "notableText": "2014"
  },
  {
    "url": "/the-industry/",
    "notableText": "2014"
  },
  {
    "url": "/the-human-element-project/",
    "notableText": "2014"
  },
  {
    "url": "/the-gabba-gallery-and-andrea-lahue-aka-random-act-aka-random-act-projects/",
    "notableText": "2014"
  },
  {
    "url": "/the-bitch-pack/",
    "notableText": "2014"
  },
  {
    "url": "/the-achievable-foundation/",
    "notableText": "2014"
  },
  {
    "url": "/streetsblog-los-angeles-los-angeles-walks-place-it-longbeachize-santa-monica-next/",
    "notableText": "2014"
  },
  {
    "url": "/st-francis-center/",
    "notableText": "2014"
  },
  {
    "url": "/st-barnabas-senior-services-aka-st-barnabas-senior-center/",
    "notableText": "2014"
  },
  {
    "url": "/southern-california-institute-of-architecture-sci-arc/",
    "notableText": "2014"
  },
  {
    "url": "/south-east-european-film-festival/",
    "notableText": "2014"
  },
  {
    "url": "/senior-star-power-productions/",
    "notableText": "2014"
  },
  {
    "url": "/schkapf/",
    "notableText": "2014"
  },
  {
    "url": "/saban-community-clinic/",
    "notableText": "2014"
  },
  {
    "url": "/row-gallery-foundation/",
    "notableText": "2014"
  },
  {
    "url": "/rangoli-foundation-for-art-culture/",
    "notableText": "2014"
  },
  {
    "url": "/queerfest/",
    "notableText": "2014"
  },
  {
    "url": "/pwrdby/",
    "notableText": "2014"
  },
  {
    "url": "/psychic-bunny/",
    "notableText": "2014"
  },
  {
    "url": "/providence-little-company-of-mary-medical-centers-torrance-san-pedro-providence-health-services-southern-california/",
    "notableText": "2014"
  },
  {
    "url": "/proktr/",
    "notableText": "2014"
  },
  {
    "url": "/positive-minded-people/",
    "notableText": "2014"
  },
  {
    "url": "/play-the-la-river/",
    "notableText": "2014"
  },
  {
    "url": "/piece-by-piece/",
    "notableText": "2014"
  },
  {
    "url": "/peace-allies/",
    "notableText": "2014"
  },
  {
    "url": "/optimizing-national-education/",
    "notableText": "2014"
  },
  {
    "url": "/nomadlosangeles/",
    "notableText": "2014"
  },
  {
    "url": "/nextstage-agency/",
    "notableText": "2014"
  },
  {
    "url": "/nationbuilder/",
    "notableText": "2014"
  },
  {
    "url": "/my-name-my-story/",
    "notableText": "2014"
  },
  {
    "url": "/mushroom-learning/",
    "notableText": "2014"
  },
  {
    "url": "/mobile-film-classroom/",
    "notableText": "2014"
  },
  {
    "url": "/millennial-magazine-apps4la/",
    "notableText": "2014"
  },
  {
    "url": "/metrohealth-station-jefferson-park/",
    "notableText": "2014"
  },
  {
    "url": "/metabolic-studio/",
    "notableText": "2014"
  },
  {
    "url": "/meet-each-need-with-dignity/",
    "notableText": "2014"
  },
  {
    "url": "/massknowtify/",
    "notableText": "2014"
  },
  {
    "url": "/los-angeles-sustainability-collaborative-lasc/",
    "notableText": "2014"
  },
  {
    "url": "/los-angeles-performance-practice/",
    "notableText": "2014"
  },
  {
    "url": "/los-angeles-drama-club/",
    "notableText": "2014"
  },
  {
    "url": "/los-angeles-downtown-arts-district-space-ladadspace/",
    "notableText": "2014"
  },
  {
    "url": "/los-angeles-county-community-development-foundation/",
    "notableText": "2014"
  },
  {
    "url": "/los-angeles-county-alliance-for-boys-and-girls-clubs-lacabgc-and-the-west-san-gabriel-valley-boys-and-girls-club/",
    "notableText": "2014"
  },
  {
    "url": "/los-angeles-county-active-transportation-collaborative-safe-routes-to-school-national-partnership-and-lacbc-work-to-support-improved-policies-and-increased-levels-of-funding-for-active-transportation-and-complete-streets-in-los-angeles-county/",
    "notableText": "2014"
  },
  {
    "url": "/los-angeles-community-garden-council/",
    "notableText": "2014"
  },
  {
    "url": "/los-angeles-biohackers-inc/",
    "notableText": "2014"
  },
  {
    "url": "/little-tokyo-community-council/",
    "notableText": "2014"
  },
  {
    "url": "/lincoln-heights-health-initiative/",
    "notableText": "2014"
  },
  {
    "url": "/light-bringer-project/",
    "notableText": "2014"
  },
  {
    "url": "/libros-schmibros/",
    "notableText": "2014"
  },
  {
    "url": "/levantine-cultural-center/",
    "notableText": "2014"
  },
  {
    "url": "/learning-equipment-supply-service/",
    "notableText": "2014"
  },
  {
    "url": "/leadership-through-empowerment-actin-and-dialogue-inc-lead/",
    "notableText": "2014"
  },
  {
    "url": "/law-soup-inc/",
    "notableText": "2014"
  },
  {
    "url": "/lace-center/",
    "notableText": "2014"
  },
  {
    "url": "/l-a-bike-trains-bicycle-culture-institute/",
    "notableText": "2014"
  },
  {
    "url": "/koreatown-youth-and-community-center-kycc/",
    "notableText": "2014"
  },
  {
    "url": "/interpretive-media-laboratory-imlab/",
    "notableText": "2014"
  },
  {
    "url": "/interfaith-food-center/",
    "notableText": "2014"
  },
  {
    "url": "/in-the-city-inc/",
    "notableText": "2014"
  },
  {
    "url": "/imagination-workshop/",
    "notableText": "2014"
  },
  {
    "url": "/ill-be-the-one-organization/",
    "notableText": "2014"
  },
  {
    "url": "/ignite-teaching/",
    "notableText": "2014"
  },
  {
    "url": "/hunger-action-los-angeles/",
    "notableText": "2014"
  },
  {
    "url": "/holy-ghost-global/",
    "notableText": "2014"
  },
  {
    "url": "/grow-games-interactive-growcology/",
    "notableText": "2014"
  },
  {
    "url": "/green-education-inc/",
    "notableText": "2014"
  },
  {
    "url": "/global-education-network-exchange-gene/",
    "notableText": "2014"
  },
  {
    "url": "/ghetto-film-school/",
    "notableText": "2014"
  },
  {
    "url": "/getting-your-sh*t-together-gyst-ink/",
    "notableText": "2014"
  },
  {
    "url": "/general-assembly-opportunity-fund/",
    "notableText": "2014"
  },
  {
    "url": "/futurebound-inc/",
    "notableText": "2014"
  },
  {
    "url": "/friends-of-the-visiontheater/",
    "notableText": "2014"
  },
  {
    "url": "/friends-of-the-observatory-foto/",
    "notableText": "2014"
  },
  {
    "url": "/friends-of-the-los-angeles-river/",
    "notableText": "2014"
  },
  {
    "url": "/fox-hills-ladera-healthy-family-association-inc/",
    "notableText": "2014"
  },
  {
    "url": "/foundation-for-california-community-colleges-fiscal-sponsor/",
    "notableText": "2014"
  },
  {
    "url": "/fort/",
    "notableText": "2014"
  },
  {
    "url": "/families-in-schools/",
    "notableText": "2014"
  },
  {
    "url": "/experimental-half-hour/",
    "notableText": "2014"
  },
  {
    "url": "/erw-design/",
    "notableText": "2014"
  },
  {
    "url": "/elusive-minds-productions/",
    "notableText": "2014"
  },
  {
    "url": "/earth-protect-inc/",
    "notableText": "2014"
  },
  {
    "url": "/duvivier-architects-da/",
    "notableText": "2014"
  },
  {
    "url": "/dumlao-enterprises/",
    "notableText": "2014"
  },
  {
    "url": "/dream-a-world-education-inc/",
    "notableText": "2014"
  },
  {
    "url": "/deaf-west-theatre-inc/",
    "notableText": "2014"
  },
  {
    "url": "/critical-mass-dance-company-cmdc/",
    "notableText": "2014"
  },
  {
    "url": "/creative-cycle-llc-dba-l-creativo/",
    "notableText": "2014"
  },
  {
    "url": "/constitutional-rights-foundation-crf/",
    "notableText": "2014"
  },
  {
    "url": "/conant-moran-design-fabrication/",
    "notableText": "2014"
  },
  {
    "url": "/company-of-angels-coa/",
    "notableText": "2014"
  },
  {
    "url": "/community-services-unlimited-inc/",
    "notableText": "2014"
  },
  {
    "url": "/community-centered/",
    "notableText": "2014"
  },
  {
    "url": "/college-summit-southern-california/",
    "notableText": "2014"
  },
  {
    "url": "/chapcare/",
    "notableText": "2014"
  },
  {
    "url": "/central-american-resource-center-carecen-los-angeles/",
    "notableText": "2014"
  },
  {
    "url": "/brown-paper-la/",
    "notableText": "2014"
  },
  {
    "url": "/boys-girls-clubs-of-the-los-angeles-harbor/",
    "notableText": "2014"
  },
  {
    "url": "/boys-girls-club-of-hollywood/",
    "notableText": "2014"
  },
  {
    "url": "/beyond-baroque-literary-arts-center/",
    "notableText": "2014"
  },
  {
    "url": "/beauty-bus-foundation/",
    "notableText": "2014"
  },
  {
    "url": "/beautify-earth/",
    "notableText": "2014"
  },
  {
    "url": "/baby-buggy/",
    "notableText": "2014"
  },
  {
    "url": "/b-r-i-d-g-e-theatre-project-fiscal-sponsor-the-attic-theatre/",
    "notableText": "2014"
  },
  {
    "url": "/avenue-50-studio/",
    "notableText": "2014"
  },
  {
    "url": "/audubon-california/",
    "notableText": "2014"
  },
  {
    "url": "/art-in-motion-inc/",
    "notableText": "2014"
  },
  {
    "url": "/art-community-land-activism-aclas-la-tierra-de-la-culebra/",
    "notableText": "2014"
  },
  {
    "url": "/arroyo-s-e-c-o-sustainable-economies-community-organization/",
    "notableText": "2014"
  },
  {
    "url": "/arid-lands-institute/",
    "notableText": "2014"
  },
  {
    "url": "/aquarium-of-the-pacific/",
    "notableText": "2014"
  },
  {
    "url": "/app-of-life/",
    "notableText": "2014"
  },
  {
    "url": "/anti-defamation-league-pacific-southwest-region/",
    "notableText": "2014"
  },
  {
    "url": "/anonymous-good-%5Bag%5D-is-a-project-of-voices4freedom/",
    "notableText": "2014"
  },
  {
    "url": "/alma-backyard-farms/",
    "notableText": "2014"
  },
  {
    "url": "/3boulevards-and-west-adams-heritage-assocation-waha/",
    "notableText": "2014"
  },
  {
    "url": "/24connect/",
    "notableText": "2014"
  },
  {
    "url": "/los-angeles-communities-advocating-for-unity-social-justice-and-action-inc/",
    "notableText": "2013"
  },
  {
    "url": "/citysourced-inc/",
    "notableText": "2013"
  },
  {
    "url": "/young-warriors/",
    "notableText": "2013"
  },
  {
    "url": "/wayfinder-la/",
    "notableText": "2013"
  },
  {
    "url": "/walking-shield-inc/",
    "notableText": "2013"
  },
  {
    "url": "/verynice/",
    "notableText": "2013"
  },
  {
    "url": "/venice-art-crawl/",
    "notableText": "2013"
  },
  {
    "url": "/valle-artists/",
    "notableText": "2013"
  },
  {
    "url": "/valhalla/",
    "notableText": "2013"
  },
  {
    "url": "/urban-reclaim/",
    "notableText": "2013"
  },
  {
    "url": "/urban-macrosystems/",
    "notableText": "2013"
  },
  {
    "url": "/unitedlab/",
    "notableText": "2013"
  },
  {
    "url": "/unique-la/",
    "notableText": "2013"
  },
  {
    "url": "/union-de-vecinos/",
    "notableText": "2013"
  },
  {
    "url": "/ucla-william-andrews-clark-memorial-library/",
    "notableText": "2013"
  },
  {
    "url": "/ucla-labor-center/",
    "notableText": "2013"
  },
  {
    "url": "/ucla-dept-of-architecture-and-urban-design/",
    "notableText": "2013"
  },
  {
    "url": "/u-s-vets-los-angeles/",
    "notableText": "2013"
  },
  {
    "url": "/thrdplace/",
    "notableText": "2013"
  },
  {
    "url": "/the-waters-wheel-llc/",
    "notableText": "2013"
  },
  {
    "url": "/the-relational-center/",
    "notableText": "2013"
  },
  {
    "url": "/the-los-angeles-trust-for-childrens-health/",
    "notableText": "2013"
  },
  {
    "url": "/the-los-angeles-mayors-council-on-innovation-and-industry/",
    "notableText": "2013"
  },
  {
    "url": "/the-los-angeles-fund-for-public-education/",
    "notableText": "2013"
  },
  {
    "url": "/the-learning-garden/",
    "notableText": "2013"
  },
  {
    "url": "/the-last-bookstore/",
    "notableText": "2013"
  },
  {
    "url": "/the-l-a-kitchen/",
    "notableText": "2013"
  },
  {
    "url": "/the-huntington-usc-institute-on-california-and-the-west/",
    "notableText": "2013"
  },
  {
    "url": "/the-heart-project/",
    "notableText": "2013"
  },
  {
    "url": "/the-greater-west-hollywood-food-coalition/",
    "notableText": "2013"
  },
  {
    "url": "/the-city-project/",
    "notableText": "2013"
  },
  {
    "url": "/the-advot-project/",
    "notableText": "2013"
  },
  {
    "url": "/thank-you-for-coming/",
    "notableText": "2013"
  },
  {
    "url": "/team-friday/",
    "notableText": "2013"
  },
  {
    "url": "/take-back-the-grid/",
    "notableText": "2013"
  },
  {
    "url": "/swipes-for-the-homeless/",
    "notableText": "2013"
  },
  {
    "url": "/sustainable-works-a-project-of-community-partners/",
    "notableText": "2013"
  },
  {
    "url": "/string-theory-productions/",
    "notableText": "2013"
  },
  {
    "url": "/step-up-womens-network/",
    "notableText": "2013"
  },
  {
    "url": "/st-john-the-baptist-social-services/",
    "notableText": "2013"
  },
  {
    "url": "/special-service-for-groups-asian-and-pacific-islander-obesity-prevention-alliance-apiopa/",
    "notableText": "2013"
  },
  {
    "url": "/southern-california-committee-for-the-olympic-games-sccog/",
    "notableText": "2013"
  },
  {
    "url": "/smartestk12-com/",
    "notableText": "2013"
  },
  {
    "url": "/slake-los-angeles/",
    "notableText": "2013"
  },
  {
    "url": "/skoolbo-ltd/",
    "notableText": "2013"
  },
  {
    "url": "/riverlanding-collective/",
    "notableText": "2013"
  },
  {
    "url": "/rfk-la-legacy-in-action/",
    "notableText": "2013"
  },
  {
    "url": "/rediscover-center/",
    "notableText": "2013"
  },
  {
    "url": "/redcat-the-roy-and-edna-disney-calarts-theater/",
    "notableText": "2013"
  },
  {
    "url": "/reach-for-thetop-inc/",
    "notableText": "2013"
  },
  {
    "url": "/quality-of-life-center-inc/",
    "notableText": "2013"
  },
  {
    "url": "/pullias-center-for-higher-education/",
    "notableText": "2013"
  },
  {
    "url": "/public-counsel/",
    "notableText": "2013"
  },
  {
    "url": "/project-food-la/",
    "notableText": "2013"
  },
  {
    "url": "/playworks-southern-california/",
    "notableText": "2013"
  },
  {
    "url": "/pasadena-arts-council/",
    "notableText": "2013"
  },
  {
    "url": "/participlay/",
    "notableText": "2013"
  },
  {
    "url": "/parent-revolution/",
    "notableText": "2013"
  },
  {
    "url": "/pacesetter-productions/",
    "notableText": "2013"
  },
  {
    "url": "/outfest/",
    "notableText": "2013"
  },
  {
    "url": "/one-day-on-earth/",
    "notableText": "2013"
  },
  {
    "url": "/oasis-usa/",
    "notableText": "2013"
  },
  {
    "url": "/neighborhood-youth-association-nya/",
    "notableText": "2013"
  },
  {
    "url": "/nativ/",
    "notableText": "2013"
  },
  {
    "url": "/national-park-service/",
    "notableText": "2013"
  },
  {
    "url": "/musek/",
    "notableText": "2013"
  },
  {
    "url": "/mloveizm-inc/",
    "notableText": "2013"
  },
  {
    "url": "/minds-on-fire/",
    "notableText": "2013"
  },
  {
    "url": "/million-trees-la-a-project-of-community-partners/",
    "notableText": "2013"
  },
  {
    "url": "/materials-applications/",
    "notableText": "2013"
  },
  {
    "url": "/machine-project/",
    "notableText": "2013"
  },
  {
    "url": "/lybba/",
    "notableText": "2013"
  },
  {
    "url": "/ltsc-community-development-corporation/",
    "notableText": "2013"
  },
  {
    "url": "/los-angeles-youth-orchestra/",
    "notableText": "2013"
  },
  {
    "url": "/los-angeles-walks/",
    "notableText": "2013"
  },
  {
    "url": "/los-angeles-makerspace/",
    "notableText": "2013"
  },
  {
    "url": "/los-angeles-county-perinatal-mental-health-task-force/",
    "notableText": "2013"
  },
  {
    "url": "/liberty-hill/",
    "notableText": "2013"
  },
  {
    "url": "/learn-to-be-foundation/",
    "notableText": "2013"
  },
  {
    "url": "/laxart/",
    "notableText": "2013"
  },
  {
    "url": "/lambda-theta-nu-sorority-incorporated/",
    "notableText": "2013"
  },
  {
    "url": "/la-riverside-country-club/",
    "notableText": "2013"
  },
  {
    "url": "/la-m%C3%A1s-inc/",
    "notableText": "2013"
  },
  {
    "url": "/la-loma-development-company/",
    "notableText": "2013"
  },
  {
    "url": "/la-cleantech-incubator-clean-tech-la/",
    "notableText": "2013"
  },
  {
    "url": "/l-a-river-revitalization-corporation/",
    "notableText": "2013"
  },
  {
    "url": "/l-a-currents/",
    "notableText": "2013"
  },
  {
    "url": "/kreative-images-foundation/",
    "notableText": "2013"
  },
  {
    "url": "/kipp-la-schools/",
    "notableText": "2013"
  },
  {
    "url": "/kids-progress-inc/",
    "notableText": "2013"
  },
  {
    "url": "/keely-hopkins-associates/",
    "notableText": "2013"
  },
  {
    "url": "/kcetlink/",
    "notableText": "2013"
  },
  {
    "url": "/kcet-departures/",
    "notableText": "2013"
  },
  {
    "url": "/jemmott-rollins-group/",
    "notableText": "2013"
  },
  {
    "url": "/invisible-people/",
    "notableText": "2013"
  },
  {
    "url": "/insightla/",
    "notableText": "2013"
  },
  {
    "url": "/industrial-district-green/",
    "notableText": "2013"
  },
  {
    "url": "/individual-systems/",
    "notableText": "2013"
  },
  {
    "url": "/impact-farms-inc/",
    "notableText": "2013"
  },
  {
    "url": "/human-resources-l-a/",
    "notableText": "2013"
  },
  {
    "url": "/hub-los-angeles/",
    "notableText": "2013"
  },
  {
    "url": "/honeylove/",
    "notableText": "2013"
  },
  {
    "url": "/hive-lighting/",
    "notableText": "2013"
  },
  {
    "url": "/heart-of-los-angeles-hola/",
    "notableText": "2013"
  },
  {
    "url": "/harmony-project/",
    "notableText": "2013"
  },
  {
    "url": "/h-e-l-p-e-r-foundation/",
    "notableText": "2013"
  },
  {
    "url": "/green-octopus-consulting/",
    "notableText": "2013"
  },
  {
    "url": "/great-leap-inc/",
    "notableText": "2013"
  },
  {
    "url": "/grades-of-green/",
    "notableText": "2013"
  },
  {
    "url": "/globalgirl-media/",
    "notableText": "2013"
  },
  {
    "url": "/geoff-gallegos-dakah-hip-hop-orchestra/",
    "notableText": "2013"
  },
  {
    "url": "/generation-greens-contra-costa-county-climate-leaders-program/",
    "notableText": "2013"
  },
  {
    "url": "/garden-school-foundation/",
    "notableText": "2013"
  },
  {
    "url": "/fsbcs-dba-community-builders-resource-network-cbrn/",
    "notableText": "2013"
  },
  {
    "url": "/friends-the-foundation-of-the-california-african-american-museum/",
    "notableText": "2013"
  },
  {
    "url": "/foster-care-counts/",
    "notableText": "2013"
  },
  {
    "url": "/foryourart/",
    "notableText": "2013"
  },
  {
    "url": "/for-learners-of-all-ages/",
    "notableText": "2013"
  },
  {
    "url": "/food-forward/",
    "notableText": "2013"
  },
  {
    "url": "/flarb-llc/",
    "notableText": "2013"
  },
  {
    "url": "/first-star-inc/",
    "notableText": "2013"
  },
  {
    "url": "/first-look-west/",
    "notableText": "2013"
  },
  {
    "url": "/filmanthropos/",
    "notableText": "2013"
  },
  {
    "url": "/filipino-migrant-center/",
    "notableText": "2013"
  },
  {
    "url": "/evo-farm/",
    "notableText": "2013"
  },
  {
    "url": "/esp-empowering-services-through-partnerships/",
    "notableText": "2013"
  },
  {
    "url": "/erw-design-salt-landscape-architects/",
    "notableText": "2013"
  },
  {
    "url": "/environmental-change-makers/",
    "notableText": "2013"
  },
  {
    "url": "/electronic-music-alliance/",
    "notableText": "2013"
  },
  {
    "url": "/el-rio-schools-mind-fit-education-for-the-21st-century/",
    "notableText": "2013"
  },
  {
    "url": "/education-pioneers/",
    "notableText": "2013"
  },
  {
    "url": "/education-consortium-of-central-los-angeles-project-less/",
    "notableText": "2013"
  },
  {
    "url": "/educating-young-minds/",
    "notableText": "2013"
  },
  {
    "url": "/eddefy/",
    "notableText": "2013"
  },
  {
    "url": "/e-n-g-a-g-e-stands-for-educating-neighbors-gaining-awareness-growing-engaged/",
    "notableText": "2013"
  },
  {
    "url": "/diyfo-do-it-yourself-for-others/",
    "notableText": "2013"
  },
  {
    "url": "/design-east-of-la-brea/",
    "notableText": "2013"
  },
  {
    "url": "/dear-los-angeles/",
    "notableText": "2013"
  },
  {
    "url": "/david-lynch-foundation/",
    "notableText": "2013"
  },
  {
    "url": "/curious-catalyst/",
    "notableText": "2013"
  },
  {
    "url": "/creative-visions-foundation/",
    "notableText": "2013"
  },
  {
    "url": "/create-la/",
    "notableText": "2013"
  },
  {
    "url": "/cre-outreach/",
    "notableText": "2013"
  },
  {
    "url": "/courage-campaign/",
    "notableText": "2013"
  },
  {
    "url": "/community-coalition/",
    "notableText": "2013"
  },
  {
    "url": "/communities-in-schools-of-san-fernando-valley-inc/",
    "notableText": "2013"
  },
  {
    "url": "/collaborative-tutoring/",
    "notableText": "2013"
  },
  {
    "url": "/coalition-of-mental-health-professionals-inc/",
    "notableText": "2013"
  },
  {
    "url": "/civic-projects/",
    "notableText": "2013"
  },
  {
    "url": "/citystage/",
    "notableText": "2013"
  },
  {
    "url": "/citylife-la/",
    "notableText": "2013"
  },
  {
    "url": "/citylab-ucla/",
    "notableText": "2013"
  },
  {
    "url": "/city-of-los-angeles-department-of-cultural-affairs/",
    "notableText": "2013"
  },
  {
    "url": "/city-earthworm/",
    "notableText": "2013"
  },
  {
    "url": "/children-mending-hearts/",
    "notableText": "2013"
  },
  {
    "url": "/cheshire-moon-inc/",
    "notableText": "2013"
  },
  {
    "url": "/cartel-collaborative-arts-la/",
    "notableText": "2013"
  },
  {
    "url": "/carecen-central-american-resource-center/",
    "notableText": "2013"
  },
  {
    "url": "/california-greenworks/",
    "notableText": "2013"
  },
  {
    "url": "/california-community-foundation-ccf/",
    "notableText": "2013"
  },
  {
    "url": "/california-calls/",
    "notableText": "2013"
  },
  {
    "url": "/cal-poly-pomona-foundation-inc/",
    "notableText": "2013"
  },
  {
    "url": "/c3-center-for-conscious-creativity/",
    "notableText": "2013"
  },
  {
    "url": "/bright-star-schools/",
    "notableText": "2013"
  },
  {
    "url": "/brain-tumor-neuro-oncology-clinic-at-the-lac-usc-medical-center/",
    "notableText": "2013"
  },
  {
    "url": "/boys-girls-club-of-mar-vista-gardens/",
    "notableText": "2013"
  },
  {
    "url": "/bike-l-a-2050/",
    "notableText": "2013"
  },
  {
    "url": "/asian-american-drug-abuse-program-inc/",
    "notableText": "2013"
  },
  {
    "url": "/arts-for-la/",
    "notableText": "2013"
  },
  {
    "url": "/arts-earth-partnership/",
    "notableText": "2013"
  },
  {
    "url": "/arts-council-for-long-beach/",
    "notableText": "2013"
  },
  {
    "url": "/art-share-l-a/",
    "notableText": "2013"
  },
  {
    "url": "/arc/",
    "notableText": "2013"
  },
  {
    "url": "/api-equality-la/",
    "notableText": "2013"
  },
  {
    "url": "/antigua-coffee-house/",
    "notableText": "2013"
  },
  {
    "url": "/angelenos-against-gridlock/",
    "notableText": "2013"
  },
  {
    "url": "/alzheimers-association-california-southland-chapter/",
    "notableText": "2013"
  },
  {
    "url": "/alma-family-services/",
    "notableText": "2013"
  },
  {
    "url": "/alliance-for-a-better-community/",
    "notableText": "2013"
  },
  {
    "url": "/affordable-living-for-the-aging/",
    "notableText": "2013"
  },
  {
    "url": "/advance/",
    "notableText": "2013"
  },
  {
    "url": "/a-d-architecture-and-design-museum-los-angeles/",
    "notableText": "2013"
  },
  {
    "url": "/58-12-design-lab/",
    "notableText": "2013"
  }
]

let notableLookup = {}

for (let item of notableText) {
  let lookupItem = {
    notableText: item.notableText
  }
  // console.log(item.notableText)
  if (item.notableText.toLowerCase().includes("winner")) {
    lookupItem.is_winner = 1
  } else if (item.notableText.toLowerCase().includes("finalist")) {
    lookupItem.is_finalist = 1
  } else if (item.notableText.toLowerCase().includes("honorable")) {
    lookupItem.is_honorable_mention = 1
  }
  if (lookupItem.is_winner || lookupItem.is_finalist || lookupItem.is_honorable_mention) {
    notableLookup[item.url.replace("/", "").replace("/", "")] = lookupItem
  }
}

console.log(notableLookup);

(async function() {
  
  const records = await getRecords(`../_organizations`);
  console.log(records.length);

  saveCSVFile("../_data-export/organizations.csv", records);

})();

