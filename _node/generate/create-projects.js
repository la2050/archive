
'use strict'

let fs = require('fs')
let mkdirp = require('mkdirp')
let parse = require('csv-parse/lib/sync')
let yaml = require('js-yaml')
// let request = require("request")

// Tickleberry Place : 2014 : play : 2016238
// cARTel: Collaborative Arts LAs ToDo List : 2013 : undefined : 2013030
// Alliance CollegeReady Public Schools  BLAST : 2013 : undefined : 2013005
// PARKINABOX : 2013 : undefined : 2013062
// Development of a Multidisciplinary Los Angeles CountyBased Brain Cancer Program  : 2013 : undefined : 2013022
// Turn Up the Turn Out: Engaging LA’s Voters through Advanced Technology in LowIncome Neighborhoods : 2013 : undefined : 2013026
// What’s the BF(B)D? Connecting Neighborhoods through BicycleFriendly Business Districts : 2013 : undefined : 2013085
// PickUp PopUp Produce Station : 2013 : undefined : 2013040
// LA Street Vendors: A Better Economy through LowIncome Entrepreneurs : 2013 : undefined : 2018035
// ChangeMaking Gardens : 2013 : undefined : 2013061
// Virtual Mentor Program for Foster and Atrisk Youth : 2013 : undefined : 2013073
// PesticideFree Los Angeles 2050 : 2013 : undefined : 2013091
// Roving RÃ­o Vista: A Park on the Move : 2013 : undefined : 2013110
// Financial Enrichment and Management (collegiate class of 20182019) : 2013 : undefined : 2013117
// Crowdsourcing Education To Provide Free Oneonone Online Tutoring For Underserved Communities  : 2013 : undefined : 2013120
// ReConnecting L.A. Neighborhoods through Music & History : 2013 : undefined : 2013128
// The Salamander Project: Redesigning Creativity in Education : 2013 : undefined : 2013145
// AxS aksis Festival : 2013 : undefined : 2013152
// College Bus: Driving LA’s LowIncome Youth Towards a College Education : 2013 : undefined : 2013154
// RFKLA (Legacy in Action) Digital Archive : 2013 : undefined : 2013163
// A HighPaying HighTech Jobs Solution For Those That Need It The MOST : 2013 : undefined : 2014078
// everybody dance:  Training LA’s Teachers to Bring Dance Education Back to LA’s K8 Schools : 2013 : undefined : 2014201
// SelfSustainable Artistic Community  : 2013 : undefined : 2013211
// Wayfinder LA a utility for carfree transit : 2013 : undefined : 2013216


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
    .replace(/\>/g, "-")
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
  string = fixDataCharactersInString(string)
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


