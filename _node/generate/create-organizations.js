
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
    .replace(/…/g, '-')
    .replace(/\?/g, '-')
    .replace(/\$/g, '-')
    .replace(/\%/g, '-')
    .replace(/\≠/g, '-')
    .replace(/\–/g, '-')
    .replace(/\—/g, '-')
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
    .replace(/ /g, '')
}

function getStringForComparison(string) {
  string = string.toLowerCase().replace(/\,/g, "").replace(/\\\r\\\n/g, "").replace(/\\\r/g, "").replace(/\\\n/g, "").trim()
  string = (stringToURI(string).replace(/\-/, ""))
  // if (string.indexOf("A house for Tommy in my backyard!") >= 0) {
  //   console.log("BEFORE")
  //   console.log(string)
  //   console.log("AFTER")
  //   console.log(string.toLowerCase().replace(/\,/g, "").replace(/\\\r\\\n/g, "").replace(/\\\r/g, "").replace(/\\\n/g, "").trim())
  //   return "A house for Tommy in my backyard! If only LA knew the opportunity that lies in our backyards…"
  // }
  return string
}

function fixDataCharacters(data) {
  for (let prop in data) {
    if (typeof(data[prop]) === 'string') {
      data[prop] = data[prop]
        .replace(/â€“/g, '—')
        .replace(/â€˜/g, '‘')
        .replace(/â€™/g, '’')
        .replace(/â€¯/g, '') // ?
        .replace(/â€”/g, '—')
        .replace(/â€‹/g, '') // ?
        .replace(/â€œ/g, '“') // ?
        .replace(/â€/g, '”') // ?
        .replace(/â€¢/g, "*")
        .replace(/â€¦/g, "…")
        .replace(/âˆš/g, '√')
        .replace(/â–ª/g, '*')
        .replace(/â—\x8F/g, '*')
        .replace(/â„¢/g, '™')
        .replace(/Â·/g, '* ')
        .replace(/Â½/g, '½')
        .replace(/Ãœ/g, 'Ü')
        .replace(/Ã±/g, 'ñ')
    }
  }

  return data;
}

let makerProjectAnswersLookup
const test_id = null
// const test_id = "8075"

function getMakerProjects(data, makerProjects, makerProjectAnswers) {
  // console.log("getMakerProject")

  // Create an object for quick lookup
  if (!makerProjectAnswersLookup) {
    makerProjectAnswersLookup = {}
    makerProjectAnswers.forEach(answer => {
      // if (answer.project_id == 9541) console.dir(answer)
      if (answer.project_id == test_id) console.log("Adding an answer index for Alliance for a Better Community, 8115")
      if (!makerProjectAnswersLookup[answer.project_id]) {
        makerProjectAnswersLookup[answer.project_id] = {}
      }
      makerProjectAnswersLookup[answer.project_id][getStringForComparison(answer.value)] = 1
      // if (answer.project_id == test_id) console.log(answer.project_id)
      // if (answer.project_id == test_id) console.log(answer.value)
    })
  }

  let matches = []
  makerProjects.forEach(project => {
    if (project.id == test_id) {
      console.log("Checking to see if project matches Alliance for a Better Community, 8115")
      console.log("makerProjectAnswersLookup[project.id]: " + makerProjectAnswersLookup[project.id])
      // console.dir(makerProjectAnswersLookup[project.id])
    }

    if (makerProjectAnswersLookup[project.id] && 
        makerProjectAnswersLookup[project.id][getStringForComparison(data.organization_name)]) {
      if (project.id == test_id) {
        console.log("makerProjectAnswersLookup[project.id][data.organization_name]: " + makerProjectAnswersLookup[project.id][getStringForComparison(data.organization_name)])
        console.log("*** found a match!")
      }
      matches.push(project)
    }
  })
  return matches
}

let makerImagesLookup

function getMakerImage(data, makerProjects, makerImages, makerProjectAnswers) {

  // Create an object for quick lookup
  if (!makerImagesLookup) {
    makerImagesLookup = {}
    makerImages.forEach(image => {
      if (image.project_id == test_id) console.log("Adding an image index for Alliance for a Better Community, 8115")


      if (!makerImagesLookup[image.project_id]) {
        makerImagesLookup[image.project_id] = {}
      }
      makerImagesLookup[image.project_id][image.type] = image
    })
  }

  // console.log("getMakerImage")
  let projects = getMakerProjects(data, makerProjects, makerProjectAnswers)
  let images = []
  if (projects && projects.length > 0) {
    projects.sort((a, b) => {
      // a is less than b by some ordering criterion
      if (a.created_at > b.created_at) {
        return -1
      }
      // a is greater than b by the ordering criterion
      if (a.created_at < b.created_at) {
        return 1
      }
      // a must be equal to b
      return 0
    })
    projects.forEach(project => {
      if (makerImagesLookup[project.id]) {
        images.push( {
          project_title: project.name,
          image: makerImagesLookup[project.id]["ProjectPhoto"],
          video: makerImagesLookup[project.id]["ProjectVideo"]
        } )
      }
    })
  }

  if (images.length > 0) {
    if (data.organization_id == 2015051) {
      console.log("**** images ")
      console.dir(images)
      console.log("****")
    }
    let latestProjectTitle = getLatestProjectTitle(data)
    if (data.organization_id == 2015051) {
      console.log(`latestProjectTitle: ${latestProjectTitle}`)
    }
    let makerImage
    images.forEach(image => {
      if (typeof(image.project_title) === "string" && typeof(latestProjectTitle) === "string" && 
        getStringForComparison(image.project_title) == getStringForComparison(latestProjectTitle)) {
        if (data.organization_id == 2015051) {
          console.log(`found a match: ${image.project_title}`)
        }
        makerImage = image
      }
    })
    if (data.organization_id == 2015051) {
      console.log(`couldn’t find a match`)
    }
    if (!makerImage) makerImage = images[0]
    return makerImage
  } else {
    console.log("couldn’t find image data for project: " + data.title + " : " + data.year_submitted + " : " + data.category + " : " + data.organization_id)
    return {
      image: "http://maker.good.is/images/placeholder/idea.png"
    }
  }
}

const dataToRemove = [
  "empty_column_1",
  "empty_column_2",
  "empty_column_3"
]



// let tinyImages = []

// let images = document.querySelectorAll(".proposals li img")
// images.forEach(image => {
//   var img = new Image();

//   img.onload = function(){
//     var height = img.height;
//     var width = img.width;

//     console.log(`width ${width}`)
//     console.log(`height ${height}`)
//     if (width < 200 || height < 200) {
//       tinyImages.push(image.getAttribute("src"))
//     }

//     // code here to use the dimensions
//   }

//   img.src = image.getAttribute("src");
// })

// JSON.stringify(tinyImages)