function getArrayFromString(string) {
  if (!string) return []

  string = string
    .replace('undefined:1', '')
    .replace("\"open spaces\"", "“open spaces”")
    .replace(/^"/g, '')  // Remove leading quote
    .replace(/"$/g, '')  // Remove trailing quote
    .replace(/', '/g, '", "') // Change single quotes into double quotes (since that’s require for valid JSON)
    .replace(/', "/g, '", "')
    .replace(/", '/g, '", "')
    .replace(/\['/g, '["')
    .replace(/'\]/g, '"]')
  //string = `${string}`.replace(/'/g, '"')
  console.log('parsing JSON string: ' + string)
  console.log('')
  console.log('')
  console.log('')
  return JSON.parse(string)
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}


// KUDOS: https://stackoverflow.com/questions/13006556/check-if-two-strings-share-a-common-substring-in-javascript
// Note: not fully tested, there may be bugs:
function subCompare (needle, haystack, min_substring_length) {

    // Min substring length is optional, if not given or is 0 default to 1:
    min_substring_length = min_substring_length || 1;

    // Search possible substrings from largest to smallest:
    for (let i=needle.length; i>=min_substring_length; i--) {
        for (let j=0; j <= (needle.length - i); j++) {
            let substring = needle.substr(j,i);
            let k = haystack.indexOf(substring);
            if (k != -1) {
                return {
                    found : 1,
                    substring : substring,
                    needleIndex : j,
                    haystackIndex : k
                }
            }
        }
    }
    return {
        found : 0
    }
}




function getMakerProjectByName(projectName) {
  let match
  makerProjects.forEach(project => {
    if (match) return;

    if (getStringForComparison(project.name) == getStringForComparison(projectName)) {
      // console.log("************ found a match!")
      match = project
    }
  })
  // console.log(match)
  return match
}



let makerProjectQuestionsLookup

function createMakerProjectQuestionsLookup() {
  if (!makerProjectQuestionsLookup) {
    makerProjectQuestionsLookup = {}
    makerProjectQuestions.forEach(question => {
      makerProjectQuestionsLookup[question.id] = question
    })
  }
}



let makerProjectAnswersLookup
const test_id = null
// const test_id = 8272


function createMakerProjectAnswerLookup() {
  // console.log("getMakerProject")

  // Create an object for quick lookup
  if (!makerProjectAnswersLookup) {
    makerProjectAnswersLookup = {}
    makerProjectAnswers.forEach(answer => {
      // if (answer.project_id == 9541) console.dir(answer)
      if (answer.project_id == test_id) console.log("Adding an answer index for test_id: " + test_id)
      if (!makerProjectAnswersLookup[answer.project_id]) {
        makerProjectAnswersLookup[answer.project_id] = {
          keys: {},
          answers: []
        }
      }
      makerProjectAnswersLookup[answer.project_id].keys[getStringForComparison(answer.value)] = 1
      makerProjectAnswersLookup[answer.project_id].answers.push(answer)
      if (answer.project_id == test_id) console.log(answer.project_id)
      if (answer.project_id == test_id) console.log(answer.value)
    })
  }

}

function getMakerProject(data) {
  createMakerProjectAnswerLookup()

  let match
  makerProjects.forEach(project => {
    if (project.id == test_id) {
      console.log("Checking to see if project matches test_id: " + test_id)
      console.log("makerProjectAnswersLookup[project.id]: " + makerProjectAnswersLookup[project.id])
      console.dir(makerProjectAnswersLookup[project.id])
    }

    if (makerProjectAnswersLookup[project.id] && 
        makerProjectAnswersLookup[project.id].keys[getStringForComparison(data.organization_name)]) {
      if (project.id == test_id) {
        console.log("makerProjectAnswersLookup[project.id][data.organization_name]: " + makerProjectAnswersLookup[project.id].keys[data.organization_name])
        console.log("*** found a match!")
      }
      match = project
    }
  })
  return match
}

let makerImagesLookup

function getMakerImage(data) {

  // Create an object for quick lookup
  if (!makerImagesLookup) {
    makerImagesLookup = {}
    makerImages.forEach(image => {
      if (image.project_id == test_id) console.log("Adding an image index for test_id: " + test_id)

      if (!makerImagesLookup[image.project_id]) {
        makerImagesLookup[image.project_id] = {}
      }
      makerImagesLookup[image.project_id][image.type] = image
    })
    // console.log("makerImagesLookup[test_id]: ")
    // console.dir(makerImagesLookup[test_id])
  }

  // console.log("getMakerImage")
  // let project = getMakerProject(data)


  let project
  makerProjects.forEach(item => {
    //if (data.title.indexOf("1000 Mentors") >= 0 && item.name.indexOf("1,000 Mentors") >= 0) {
      // console.log("Comparing title and name for: " + test_id)
      // console.log("item.name.trim(): " + item.name.trim())
      // console.log("data.title.trim(): " + data.title.trim())
      // console.log("item.name.trim() == data.title.trim(): " + item.name.trim() == data.title.trim())
      // console.log(`item.name.toLowerCase().replace(/\,/g, "").trim() : ${item.name.toLowerCase().replace(/\,/g, "").trim()}`)
      // console.log(`data.title.toLowerCase().replace(/\,/g, "").trim(): ${data.title.toLowerCase().replace(/\,/g, "").trim()}`)
      // console.log('item.name.toLowerCase().replace(/\,/g, "").trim() == data.title.toLowerCase().replace(/\,/g, "").trim(): ' + 
      //   item.name.toLowerCase().replace(/\,/g, "").trim() == data.title.toLowerCase().replace(/\,/g, "").trim())
      // let comparison = getStringForComparison(item.name) ==
      //                  getStringForComparison(data.title)
      // console.log(`comparison = ${comparison}`)
    //}

    // const similarity = 3
    // let compare = subCompare(item.name, data.title, similarity)
    // if (compare.found === 1) { }
    //if (item.name.trim() == data.title.trim()) {
    let compareTitle = data.title

    if (getStringForComparison(item.name) == getStringForComparison(compareTitle)) {
      project = item
      // if (data.title.indexOf("1000 Mentors") >= 0 && item.name.indexOf("1,000 Mentors") >= 0) {
      //   console.log(`project`)
      //   console.dir(project)
      // }
    }
  })

  if (project && makerImagesLookup[project.id]) {
    return {
      image: makerImagesLookup[project.id]["ProjectPhoto"],
      video: makerImagesLookup[project.id]["ProjectVideo"]
    }
  } else {
    console.log("couldn’t find image data for project: " + data.title + " : " + data.year_submitted + " : " + data.category + " : " + data.organization_id)
    return {
      image: "http://maker.good.is/images/placeholder/idea.png"
    }
  }
}


const projectAnswers = [
  "title",
  "organization_name",
  "project_is_collaboration",
  "project_collaborators",
  "project_proposal_description",
  "project_areas",
  "project_proposal_mobilize",
  "project_proposal_best_place",
  "project_proposal_engage",
  "project_proposal_help",
  "project_proposal_impact", // For 2016
  "project_measure",
  "project_five_years",
  "category_metrics",
  "category_other",
  "category"
]

const projectAnswersToRemove = [
  "idea_and_impact",
  "use_resources",
  "resources_needed",
  "measure_success",
  "impact_metrics",
  "make_la_great",
  "Please describe the activation your organization seeks to launch.",
  "Describe in greater detail how your activation will make LA the best place?",
  "How will your activation engage Angelenos to make LA the best place",
  "Please explain how you will define and measure success for your activation.",
  "Where do you hope this activation or your organization will be in five years?"
]

const projectAnswersToRemove2013 = [
  "organization_name",
  "about_organization",
  "ein",
  "empty_column_1",
  "empty_column_2",
  "empty_column_3"
]

const projectAreas2015 = [
  "Central LA",
  "East LA",
  "San Gabriel Valley",
  "San Fernando Valley",
  "South LA",
  "Westside",
  "South Bay",
  "Antelope Valley",
  "County of Los Angeles (countywide)",
  "City of Los Angeles (citywide)",
  "LAUSD",
  'Other:'
]

const projectAreas2014 = [
  "CENTRAL LA",
  "EAST LA",
  "SOUTH LA",
  "SGV",
  "SFV",
  "SOUTH BAY",
  "WESTSIDE",
  "LA COUNTY",
  "OTHER"
]




function addMakerAnswers(data) {
  // Get a list of answers that match the current project ID

  createMakerProjectQuestionsLookup()
  if (!data.maker_answers) data.maker_answers = {}
  if (!data.maker_answers_list) data.maker_answers_list = []

  if (data.maker_answer_records && data.maker_answer_records.length > 0) {
    data.maker_answer_records.forEach(answer => {
      if (makerProjectQuestionsLookup[answer.fund_project_property_id]) {
        let question = makerProjectQuestionsLookup[answer.fund_project_property_id]

        // Skip sensitive data
        if (question.name == "your_name" ||
            question.name == "Name" ||
            question.name == "Your name" ||
            question.name == "email_address" ||
            question.name == "email" ||
            question.name == "Your email" ||
            question.name == "phone_number" ||
            question.name == "phone" ||
            question.name == "Your phone number" ||
            question.name == "heard_about_us") {
          return
        }

        data.maker_answers[question.name] = answer.value
        data.maker_answers_list.push({
          name: question.name,
          label: question.label,
          explanation: question.explanation,
          answer: answer.value
        })
      } else {
        console.log("couldn’t find maker question for answer.fund_project_property_id: " + answer.fund_project_property_id)
      }
    })
  }
}


function addProjectAnswers(data) {


  if (data.year_submitted == 2013) {

    // Remove unneeded answers
    projectAnswersToRemove2013.forEach(answerToRemove => {
      delete data[answerToRemove]
    })

    addMakerAnswers(data)
  }

  if (data.year_submitted == 2014) {
    let project_areas = []
    projectAreas2014.forEach(area => {
      if (data[area] == "1" && area != "OTHER") {
        project_areas.push(area)
      }
      delete data[area]
    })
    data.project_areas = project_areas

    addMakerAnswers(data)
  }

  if (data.year_submitted == 2015) {
    let project_areas = []
    projectAreas2015.forEach(area => {
      if (data[area] == "1" && area != "Other:") {
        project_areas.push(area.replace(" (citywide)", "").replace(" (countywide)", ""))
      }
      delete data[area]
    })
    data.project_areas = project_areas

    addMakerAnswers(data)
  }

  if (data.year_submitted == 2016 ||
      data.year_submitted == 2018) {

    // Find the project in markdownProjects that matches this data
      // If title is the same as one of the project titles

    let project
    // if (data.title == "`Activate So`uth Bay LA Trails!") {
    //   console.log("testing Activate South Bay LA Trails!")
    // }
    if (!data.category || !markdownProjectsLookup[data.year_submitted][data.category][getStringForComparison(data.title)]) {
      categories.forEach(category => {
        let candidate = markdownProjectsLookup[data.year_submitted][category][getStringForComparison(data.title)]
        if (candidate) {
          // if (data.title == "Activate South Bay LA Trails!") {
          //   console.log("candidate matched")
          // }
          project = candidate
        }
      })
    } else {
      project = markdownProjectsLookup[data.year_submitted][data.category][getStringForComparison(data.title)]
      // if (data.title.trim() == "Activate South Bay LA Trails!") {
      //   console.log("---***--**")
      //   console.dir(markdownProjectsLookup["2018"]["play"]["Activate South Bay LA Trails!"])
      //   console.log("**--***---")
      //   console.log(`data.year_submitted: ${data.year_submitted}`)
      //   console.log(`data.category: ${data.category}`)
      //   console.log(`data.title: ${data.title.trim()}`)
      //   console.log("category exists and project found: " + project)
      //   console.log(`here it is` + markdownProjectsLookup[data.year_submitted][data.category][data.title.trim()])
      //   console.log(markdownProjectsLookup[data.year_submitted])
      //   console.log(markdownProjectsLookup[data.year_submitted][data.category])
      //   console.log(markdownProjectsLookup[data.year_submitted][data.category][data.title.trim()])
      //   console.log("data.title.trim(): " + data.title.trim())
      //   console.dir(project)
      // }
    }

    if (project) {
      // if (data.title == "Activate South Bay LA Trails!") {
      //   console.log("project has a value")
      // }
      projectAnswers.forEach(answer => {
        // if (data.title == "Activate South Bay LA Trails!") {
        //   console.log(answer)
        // }
        // if (project[answer] && !data[answer]) {
        if (project[answer]) {
          data[answer] = project[answer]
        }
      })

      if (project["project_description"]) {
        data.project_summary = project["project_description"]
      }

      if (project["project_image"] && !data["project_image"]) {
        data["project_image"] = `https://activation.la2050.org/assets/images/${project.category}/2048-wide/${project.project_image}`
      }

      if (data.year_submitted == 2018 && project.uri) {
        data.challenge_url = `https://activation.la2050.org${project.uri}`
      }

      // Remove empty or redundant answers
      // projectAnswersToRemove.forEach(answerToRemove => {
      //   if (data[answerToRemove] == "") delete data[answerToRemove]
      //   projectAnswers.forEach(answer => {
      //     if (data[answerToRemove] == data[answer]) delete data[answerToRemove]
      //   })
      // })
    }

  }

}


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


let writtenPaths = {}
function createMarkdownFile(data) {


  // SHIM: Avoid showing "1" as content on the project page
  let propertiesWithLongTextValues = [ 
    "project_summary",
    "Whom will your project benefit? Please be specific."
  ]
  propertiesWithLongTextValues.forEach(prop => {
    if (data[prop] && data[prop] === "1") data[prop] = ""
  }) 

  // for (let prop in data) {
  //   if (data.hasOwnProperty(prop) && data[prop] && typeof(data[prop]) === "string" && data[prop] === "1") {
  //     data[prop] = ""
  //   }
  // }

  if (!data.title) {

    let found = false;
    for (let prop in data) {
      if (data.hasOwnProperty(prop) && prop != "year_submitted" && data[prop] && data[prop] != "" && data[prop] != "0") {
        found = true;
      }
    }

    // If this project has no data, stop here
    if (!found) {
      // console.log("Project has no data. Skipping…")
      return;
    }

    console.log("A title is missing")
    console.dir(data);

    data.title = "Project title, to be determined"
  }


  // console.log('createMarkdownFile for ' + data.title)
  let writePath = '../_projects/' + data.year_submitted

  let filename = stringToURI(data.title)

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


    let makerProject = getMakerProjectByName(data.title)
    if (makerProject) {
      createMakerProjectAnswerLookup()
      if (makerProject.id && makerProjectAnswersLookup[makerProject.id]) {
        // console.log("*** found maker answers")
        data.maker_answer_records = makerProjectAnswersLookup[makerProject.id].answers
        // console.log("data.maker_answer_records: ")
        // console.dir(data.maker_answer_records)
      }
    }


    if (!data.project_image || data.project_image == "" || data.project_image.includes(".html")) {
      // if (data.organization_name == "826LA") console.log("Looking for image for 826LA: " + data.year_submitted + " : " + data.title)
      let match = getMakerImage(data)
      if (match && match.image) {
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

        let size = tinyImagesLookup[match.video.youtube_video_identifier] ? `hqdefault.jpg` : `maxresdefault.jpg`

        data.project_image = `https://img.youtube.com/vi/${match.video.youtube_video_identifier}/${size}`

        // https://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api
        

        // data.project_image = `https://img.youtube.com/vi/${match.video.youtube_video_identifier}/maxresdefault.jpg`

        data.project_video = `https://www.youtube.com/embed/${match.video.youtube_video_identifier}`

        data.youtube_video_identifier = match.video.youtube_video_identifier
        // console.log(data.project_image)
      }
    } else {
      console.log("image already present: " + data.organization_name + " : " + data.project_image)
    }
  }

  addProjectAnswers(data)

  data.body_class = category_colors[data.category] || "strawberry"

  for (let prop in data) {
    if (data[prop] === '0') data[prop] = ''
  }

  // if (data.project_image.includes("Obama_kids_jobs.jpg")) {
  //   console.log("checking for missing image Obama_kids_jobs.jpg")
  //   console.log(`data.project_image: ${data.project_image}`)
  //   console.log(`missingImagesLookup[data.project_image]: ${missingImagesLookup[data.project_image]}`)
  // }
  if (missingImagesLookup[data.project_image]) {
    data.project_image = "http://maker.good.is/images/placeholder/idea.png"
  }

  if ((!data.project_id || data.project_id == "")) {
    if (data.project_id_2 && data.project_id_2 != "") {
      data.project_id = data.project_id_2
    } else if (data.project_id_3 && data.project_id_3 != "") {
      data.project_id = data.project_id_3
    }
  }

  // const answersToReplace = {
  //   "project_summary": "one_sentence_project"
  // }

  // delete data.project_id_2
  // delete data.project_id_3
  delete data.maker_answer_records
  if (data.maker_answers) {
    // delete data.maker_answers.your_name
    // delete data.maker_answers.email_address
    // delete data.maker_answers.phone_number
    // delete data.maker_answers.heard_about_us




    if (data.maker_answers.one_sentence_project && data.maker_answers.one_sentence_project != "") {
      data.project_summary = data.maker_answers.one_sentence_project
    } else if (data.maker_answers.describe_idea && data.maker_answers.describe_idea != "") {
      data.project_summary = data.maker_answers.describe_idea
    } else if (data.maker_answers["In one to three sentences, please describe your proposal."] &&
               data.maker_answers["In one to three sentences, please describe your proposal."] != "") {
      data.project_summary = data.maker_answers["In one to three sentences, please describe your proposal."]
    } else if (data.maker_answers.description1 &&
               data.maker_answers.description1 != "") {
      data.project_summary = data.maker_answers.description1
    }

    if (data.maker_answers["Organization(s) name(s)"] && data.maker_answers["Organization(s) name(s)"] != "") {
      data.organization_name = data.maker_answers["Organization(s) name(s)"]
    }


    // for (let prop in answersToReplace) {
    //   if (answersToReplace.hasOwnProperty(prop)) {
    //     let from = prop
    //     let to   = answersToReplace[prop]
    //     if (data[from] && data.maker_answers[to]) {
    //       data[from] = data.maker_answers[to]
    //       // delete data.maker_answers[to]
    //     }
    //   }
    // }
  }

  // if (!getOrganizationByProjectID(data.project_id)) {
  //   data.has_no_organization_match_by_project_id = 1
  // }

  // console.dir(data)

  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
`---
${yaml.safeDump(data)}
---
`

  if (data.project_id == "") {
    writePath = '../_projects_without_project_id'
  } else if (data.organization_id == "") {
    writePath = '../_projects_without_organization_id'
  }

  let fullPathToWrite = writePath + '/' +  filename
  if (writtenPaths[fullPathToWrite]) {
    fullPathToWrite = fullPathToWrite + "__" + writtenPaths[fullPathToWrite]
    writtenPaths[fullPathToWrite]++
  } else {
    writtenPaths[fullPathToWrite] = 1
  }

  mkdirp(writePath, function (err) {
    if (err) {
      console.error(err)
    } else {
      fs.writeFileSync(fullPathToWrite + '.md', output, 'utf8', (err) => {
        if (err) {
          console.log(err)
        }
      })
    }
  })
}

/*
let organizationByProjectIDLookup
function getOrganizationByProjectID(project_id) {
  if (!organizationByProjectIDLookup) {
    organizationByProjectIDLookup = {}

    organizations.forEach(organization => {
      projects.forEach(project => {
        let match

        organization.original_project_ids.forEach(project_id => {
          if (project.project_id == project_id) {
            match = organization
          }
        })

        organization.extrapolated_project_ids.forEach(project_id => {
          if (project.project_id == project_id) {
            match = organization
          }
        })

        // organization.aggregated.project_ids.forEach(project_id => {
        //   if (project.project_id == project_id) {
        //     match = organization
        //   }
        // })

        if (project.project_id == organization.project_ids) {
          match = organization
        }

        if (match) {
          organizationByProjectIDLookup[project.project_id] = match
        }
      })
    })
  }

  return organizationByProjectIDLookup[project_id]
}
*/

let orderCursors = {
  learn   : 0,
  create  : 0,
  play    : 0,
  connect : 0,
  live    : 0
}

function fixDataCharactersInString(string) {
  string = string
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
  return string
}

function fixDataCharacters(data) {
  for (let prop in data) {
    if (typeof(data[prop]) === 'string') {
      data[prop] = fixDataCharactersInString(data[prop])
    }
  }

  return data;
}

// function generateCollections(file_name, category) {

//   console.log('generateCollections: ' + file_name)

//   let input = fs.readFileSync('./_spreadsheets/' + file_name, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
//   let records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

//   for (let index = 0; index < records.length; index++) {
//     let data = fixDataCharacters(records[index])
//     createMarkdownFile(data, category)
//   }
//   return records
// }

const categories = ["learn", "create", "play", "connect", "live"]
const category_colors = {
  learn   : "blueberry",
  create  : "banana",
  play    : "strawberry",
  connect : "tangerine",
  live    : "lime"
}

function generateAllCollections(file_name, year) {

  console.log('generateCollections: ' + file_name)

  let input = fs.readFileSync('../_spreadsheets/' + file_name, 'utf8'); // https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
  let records = parse(input, {columns: true}); // http://csv.adaltas.com/parse/examples/#using-the-synchronous-api

  for (let index = 0; index < records.length; index++) {
    let data = fixDataCharacters(records[index])

    if (data.title.toLowerCase().includes("tickleberry") && data.year_submitted == "2014") {
      data.title = "Tickleberry Place Indoor Play Gym"
    }

    let category
    if (records[index].category) {
      records[index].category = records[index].category.toLowerCase()
    }

    if (!records[index].year_submitted) records[index].year_submitted = year

    records[index].year_submitted = Number(records[index].year_submitted)

    // records[index].project_image = records[index].project_image.split("/")[records[index].project_image.split("/").length - 1]

    createMarkdownFile(records[index])
  }
  return records
}





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


/*
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
*/


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






let maker_projects          = 'maker-projects.csv'
let maker_user_media        = 'maker-user-media.csv'
let maker_project_answers   = 'maker-project-properties.csv'
let maker_project_questions = 'maker-fund-project-properties.csv'


let makerProjectQuestionsInput = fs.readFileSync('data/' + maker_project_questions, 'utf8')
let makerProjectQuestions      = parse(makerProjectQuestionsInput, {columns: true})


let makerProjectAnswersInput = fs.readFileSync('data/' + maker_project_answers, 'utf8')
let makerProjectAnswers      = parse(makerProjectAnswersInput, {columns: true})


let makerUserMediaInput = fs.readFileSync('data/' + maker_user_media, 'utf8')
let makerImages         = parse(makerUserMediaInput, {columns: true})


let makerProjectInput = fs.readFileSync('data/' + maker_projects, 'utf8')
let makerProjects     = parse(makerProjectInput, {columns: true})


// Create an object for quick lookup
let markdownProjectsLookup = {}

function createLookup(year) {

  // Load the markdown files
  let records = {}
  categories.forEach(category => {
    let next = getRecords(`data/projects-${year}-markdown/_${category}`)
    records[category] = next
  })

  markdownProjectsLookup[year] = {}
  categories.forEach(category => {
    if (!markdownProjectsLookup[year][category]) {
      markdownProjectsLookup[year][category] = {}
    }
    records[category].forEach(project => {
      if (project.title == "Activate South Bay LA Trails!") {
        // console.dir(project)
      }
      if (!markdownProjectsLookup[year][category][getStringForComparison(project.title)]) {
        markdownProjectsLookup[year][category][getStringForComparison(project.title)] = project
      }
    })
  })

}

createLookup(2016)
createLookup(2018)

// console.log("********/*")
// console.dir(markdownProjectsLookup["2018"]["play"]["Activate South Bay LA Trails!"])
// console.log("********//*")




generateAllCollections('projects-2018.csv', 2018)
generateAllCollections('projects-2016.csv', 2016)
generateAllCollections('projects-2015.csv', 2015)
generateAllCollections('projects-2014.csv', 2014)
generateAllCollections('projects-2013.csv', 2013)