let tinyImages = JSON.parse("[\"https://img.youtube.com/vi/QV1lB2SqWos/maxresdefault.jpg\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F21055%252Fdisplay%252FWashington_Square.JPG=c570x385\",\"https://img.youtube.com/vi/d8oxCVYqxhU/maxresdefault.jpg\",\"https://img.youtube.com/vi/JrkPrBnN4UI/maxresdefault.jpg\",\"https://img.youtube.com/vi/FVOqZ9sWi8k/maxresdefault.jpg\",\"https://img.youtube.com/vi/Eg3e5xfocOk/maxresdefault.jpg\",\"https://img.youtube.com/vi/DVIx37igPg0/maxresdefault.jpg\",\"https://img.youtube.com/vi/tnpBsy1mGwQ/maxresdefault.jpg\",\"https://img.youtube.com/vi/IRXVbzVLXls/maxresdefault.jpg\",\"https://img.youtube.com/vi/0EQnXawnCQk/maxresdefault.jpg\",\"https://img.youtube.com/vi/nPa4Lu7CMPA/maxresdefault.jpg\",\"https://img.youtube.com/vi/KRKqNflY-PU/maxresdefault.jpg\",\"https://img.youtube.com/vi/BtUB4Ycebms/maxresdefault.jpg\",\"https://img.youtube.com/vi/q9wQFn0hPbk/maxresdefault.jpg\",\"https://img.youtube.com/vi/z__BDhvkp9Q/maxresdefault.jpg\",\"https://img.youtube.com/vi/HIVY5tBE450/maxresdefault.jpg\",\"http://maker.good.is/images/placeholder/idea.png\",\"https://img.youtube.com/vi/0fH09h-Rx9o/maxresdefault.jpg\",\"https://img.youtube.com/vi/XyASgYDVS_Q/maxresdefault.jpg\",\"https://img.youtube.com/vi/ZobE5kX4dTc/maxresdefault.jpg\",\"https://img.youtube.com/vi/quAWRNiRKEg/maxresdefault.jpg\",\"https://img.youtube.com/vi/UYdxlEZVaNA/maxresdefault.jpg\",\"https://img.youtube.com/vi/jRPfyjiCjwg/maxresdefault.jpg\",\"https://img.youtube.com/vi/myUKgR-PO4c/maxresdefault.jpg\",\"https://img.youtube.com/vi/XNxfMssLYzc/maxresdefault.jpg\",\"https://img.youtube.com/vi/ghRsAe0AExM/maxresdefault.jpg\",\"https://img.youtube.com/vi/-MVQfBjaOS0/maxresdefault.jpg\",\"https://img.youtube.com/vi/KHtt2okRChU/maxresdefault.jpg\",\"https://img.youtube.com/vi/I85PHrZjakM/maxresdefault.jpg\",\"https://img.youtube.com/vi/y5Q3OTnTYC4/maxresdefault.jpg\",\"https://img.youtube.com/vi/XFrn3G05ZVc/maxresdefault.jpg\",\"https://img.youtube.com/vi/K83J6XaqQlM/maxresdefault.jpg\",\"https://img.youtube.com/vi/cEATGWzLMiM/maxresdefault.jpg\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16855%252Fdisplay%252FDLFlogo.jpg=c570x385\",\"https://img.youtube.com/vi/8GZELMERrSk/maxresdefault.jpg\",\"https://img.youtube.com/vi/HtWxHzKO0zY/maxresdefault.jpg\",\"https://img.youtube.com/vi/IYZkhNMTKrg/maxresdefault.jpg\",\"https://img.youtube.com/vi/fpGXBYHFZuE/maxresdefault.jpg\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16942%252Fdisplay%252FSequester_student_working1.jpg=c570x385\",\"https://img.youtube.com/vi/aKgBQ7XR-pg/maxresdefault.jpg\",\"https://img.youtube.com/vi/6pkTdEgSCvo/maxresdefault.jpg\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16296%252Fdisplay%252FEMAHeader.jpg=c570x385\",\"https://img.youtube.com/vi/kNqNTSXVqsI/maxresdefault.jpg\",\"https://img.youtube.com/vi/C1uVBoRtQ74/maxresdefault.jpg\",\"https://img.youtube.com/vi/nO6H3p5HpV4/maxresdefault.jpg\",\"https://img.youtube.com/vi/--BnysezHK0/maxresdefault.jpg\",\"https://img.youtube.com/vi/CZMjDcpz53c/maxresdefault.jpg\",\"https://img.youtube.com/vi/EpR6dHeaGIQ/maxresdefault.jpg\",\"https://img.youtube.com/vi/q2OELc_KuI4/maxresdefault.jpg\",\"https://img.youtube.com/vi/W-ekiTrnYW0/maxresdefault.jpg\",\"https://img.youtube.com/vi/t_fQo1Z6VSg/maxresdefault.jpg\",\"https://img.youtube.com/vi/_BC4Wfw6Gb4/maxresdefault.jpg\",\"https://img.youtube.com/vi/ZErt5IiuEPA/maxresdefault.jpg\",\"https://img.youtube.com/vi/gHdNsESWQgM/maxresdefault.jpg\",\"https://img.youtube.com/vi/gyQdQTAWs0U/maxresdefault.jpg\",\"https://img.youtube.com/vi/zqrk27Md2Bo/maxresdefault.jpg\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F17077%252Fdisplay%252FHelper_Logo.jpg=c570x385\",\"https://img.youtube.com/vi/EJWQ6cYZBCk/maxresdefault.jpg\",\"https://img.youtube.com/vi/EDmhXWDVs3M/maxresdefault.jpg\",\"https://img.youtube.com/vi/MIn1VBaIlrQ/maxresdefault.jpg\",\"https://img.youtube.com/vi/jpQSRVlR_XM/maxresdefault.jpg\",\"https://img.youtube.com/vi/3ceZFpvVVU0/maxresdefault.jpg\",\"https://img.youtube.com/vi/TkvIb74D38g/maxresdefault.jpg\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16812%252Fdisplay%252FLogo_Color_Large2.png=c570x385\",\"https://img.youtube.com/vi/2Pjt88MXETw/maxresdefault.jpg\",\"https://img.youtube.com/vi/CqF0Cn4dZJs/maxresdefault.jpg\",\"https://img.youtube.com/vi/lLS50WusJa4/maxresdefault.jpg\",\"https://img.youtube.com/vi/iQpQqqot8AQ/maxresdefault.jpg\",\"https://img.youtube.com/vi/pnwgZVtiDAA/maxresdefault.jpg\",\"https://img.youtube.com/vi/9PUd4G27uNk/maxresdefault.jpg\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F17051%252Fdisplay%252Ffullsized_ballot-brief-logo-stacked.jpeg=c570x385\",\"https://img.youtube.com/vi/v-5UnN1CD0E/maxresdefault.jpg\",\"https://img.youtube.com/vi/oPkjhNbvFTw/maxresdefault.jpg\",\"https://img.youtube.com/vi/7so4eDfFRws/maxresdefault.jpg\",\"https://img.youtube.com/vi/JPbaYb88x0U/maxresdefault.jpg\",\"https://img.youtube.com/vi/f2SXn1p3d4I/maxresdefault.jpg\",\"https://img.youtube.com/vi/SXGVU13JPLU/maxresdefault.jpg\",\"https://img.youtube.com/vi/iGjxg6yI_og/maxresdefault.jpg\",\"https://img.youtube.com/vi/fRmzSDzuoRA/maxresdefault.jpg\",\"https://img.youtube.com/vi/DRehRt5n68c/maxresdefault.jpg\",\"https://img.youtube.com/vi/kfEpQxhOtUk/maxresdefault.jpg\",\"https://img.youtube.com/vi/_AEWWNe6eQw/maxresdefault.jpg\",\"https://img.youtube.com/vi/QQpabiJ0uus/maxresdefault.jpg\",\"https://img.youtube.com/vi/Xoof6-2YZ_U/maxresdefault.jpg\",\"https://img.youtube.com/vi/79DqmMTV8-Y/maxresdefault.jpg\",\"https://img.youtube.com/vi/lilCVZW2Ggk/maxresdefault.jpg\",\"https://img.youtube.com/vi/hHXkL2SbXI8/maxresdefault.jpg\",\"https://img.youtube.com/vi/Q4dC-OX4vTw/maxresdefault.jpg\",\"https://img.youtube.com/vi/ql6hxsjKMCQ/maxresdefault.jpg\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F23910%252Fdisplay%252FMMH-NOW_Final_Logo_9.1.15_(8.5_x_3_5).jpg=c570x385\",\"https://img.youtube.com/vi/H107Gy4bTFs/maxresdefault.jpg\",\"https://img.youtube.com/vi/A3zOCbnCHLg/maxresdefault.jpg\",\"https://img.youtube.com/vi/9xQP6vGylgE/maxresdefault.jpg\",\"https://img.youtube.com/vi/2qWrLJakj5M/maxresdefault.jpg\",\"https://img.youtube.com/vi/sO2seHdnH3c/maxresdefault.jpg\",\"https://img.youtube.com/vi/A9yf6DpgLSM/maxresdefault.jpg\",\"https://img.youtube.com/vi/Gx66ZyZaf90/maxresdefault.jpg\",\"https://img.youtube.com/vi/z7nrpaONjUI/maxresdefault.jpg\",\"https://img.youtube.com/vi/JVyDVToMVoo/maxresdefault.jpg\",\"https://img.youtube.com/vi/y3Gts_Aoxd8/maxresdefault.jpg\",\"https://img.youtube.com/vi/z7QaUClznXM/maxresdefault.jpg\",\"https://img.youtube.com/vi/XUlv1Zd4JZU/maxresdefault.jpg\",\"http://maker.good.is/images/placeholder/idea.png\",\"http://maker.good.is/images/placeholder/idea.png\",\"https://img.youtube.com/vi/VpqSppE8ppo/maxresdefault.jpg\",\"https://img.youtube.com/vi/a-kQryxgF4M/maxresdefault.jpg\",\"https://img.youtube.com/vi/_8WrWZXDKdQ/maxresdefault.jpg\",\"https://img.youtube.com/vi/ApjqumUUgTI/maxresdefault.jpg\",\"https://img.youtube.com/vi/Hey6DKTLdw8/maxresdefault.jpg\",\"https://img.youtube.com/vi/inJ5XFkvJ84/maxresdefault.jpg\",\"https://img.youtube.com/vi/Cb6MAN2lVkg/maxresdefault.jpg\",\"https://img.youtube.com/vi//maxresdefault.jpg\",\"https://img.youtube.com/vi/TsuTBskJETc/maxresdefault.jpg\",\"https://img.youtube.com/vi/yUDKtK6Gfls/maxresdefault.jpg\",\"https://img.youtube.com/vi/Jw8-KCURHUA/maxresdefault.jpg\",\"https://img.youtube.com/vi/CDJnJMrwko8/maxresdefault.jpg\",\"https://img.youtube.com/vi/iHvoKckqh4o/maxresdefault.jpg\",\"https://img.youtube.com/vi/DMG32xJ5p-Q/maxresdefault.jpg\",\"https://img.youtube.com/vi/uz4evo3B7qw/maxresdefault.jpg\",\"https://img.youtube.com/vi/cWwkZlNW9ng/maxresdefault.jpg\",\"https://img.youtube.com/vi/ERxmCic5y3o/maxresdefault.jpg\",\"https://img.youtube.com/vi/pUrKNHKdDLA/maxresdefault.jpg\",\"https://img.youtube.com/vi/lz8FDz2KN0s/maxresdefault.jpg\",\"https://img.youtube.com/vi/R-T1Ud6JTNo/maxresdefault.jpg\",\"https://img.youtube.com/vi/xF48V9enLaE/maxresdefault.jpg\",\"https://img.youtube.com/vi/G4cMVQVTBkM/maxresdefault.jpg\",\"https://img.youtube.com/vi/TlilAMszJEs/maxresdefault.jpg\",\"https://img.youtube.com/vi/dCvzeDvQtLY/maxresdefault.jpg\",\"https://img.youtube.com/vi/gzqE0ygfM8Y/maxresdefault.jpg\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16903%252Fdisplay%252FLBSpan2med.jpg=c570x385\",\"https://img.youtube.com/vi/FB9aNSfVARA/maxresdefault.jpg\",\"https://img.youtube.com/vi/lg-vCWbUV8s/maxresdefault.jpg\",\"https://img.youtube.com/vi/sN5SCezYZTM/maxresdefault.jpg\",\"https://img.youtube.com/vi/2U1i7uKpy8Y/maxresdefault.jpg\",\"https://img.youtube.com/vi/awJQoJqGL-o/maxresdefault.jpg\",\"https://img.youtube.com/vi/X9EpK48pYtY/maxresdefault.jpg\",\"https://img.youtube.com/vi/KofWk5qh3jE/maxresdefault.jpg\",\"https://img.youtube.com/vi/BnbLK2sxsXI/maxresdefault.jpg\",\"https://img.youtube.com/vi/5tvdNOJ7fCw/maxresdefault.jpg\",\"https://img.youtube.com/vi/jUd4odIOyuc/maxresdefault.jpg\",\"https://img.youtube.com/vi/nu53ttV7jQI/maxresdefault.jpg\",\"https://img.youtube.com/vi/SdL6NXZskjo/maxresdefault.jpg\",\"https://img.youtube.com/vi/g_OFCYLH7gw/maxresdefault.jpg\",\"https://img.youtube.com/vi/dN0L0YMa39s/maxresdefault.jpg\",\"https://img.youtube.com/vi/Sq1MDbnR1wg/maxresdefault.jpg\",\"https://img.youtube.com/vi/f_x1AGOuR7A/maxresdefault.jpg\",\"https://img.youtube.com/vi/-8HpYaBGc4I/maxresdefault.jpg\",\"https://img.youtube.com/vi/4svMiNJ-HL0/maxresdefault.jpg\",\"https://img.youtube.com/vi/FmHmFIlfA4A/maxresdefault.jpg\",\"https://img.youtube.com/vi/31zyNJHGmig/maxresdefault.jpg\",\"https://img.youtube.com/vi/4zAG6xu-HQM/maxresdefault.jpg\"]")
let tinyImagesLookup = {}
tinyImages.forEach(image => {
  if (image.includes("youtube")) {
    let youTubeID = image.split("/")[4] // https://img.youtube.com/vi/q9wQFn0hPbk/maxresdefault.jpg
    tinyImagesLookup[youTubeID] = 1
  }
})

// let missingImages = []

// let images = document.querySelectorAll(".proposals li img")
// images.forEach(image => {
//   var img = new Image();

//   img.onerror = function(){
//     missingImages.push(image.getAttribute("src"))
//   }

//   img.src = image.getAttribute("src");
// })

// JSON.stringify(missingImages)


// http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F17061%252Fdisplay%252FObama_kids_jobs.jpg=c570x385


let missingImages = JSON.parse("[\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16321%252Fdisplay%252F2050_image.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16313%252Fdisplay%252Fsamsung_device_801.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F21279%252Fdisplay%252F20121102_193319.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16042%252Fdisplay%252FBRAINCANCERLA2050.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F17103%252Fdisplay%252FScreen_shot_2013-03-28_at_2.40.43_PM.png=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16214%252Fdisplay%252FIMG_1031.JPG=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F17107%252Fdisplay%252Frachelschmid.elrio.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16290%252Fdisplay%252Fzenfunder-la2050.png=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16774%252Fdisplay%252Fvertical_AP_kit_3.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F23585%252Fdisplay%252FEW_Molly_EWLA_sm.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16195%252Fdisplay%252Fevolvela2.png=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16352%252Fdisplay%252Fvnfl_final.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16238%252Fdisplay%252FDebris_3.JPG=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16366%252Fdisplay%252FStem_pic.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16174%252Fdisplay%252FLAM_Robots.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16399%252Fdisplay%252FAndrew_Colunga_whole_image_sm.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16109%252Fdisplay%252FBLOOM-NEWFINAL_LOGO_ccf_tag.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16271%252Fdisplay%252Fopenhealthcentral.png=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16307%252Fdisplay%252Fimage.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16057%252Fdisplay%252Fmcmenyellowandwhite_final.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16300%252Fdisplay%252F2010-2011_Graduation_Picture.171103650_std.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16261%252Fdisplay%252FLASA_2012.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16360%252Fdisplay%252FGarden_Sign.png=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16395%252Fdisplay%252FPOSTCARD-1.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16669%252Fdisplay%252FCLARK_The_Country_Wife__1.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16254%252Fdisplay%252Fscholarspic.jpg=c570x385\",\"http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F16390%252Fdisplay%252Fslider_gocarts2.jpg=c570x385\"]")
let missingImagesLookup = {}

// console.dir(missingImages)

missingImages.forEach(image => {
  if (image.includes("Obama_kids_jobs.jpg")) {
    console.log("adding lookup image Obama_kids_jobs.jpg")
    console.log(`image: ${image}`)
  }
  missingImagesLookup[image] = 1
})
// console.dir(missingImagesLookup)


function createMarkdownFile(data, makerProjects, makerImages, makerProjectAnswers) {
  // console.log('createMarkdownFile for ' + data.title)
  let writePath = '../_organizations'

  // let filename = data.organization_id + "-" + stringToURI(data.title)
  let filename = stringToURI(data.title)

  data.uri = '/organizations/' + filename + '/'
  // data.order = orderCursor++

  data.challenge_url = data.url
  delete data.url

  // TODO: Get the ntee_type from the page located at charity_navigator_url
  delete data.link_to_ntee_code

  dataToRemove.forEach(name => {
    delete data[name]
  })

  if (data.tags_indicators === "0") data.tags_indicators = ""

  if (data.tags_indicators && data.tags_indicators != "") {
    data.tags_indicators = data.tags_indicators.split(", ")
  }

  function hasValue(tag) {
    return tag && tag != "" && tag != " " && tag != " \r"
  }

  function simplify(tag) {
    return tag.replace("\r", "").replace(/[0-9][0-9]\s/g, "").replace(/ and /g, " & ")
  }

  if (organizationTagsLookup[data.organization_id] && 
    (hasValue(organizationTagsLookup[data.organization_id].tag_1) ||
     hasValue(organizationTagsLookup[data.organization_id].tag_2))) {

    data.tags_indicators = []

    if (hasValue(organizationTagsLookup[data.organization_id].tag_1)) {
      data.tags_indicators.push(simplify(organizationTagsLookup[data.organization_id].tag_1))
    }

    if (hasValue(organizationTagsLookup[data.organization_id].tag_2)) {
      data.tags_indicators.push(simplify(organizationTagsLookup[data.organization_id].tag_2))
    }

    data.tags_indicators.forEach(tag => {
      if (parentTags[tag]) {
        if (!data.tags_indicators.includes(parentTags[tag])) {
          data.tags_indicators.push(parentTags[tag])
        }
      }
    })
  } else {
    delete data.tags_indicators
  }

  try {
    data.twitter = JSON.parse(data.twitter)
  } catch(e) {}
  try {
    data.instagram = JSON.parse(data.instagram)
  } catch(e) {}
  try {
    data.facebook = JSON.parse(data.facebook)
  } catch(e) {}

  if (data.organization_website && data.organization_website != "") {
    data.organization_website = data.organization_website.split(",")
  }

  if (data.organization_id_2 === data.organization_id) {
    delete data.organization_id_2
  } else {
    console.log("found an organization_id_2 different from organization_id : " + data.organization_id_2)
  }

  try {
    data.areas_impacted = JSON.parse(data.areas_impacted)
  } catch(e) {
    // console.log("Couldn’t parse areas_impacted: " + data.areas_impacted)
  }

  if (data.year_submitted == 2018) {
    data.project_image = data.project_image.replace(/https\:\/\/activation.la2050.org\/([^/]+)\/[^/]+\/([^\.]+)\.jpg/, function(match, p1, p2, offset, string) {
      // p1 is nondigits, p2 digits, and p3 non-alphanumerics
      if (!data.category) data.category = p1
      return `https://activation.la2050.org/assets/images/${p1}/2048-wide/${p2}.jpg`
    })
  } else if (data.year_submitted == 2016) {
    if (!data.project_image.includes('http')) {
      data.project_image = `https://skild-prod.s3.amazonaws.com/myla2050/images/custom540/${data.project_image}`
    }
  } else if (data.year_submitted == 2015 || 
             data.year_submitted == 2014 ||
             data.year_submitted == 2013) {

    let projects = getProjects(data)
    if (projects && projects.length > 0) {
      data.project_titles = projects.map(project => project.title)
    }
    // data.category = projects[0].category

    // if (!data.project_image || data.project_image == "" || data.project_image.includes(".html")) {
    if (true) {
      // if (data.organization_name == "Alliance for a Better Community") console.log("Looking for image for Alliance for a Better Community, 8115")
      let match = getMakerImage(data, makerProjects, makerImages, makerProjectAnswers)
      if (data.organization_id == 2015051) {
        console.dir(data)
        console.dir(match)
      }
      if (match && match.image) {
        // console.dir(match)
        // http://maker.good.is/s3/maker/attachments/project_photos/images/23182/display/CCC_pic17_small.jpg=c570x385
        // http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F23182%252Fdisplay%252FCCC_pic17_small.jpg=c570x385

        // http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F22867%252Fdisplay%252FGiveHalf_009.jpg=c570x385
        // http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F17230%252Fdisplay%252Fverynice.jpeg=c570x385#

        if (typeof(match.image) == "object") {

          let encodedURI = encodeURIComponent(encodeURIComponent(`maker/attachments/project_photos/images/${match.image.id}/display/${match.image.image_file_name}`))
          data.maker_image_id = match.image.id
          data.maker_image_file_name = match.image.image_file_name
          data.project_image = `http://maker.good.is/s3/${encodedURI}=c570x385`
          // console.log(data.project_image)
          // http://img.youtube.com/vi/yeyzmCpYfFk/maxresdefault.jpg
        } else {
          data.project_image = match.image
        }
      } else if (match && match.video) {
        // http://maker.good.is/s3/maker/attachments/project_photos/images/23182/display/CCC_pic17_small.jpg=c570x385
        // http://maker.good.is/s3/maker%252Fattachments%252Fproject_photos%252Fimages%252F23182%252Fdisplay%252FCCC_pic17_small.jpg=c570x385

        // https://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api

        let size = tinyImagesLookup[match.video.youtube_video_identifier] ? `hqdefault.jpg` : `maxresdefault.jpg`

        data.project_image = `https://img.youtube.com/vi/${match.video.youtube_video_identifier}/${size}`


        // https://i.ytimg.com/vi/Gx66ZyZaf90/sddefault.jpg
        // data.project_image = `https://i.ytimg.com/vi/${match.video.youtube_video_identifier}/hqdefault.jpg`


        // data.project_image = `http://img.youtube.com/vi/${match.video.youtube_video_identifier}/maxresdefault.jpg`

        data.youtube_video_identifier = match.video.youtube_video_identifier
        // console.log(data.project_image)
      }
    } else {
      console.log("image already present: " + data.organization_name + " : " + data.project_image)
    }
  }

  // console.dir(data)

  for (let prop in data) {
    if (data[prop] === '0') data[prop] = ''
  }
  data = fixDataCharacters(data);

  // if (data.project_image.includes("Obama_kids_jobs.jpg")) {
  //   console.log("checking for missing image Obama_kids_jobs.jpg")
  //   console.log(`data.project_image: ${data.project_image}`)
  //   console.log(`missingImagesLookup[data.project_image]: ${missingImagesLookup[data.project_image]}`)
  // }
  if (missingImagesLookup[data.project_image]) {
    data.project_image = "http://maker.good.is/images/placeholder/idea.png"
  }

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

function generateAllCollections(file_name, maker_projects, maker_user_media, maker_project_answers) {

  console.log('generateCollections: ' + file_name)

  let input = fs.readFileSync('../_spreadsheets/' + file_name, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api


  let makerProjectAnswersInput = fs.readFileSync('data/' + maker_project_answers, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let makerProjectAnswers = parse(makerProjectAnswersInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api


  let makerUserMediaInput = fs.readFileSync('data/' + maker_user_media, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let makerImages = parse(makerUserMediaInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api


  let makerProjectInput = fs.readFileSync('data/' + maker_projects, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let makerProjects = parse(makerProjectInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api


  // Sort by most recent year first
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

    records[index].year_submitted = Number(records[index].year_submitted)

    createMarkdownFile(records[index], makerProjects, makerImages, makerProjectAnswers)
  }
  return records
}


function getProjectRecords(filename, year) {
  let input = fs.readFileSync(`../_spreadsheets/${filename}`, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api
  records.forEach(record => {
    if (!record.year_submitted) record.year_submitted = year
  })
  return records
}

const years = [2013, 2014, 2015, 2016, 2018]
let projectRecords = []
years.forEach(year => {
  projectRecords = projectRecords.concat(getProjectRecords(`projects-${year}.csv`, year))
})


let projectsLookup = {}
projectRecords.forEach(project => {
  if (!projectsLookup[project.organization_id]) {
    projectsLookup[project.organization_id] = []
  }
  projectsLookup[project.organization_id].push(project)
})


function getProjects(organization) {
  if (organization.organization_id == 2015051) {
    console.log("getLastestProject for verynice")
  }
  let projects = projectsLookup[organization.organization_id]
  if (projectsLookup[organization.organization_id] &&
      projectsLookup[organization.organization_id].length > 0) {
    projects.sort(function (a, b) {
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
    return projects
  }
}

function getLatestProjectTitle(organization) {
  let projects = getProjects(organization)
  if (projects && projects.length > 0) {
    return getProjects(organization)[0].title
  }
}


let organizationTagsInput = fs.readFileSync('../_spreadsheets/tags-organization-2013-2018.csv', 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
let organizationTags = parse(organizationTagsInput, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

// Create an object for quick lookup
let organizationTagsLookup = {}
organizationTags.forEach(tag => {
  organizationTagsLookup[tag.organization_id] = tag
})


// Get document, or throw exception on error
let parentTagsData = yaml.safeLoad(fs.readFileSync('../_data/tags.yaml', 'utf8'));
// console.dir(parentTagsData)

let parentTags = {}
for (let prop in parentTagsData) {
  if (parentTagsData.hasOwnProperty(prop)) {
    parentTagsData[prop].forEach(childTag => {
      parentTags[childTag] = prop
    })
  }
}
// console.dir(parentTags)

generateAllCollections('organizations-2013-2018.csv', 
                       'maker-projects.csv',
                       'maker-user-media.csv',
                       'maker-project-properties.csv')




