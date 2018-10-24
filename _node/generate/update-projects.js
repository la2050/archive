
'use strict'

let fs = require('fs')
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

function getStringForComparison(string) {
  string = fixDataCharactersInString(string)
  string = string.toLowerCase().replace(/\,/g, "").replace(/\\\r\\\n/g, "").replace(/\\\r/g, "").replace(/\\\n/g, "").trim()
  string = (stringToURI(string).replace(/\-/g, ""))
  // if (string.indexOf("A house for Tommy in my backyard!") >= 0) {
  //   console.log("BEFORE")
  //   console.log(string)
  //   console.log("AFTER")
  //   console.log(string.toLowerCase().replace(/\,/g, "").replace(/\\\r\\\n/g, "").replace(/\\\r/g, "").replace(/\\\n/g, "").trim())
  //   return "A house for Tommy in my backyard! If only LA knew the opportunity that lies in our backyards…"
  // }

  return string
}


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


// const attributes = [
//   'published',
//   'organization_id',
//   'year_submitted',
//   'category',
//   'body_class',
//   'project_id',
//   'challenge_url',
//   'title',
//   'project_summary',
//   'project_image',
//   'project_video',
//   'project_areas',
//   'youtube_video_identifier',
//   'maker_image_id',
//   'maker_image_file_name',
//   'maker_answers',
//   'maker_answers_list',

//   // 2013
//   'What is your idea and how will it impact your indicator?',
//   'What are some of your organization’s most important achievements to date?',
//   'Please explain how you will evaluate your project. How will you measure success?',
//   'How will your project benefit Los Angeles? Please be specific.',
//   'What would success look like in the year 2050 regarding your indicator?',

//   // 2014
//   'Which area(s) of LA does your project benefit? Other (elaborate)',
//   'What is your idea/project in more detail?',
//   'What will you do to implement this idea/project?',
//   'How will your idea/project help make LA the best place to connect today? In LA2050?',
//   'Whom will your project benefit? Please be specific.',
//   'empty_column_1',

//   // 2015
//   'areas_impacted',
//   'partners',
//   'Please specify below',
//   'Describe in greater detail how you will make LA the best place to connect',
//   'Please list at least one major barrier/challenge you anticipate. What is your strategy for overcoming these obstacles?',
//   'Please explain how you will evaluate your work.',
//   'Are there other organizations doing similar work (whether complementary or competitive)? What is unique about your proposed approach?',
//   'Please identify any partners or collaborators who will work with you on this project. How much of the $100,000 grant award will each partner receive?',
//   'How much do you think this will cost? If more than $100,000 – how will you cover the additional costs?',
//   'Please include a detailed budget of how you will use $100,000 to implement this project.',
//   'How do you plan to scale the success of your proposal?',

//   // 2016
//   'organization_website',
//   'ein',
//   'project_image_2',
//   'organization_name_2',
//   'organization_activity',
//   'project_is_collaboration',
//   'project_collaborators',
//   'project_measure',
//   'project_proposal_help',
//   'project_description',
//   'project_impact',
//   'project_proposal_best_place',
//   'project_proposal_description',
//   'project_proposal_impact',

//    // 2018
//    'project_id_2'
// ]



const attributes = [
 'published',
 'organization_id',
 'year_submitted',
 'category',
 'indicator',
 'body_class',
 'project_id',
 'challenge_url',
 'title',
 'project_summary',
 'project_image',
 'project_video',

 'project_is_collaboration',
 'project_collaborators',
 'project_measure',
 'project_proposal_help',
 'project_description',
 'project_impact',
 'project_proposal_impact',

 'impact_metrics',
 'make_la_great',
 'project_proposal_description',
 'project_areas',
 'project_proposal_mobilize',
 'project_proposal_best_place',
 'project_proposal_engage',
 'project_five_years',
 'category_metrics',
 'category_other',

 'maker_answers',


// '2013': 
 'What is your idea and how will it impact your indicator?',
 'What are some of your organization’s most important achievements to date?',
 'Please identify any partners or collaborators who will work with you on this project.',
 'Please explain how you will evaluate your project. How will you measure success?',
 'How will your project benefit Los Angeles? Please be specific.',
 'What would success look like in the year 2050 regarding your indicator?',

// '2014': 
 'Which area(s) of LA does your project benefit? Other (elaborate)',
 'What is your idea/project in more detail?',
 'What will you do to implement this idea/project?',
 'How will your idea/project help make LA the best place to connect today? In LA2050?',
 'Whom will your project benefit? Please be specific.',

// '2015': 
 'areas_impacted',
 'partners',
 'Please specify below',
 'Describe in greater detail how you will make LA the best place to connect:',
 'Please list at least one major barrier/challenge you anticipate. What is your strategy for overcoming these obstacles?',
 'Please explain how you will evaluate your work.',
 'Are there other organizations doing similar work (whether complementary or competitive)? What is unique about your proposed approach?',
 'Please identify any partners or collaborators who will work with you on this project. How much of the $100,000 grant award will each partner receive?',
 'How much do you think this will cost? If more than $100,000 – how will you cover the additional costs?',
 'Please include a detailed budget of how you will use $100,000 to implement this project.',
 'How do you plan to scale the success of your proposal?',

// '2016': 

// '2018': 
 'Please describe the activation your organization seeks to launch.',
 'Describe in greater detail how your activation will make LA the best place?',
 'How will your activation engage Angelenos to make LA the best place',
 'Please explain how you will define and measure success for your activation.',
 'Where do you hope this activation or your organization will be in five years?',


 'cached_project_image',


 'project_id_2',
 'project_id_3',
 'project_image_2',
 'empty_column_1',
 'youtube_video_identifier',
 'maker_answers_list',
 'maker_image_id',
 'maker_image_file_name',
 'organization_name',
 'organization_website',
 'organization_name_2',
 'organization_activity',
 'ein'
]


const attributesToRemove = [
 'project_id_2',
 'project_id_3',
 'project_image_2',
 'empty_column_1',
 //'youtube_video_identifier',
 'maker_answers_list',
 //'maker_image_id',
 //'maker_image_file_name',
 //'organization_name',
 //'organization_website',
 'organization_name_2',
 'organization_activity',
 'ein'
]



let uniqueAttributes = {}


function saveMarkdown(filename, data) {
  // console.log('filename')
  // console.log(filename)

  // console.dir(data)

  attributesToRemove.forEach(name => {
    delete data.yaml[name]
  })

  let options = {}

  options.sortKeys = (a, b) => {
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
  }

  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output =
`---
${yaml.safeDump(data.yaml, options)}
---${data.content}`


//console.log(output)
//return

  fs.writeFileSync(filename, output, 'utf8', (err) => {
    if (err) {
      console.log(err)
    }
  })
}


const projectAreas2014 = [
  "area_centralLA", 
  "area_eastLA", 
  "area_southLA", 
  "area_sangabrielvalley", 
  "area_sanfernandovalley", 
  "area_southbay", 
  "area_westside", 
  "area_other", 
  "area_other_blank"
]


const projectAreas2014Labels = {
  "area_centralLA"        : "Central LA", 
  "area_eastLA"           : "East LA", 
  "area_southLA"          : "South LA", 
  "area_sangabrielvalley" : "San Gabriel Valley", 
  "area_sanfernandovalley": "San Fernando Valley", 
  "area_southbay"         : "South Bay", 
  "area_westside"         : "Westside"
}


const improveMetrics2014 = {
  "learn": {
    list: [
      "Percentage of children enrolled in early education programs",
      "Percentage of community college students completing a certificate, degree, or transfer-related program in six years",
      "Youth unemployment and underemployment",
      "District-wide graduation rates",
      "HS student proficiency in English & Language Arts and Math",
      "Academic Performance Index scores",
      "College matriculation rates",
      "Student education pipeline (an integrated network of pre-schools, K-12 institutions, and higher education systems that prepares students for seamless transitions between high school, higher education institutions, and the workforce) (Dream Metric)",
      "Suspension and expulsion rates (Dream Metric)",
      "Truancy rates in elementary and middle school (Dream Metric)",
      "Students perceived sense of safety at and on the way to school (Dream Metric)"
    ],
    map: {
      "Percentage of children enrolled in early education programs": "metrics_learn_earlyeducation",
      "Percentage of community college students completing a certificate, degree, or transfer-related program in six years": "metrics_learn_communitycollege",
      "Youth unemployment and underemployment": "metrics_learn_unemployment",
      "District-wide graduation rates": "metrics_learn_graduationrates",
      "HS student proficiency in English & Language Arts and Math": "metrics_learn_proficiency",
      "Academic Performance Index scores": "metrics_learn_api",
      "College matriculation rates": "metrics_learn_college",
      "Student education pipeline (an integrated network of pre-schools, K-12 institutions, and higher education systems that prepares students for seamless transitions between high school, higher education institutions, and the workforce) (Dream Metric)": "metrics_learn_pipeline",
      "Suspension and expulsion rates (Dream Metric)": "metrics_learn_suspension",
      "Truancy rates in elementary and middle school (Dream Metric)": "metrics_learn_truancy",
      "Students perceived sense of safety at and on the way to school (Dream Metric)": "metrics_learn_safety"
    }
  },
  "create": {
    list: [
      "Employment in creative industries",
      "Arts establishments per capita",
      "Concentration of manufacturing activity in LA",
      "Federal research grant funding",
      "Patents per capita",
      "Jobs per capita",
      "Minority- and women-owned firms",
      "Gini coefficient",
      "Number of high-growth startups",
      "Venture capital investment",
      "Measures of cultural and global economic influence (“soft power”) (Dream Metric)",
      "Recruiting and retention rates at local higher education institutions (Dream Metric)",
      "Percentage of graduates from local higher education institutions that remain in LA County 5 years after graduating (Dream Metric)",
      "Unemployment rates (and opportunities) for the formerly incarcerated (Dream Metric)"
    ],
    map: {
      "Employment in creative industries": "metrics_create_employment",
      "Arts establishments per capita": "metrics_create_arts",
      "Concentration of manufacturing activity in LA": "metrics_create_manufacturing",
      "Federal research grant funding": "metrics_create_researchgrant",
      "Patents per capita": "metrics_create_patents",
      "Jobs per capita": "metrics_create_jbs",
      "Minority- and women-owned firms": "metrics_create_minoritywomenowned",
      "Gini coefficient": "metrics_create_gini",
      "Number of high-growth startups": "metrics_create_startups",
      "Venture capital investment": "metrics_create_venturecapital",
      "Measures of cultural and global economic influence (“soft power”) (Dream Metric)": "metrics_create_influencers",
      "Recruiting and retention rates at local higher education institutions (Dream Metric)": "metrics_create_recruitingrates",
      "Percentage of graduates from local higher education institutions that remain in LA County 5 years after graduating (Dream Metric)": "metrics_create_graduates",
      "Unemployment rates (and opportunities) for the formerly incarcerated (Dream Metric)": "metrics_create_unemployment"
    }
  },
  "play": {
    list: [
      "Access to open space and park facilities",
      "Number of children enrolled in afterschool programs",
      "Per capita crime rates",
      "Percentage of residents that feel safe in their neighborhoods",
      "Attendance at major league sporting events",
      "Residents within 1⁄4 mile of a park (Dream Metric)",
      "Number of residents with easy access to a “vibrant” park (Dream Metric)",
      "Number of parks with intergenerational play opportunities (Dream Metric)",
      "Number (and quality) of informal spaces for play (Dream Metric)"
    ],
    map: {
      "Access to open space and park facilities": "metrics_play_openspace",
      "Number of children enrolled in afterschool programs": "metrics_play_afterschool",
      "Per capita crime rates": "metrics_play_crime",
      "Percentage of residents that feel safe in their neighborhoods": "metrics_play_safe",
      "Attendance at major league sporting events": "metrics_play_sportingevents",
      "Residents within 1⁄4 mile of a park (Dream Metric)": "metrics_play_park",
      "Number of residents with easy access to a “vibrant” park (Dream Metric)": "metrics_play_vibrantpark",
      "Number of parks with intergenerational play opportunities (Dream Metric)": "metrics_play_intergenerational",
      "Number (and quality) of informal spaces for play (Dream Metric)": "metrics_play_informal"
    }
  },
  "connect": {
    list: [
      "Rates of volunteerism",
      "Voting rates by race",
      "Adults getting sufficient social & emotional support",
      "Median travel time to work",
      "Attendance at cultural events",
      "Number of public transit riders",
      "Participation in neighborhood councils",
      "Percentage of Angelenos that volunteer informally (Dream Metric)",
      "Government responsiveness to residents’ needs (Dream Metric)",
      "Transit-accessible housing and employment (the share of housing units and percentage of jobs that are located within a half-mile of transit) (Dream Metric)",
      "Total number of social media friends (Dream Metric)",
      "Attendance at public/open street gatherings (Dream Metric)",
      "Residential segregation (Dream Metric)",
      "Access to free wifi (Dream Metric)"
    ],
    map: {
      "Rates of volunteerism": "metrics_connect_volunteerism",
      "Voting rates by race": "metrics_connect_voting",
      "Adults getting sufficient social & emotional support": "metrics_connect_adultsupport",
      "Median travel time to work": "metrics_connect_traveltime",
      "Attendance at cultural events": "metrics_connect_culturalevents",
      "Number of public transit riders": "metrics_connect_publictransit",
      "Participation in neighborhood councils": "metrics_connect_neighborhoodcouncils",
      "Percentage of Angelenos that volunteer informally (Dream Metric)": "metrics_connect_volunteer",
      "Government responsiveness to residents’ needs (Dream Metric)": "metrics_connect_govresponsiveness",
      "Transit-accessible housing and employment (the share of housing units and percentage of jobs that are located within a half-mile of transit) (Dream Metric)": "metrics_connect_transitaccessible",
      "Total number of social media friends (Dream Metric)": "metrics_connect_socialmedia",
      "Attendance at public/open street gatherings (Dream Metric)": "metrics_connect_attendance",
      "Residential segregation (Dream Metric)": "metrics_connect_residential segregation",
      "Access to free wifi (Dream Metric)": "metrics_connect_wifi"
    }
  },
  "live": {
    list: [
      "Access to healthy food",
      "Healthcare access",
      "Exposure to air toxins",
      "Number of households below the self-sufficiency standard",
      "Percent of imported water",
      "Obesity rates",
      "Rates of homelessness",
      "Walk/bike/transit score",
      "Acres and miles of polluted waterways",
      "Rates of mental illnesses",
      "Prevalence of adverse childhood experience (Dream Metric)",
      "Percentage of LA communities that are resilient (Dream Metric)",
      "Percentage of residents receiving coordinated healthcare services (Dream Metric)",
      "Percentage of tree canopy cover (Dream Metric)"
    ],
    map: {
      "Access to healthy food": "metrics_live_healthyfood",
      "Healthcare access": "metrics_live_healthcare",
      "Exposure to air toxins": "metrics_live_airtoxins",
      "Number of households below the self-sufficiency standard": "metrics_live_selfsufficiency",
      "Percent of imported water": "metrics_live_importedwater",
      "Obesity rates": "metrics_live_obesity",
      "Rates of homelessness": "metrics_live_homelessness",
      "Walk/bike/transit score": "metrics_live_walkscore",
      "Acres and miles of polluted waterways": "metrics_live_pollutedwaterways",
      "Rates of mental illnesses": "metrics_live_mentalillness",
      "Prevalence of adverse childhood experience (Dream Metric)": "metrics_live_childhood",
      "Percentage of LA communities that are resilient (Dream Metric)": "metrics_live_communities",
      "Percentage of residents receiving coordinated healthcare services (Dream Metric)": "metrics_live_healthcareservice",
      "Percentage of tree canopy cover (Dream Metric)": "metrics_live_treecanopy"
    }
  }
}


const projectAreas2015 = [
  "Where will you be working? Central LA",
  "Where will you be working? East LA",
  "Where will you be working? San Gabriel Valley",
  "Where will you be working? San Fernando Valley",
  "Where will you be working? South LA",
  "Where will you be working? Westside",
  "Where will you be working? South Bay",
  "Where will you be working? Antelope Valley",
  "Where will you be working? County of Los Angeles",
  "Where will you be working? City of Los Angeles",
  "Where will you be working? LAUSD",
  "Where will you be working? Other",
  "Where will you be working? Specifics"
]


const useResources2015 = [
  "How do you plan to use these resources to make change? Conduct research",
  "How do you plan to use these resources to make change? Engage residents and stakeholders",
  "How do you plan to use these resources to make change? Implement a pilot or new project",
  "How do you plan to use these resources to make change? Expand a pilot or a program",
  "How do you plan to use these resources to make change? Mobilize for systems change",
  "How do you plan to use these resources to make change? Advocate with policymakers and leaders",
  "How do you plan to use these resources to make change? Implement and track policy",
  "How do you plan to use these resources to make change? Other",
  "How do you plan to use these resources to make change? Specifics"
]


const helpFromCommunity2015 = [
  "How can the LA2050 community and other stakeholders help your proposal succeed? Money (financial capital)",
  "How can the LA2050 community and other stakeholders help your proposal succeed? Volunteers/staff (human capital)",
  "How can the LA2050 community and other stakeholders help your proposal succeed? Publicity/awareness (social capital)",
  "How can the LA2050 community and other stakeholders help your proposal succeed? Infrastructure (building/space/vehicles, etc.)",
  "How can the LA2050 community and other stakeholders help your proposal succeed? Education/training",
  "How can the LA2050 community and other stakeholders help your proposal succeed? Technical infrastructure (computers, etc.)",
  "How can the LA2050 community and other stakeholders help your proposal succeed? Community outreach",
  "How can the LA2050 community and other stakeholders help your proposal succeed? Network/relationship support",
  "How can the LA2050 community and other stakeholders help your proposal succeed? Quality improvement research",
  "How can the LA2050 community and other stakeholders help your proposal succeed? Other",
  "How can the LA2050 community and other stakeholders help your proposal succeed? Specific"
]


const improveMetrics2015 = [
  "How will your proposal improve the following “Create” metrics? Employment in the creative industries",
  "How will your proposal improve the following “Create” metrics? Arts establishments per capita",
  "How will your proposal improve the following “Create” metrics? Concentration of manufacturing activity in LA",
  "How will your proposal improve the following “Create” metrics? Federal research grant funding",
  "How will your proposal improve the following “Create” metrics? Patents per capital",
  "How will your proposal improve the following “Create” metrics? Jobs per capita",
  "How will your proposal improve the following “Create” metrics? Minority- and women-owned firms",
  "How will your proposal improve the following “Create” metrics? Gini coefficient",
  "How will your proposal improve the following “Create” metrics? Number of high growth startups",
  "How will your proposal improve the following “Create” metrics? Venture capital investment",
  "How will your proposal improve the following “Create” metrics? Measures of cultural and global economic influence (“soft power”) (Dream Metric)",
  "How will your proposal improve the following “Create” metrics? Recruiting and retention rates for local higher education institutions (Dream Metric)",
  "How will your proposal improve the following “Create” metrics? Percentage of graduates from local higher education institutions that remain in LA County 5 years after graduating (Dream Metric)",
  "How will your proposal improve the following “Create” metrics? Unemployment rates (and opportunities) for the formerly incarcerated (Dream Metric)",

  "How will your proposal improve the following “Play” metrics? Access to open space and park facilities",
  "How will your proposal improve the following “Play” metrics? Number of children enrolled in afterschool programs",
  "How will your proposal improve the following “Play” metrics? Per capita crime rates",
  "How will your proposal improve the following “Play” metrics? Percentage of residents that feel safe in their neighborhoods",
  "How will your proposal improve the following “Play” metrics? Attendance at major league sporting events",
  "How will your proposal improve the following “Play” metrics? Residents within 1⁄4 mile of a park (Dream Metric)",
  "How will your proposal improve the following “Play” metrics? Number of residents with easy access to a “vibrant” park (Dream Metric)",
  "How will your proposal improve the following “Play” metrics? Number of parks with intergenerational play opportunities (Dream Metric)",
  "How will your proposal improve the following “Play” metrics? Number (and quality) of informal spaces for play (Dream Metric)",

  "How will your proposal improve the following “Learn” metrics? Percentage of children enrolled in early education programs",
  "How will your proposal improve the following “Learn” metrics? Percent of community college students completing a certificate, degree, or transfer-related program in six years",
  "How will your proposal improve the following “Learn” metrics? Youth unemployment and underemployment",
  "How will your proposal improve the following “Learn” metrics?  District-wide graduation rates",
  "How will your proposal improve the following “Learn” metrics?  District-wide graduation ratesHS student proficiency in English & Language Arts and Math",
  "How will your proposal improve the following “Learn” metrics?  District-wide graduation ratesAcademic Performance Index* scores",
  "How will your proposal improve the following “Learn” metrics?  District-wide graduation ratesCollege matriculation rates",
  "How will your proposal improve the following “Learn” metrics?  Student education pipeline (an integrated network of pre-schools, K-12 institutions, and higher education systems that prepares students for seamless transitions between high school, higher ed",
  "How will your proposal improve the following “Learn” metrics? Suspension and expulsion rates (Dream Metric)",
  "How will your proposal improve the following “Learn” metrics? Truancy rates in elementary and middle schools (Dream Metric)",
  "How will your proposal improve the following “Learn” metrics? Students perceived sense of safety at and on the way to school (Dream Metric)",

  "How will your proposal improve the following “Live” metrics?  Access to healthy food",
  "HOW WILL YOUR PROPOSAL IMPROVE THE FOLLOWING “LIVE” METRICS? Healthcare access",
  "How will your proposal improve the following “Live” metrics? Exposure to air toxins",
  "How will your proposal improve the following “Live” metrics? Number of households below the self-sufficiency index",
  "HOW WILL YOUR PROPOSAL IMPROVE THE FOLLOWING “LIVE” METRICS? Percent of imported water",
  "HOW WILL YOUR PROPOSAL IMPROVE THE FOLLOWING “LIVE” METRICS? Obesity rates",
  "HOW WILL YOUR PROPOSAL IMPROVE THE FOLLOWING “LIVE” METRICS? Housing affordability",
  "HOW WILL YOUR PROPOSAL IMPROVE THE FOLLOWING “LIVE” METRICS? Rates of homelessness",
  "HOW WILL YOUR PROPOSAL IMPROVE THE FOLLOWING “LIVE” METRICS? Walk/bike/transit score",
  "HOW WILL YOUR PROPOSAL IMPROVE THE FOLLOWING “LIVE” METRICS? Acres and miles of polluted waterways",
  "HOW WILL YOUR PROPOSAL IMPROVE THE FOLLOWING “LIVE” METRICS? Rates of mental illness",
  "HOW WILL YOUR PROPOSAL IMPROVE THE FOLLOWING “LIVE” METRICS? Prevalence of adverse childhood experiences (Dream Metric)",
  "HOW WILL YOUR PROPOSAL IMPROVE THE FOLLOWING “LIVE” METRICS? Percentage of LA communities that are resilient (Dream Metric)",
  "HOW WILL YOUR PROPOSAL IMPROVE THE FOLLOWING “LIVE” METRICS? Percentage of residents receiving coordinated healthcare services (Dream Metric)",
  "HOW WILL YOUR PROPOSAL IMPROVE THE FOLLOWING “LIVE” METRICS? Percentage of tree canopy cover (Dream Metric)",

  "How will your proposal improve the following “Connect” metrics? Rates of volunteerism",
  "How will your proposal improve the following “Connect” metrics? Voting rates by race",
  "How will your proposal improve the following “Connect” metrics? Adults getting sufficient social & emotional support",
  "How will your proposal improve the following “Connect” metrics? Median travel time to work",
  "How will your proposal improve the following “Connect” metrics? Attendance at cultural events",
  "How will your proposal improve the following “Connect” metrics? Number of public transit riders",
  "How will your proposal improve the following “Connect” metrics? Participation in neighborhood councils",
  "How will your proposal improve the following “Connect” metrics? Percentage of Angelenos that volunteer informally (Dream Metric)",
  "How will your proposal improve the following “Connect” metrics?  Government responsiveness to residents’ needs (Dream Metric)",
  "How will your proposal improve the following “Connect” metrics? Transit-accessible housing and employment (the share of housing units and percentage of jobs that are located near transit)",
  "How will your proposal improve the following “Connect” metrics? Total number of local social media friends and connections (Dream Metric)",
  "How will your proposal improve the following “Connect” metrics? Attendance at public/open streets gatherings (Dream Metric)",
  "How will your proposal improve the following “Connect” metrics? Residential segregation (Dream Metric)",
  "How will your proposal improve the following “Connect” metrics? Access to free wifi (Dream Metric)"
]


const categories = ["learn", "create", "play", "connect", "live"]
const category_colors = {
  learn   : "blueberry",
  create  : "banana",
  play    : "strawberry",
  connect : "tangerine",
  live    : "lime"
}


let updateCount = 0
function processFile(filename) {

  // Load the contents of the file
  let data = loadMarkdown(filename)
  if (!data) return

  if (!data.yaml.published) return

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

  // const projectAreas2015 = [
  //   "Central LA",
  //   "East LA",
  //   "San Gabriel Valley",
  //   "San Fernando Valley",
  //   "South LA",
  //   "Westside",
  //   "South Bay",
  //   "Antelope Valley",
  //   "County of Los Angeles (countywide)",
  //   "City of Los Angeles (citywide)",
  //   "LAUSD",
  //   'Other:'
  // ]




  /*
  if (data.yaml.year_submitted == 2015) {
    let project_areas = []
    projectAreas2015.forEach(area => {
      // console.log(area)
      if (data.yaml.maker_answers[area] == "1" && area != "Where will you be working? Other") {
        project_areas.push(area.replace("Where will you be working? ", ""))
        // console.log(area.replace("Where will you be working? ", ""))
      } else if (area == "Where will you be working? Specifics" && data.yaml.maker_answers[area] != "") {
        project_areas.push(data.yaml.maker_answers[area])
        // console.log(data.yaml.maker_answers[area])
      }
      // delete data[area]
    })
    // console.log("project_areas")
    // console.dir(project_areas)
    data.yaml.maker_answers["Where will you be working?"] = project_areas


    let how_use_resources = []
    useResources2015.forEach(area => {
      // console.log(area)
      if (data.yaml.maker_answers[area] == "1" && area != "How do you plan to use these resources to make change? Other") {
        how_use_resources.push(area.replace("How do you plan to use these resources to make change? ", ""))
        // console.log(area.replace("Where will you be working? ", ""))
      } else if (area == "How do you plan to use these resources to make change? Specifics" && data.yaml.maker_answers[area] != "") {
        how_use_resources.push(data.yaml.maker_answers[area])
        // console.log(data.yaml.maker_answers[area])
      }
      // delete data[area]
    })
    // console.log("project_areas")
    // console.dir(project_areas)
    data.yaml.maker_answers["How do you plan to use these resources to make change?"] = how_use_resources


    let help_from_community = []
    helpFromCommunity2015.forEach(area => {
      // console.log(area)
      if (data.yaml.maker_answers[area] == "1" && area != "How can the LA2050 community and other stakeholders help your proposal succeed? Other") {
        help_from_community.push(area.replace("How can the LA2050 community and other stakeholders help your proposal succeed? ", ""))
        // console.log(area.replace("Where will you be working? ", ""))
      } else if (area == "How can the LA2050 community and other stakeholders help your proposal succeed? Specifics" && data.yaml.maker_answers[area] != "") {
        help_from_community.push(data.yaml.maker_answers[area])
        // console.log(data.yaml.maker_answers[area])
      }
      // delete data[area]
    })
    // console.log("project_areas")
    // console.dir(project_areas)
    data.yaml.maker_answers["How can the LA2050 community and other stakeholders help your proposal succeed?"] = help_from_community




    // delete data.yaml.maker_answers["How will your proposal improve the following “Create” metrics? "]
    let improve_metrics = {}
    categories.forEach(category => {
      improve_metrics[category] = []

      // https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript#1026087
      let categoryCapitalized = category.charAt(0).toUpperCase() + category.slice(1);
      let question = `How will your proposal improve the following “${categoryCapitalized}” metrics?`

      improveMetrics2015.forEach(metric => {
        if ((metric.split("? ")[0].trim() + "?").toLowerCase() == question.toLowerCase() && data.yaml.maker_answers[metric] == "1") {
          let value = metric.split("? ")[1].trim()
          if (value != "District-wide graduation rates") {
            value = value.replace("District-wide graduation rates", "")
          }
          improve_metrics[category].push(value)
        }
      })
      if (improve_metrics[category].length > 0) {
        //console.dir(improve_metrics[category])
        data.yaml.maker_answers[question] = improve_metrics[category]
        data.yaml.category = category
      }
    })
  }
  */



  if (data.yaml.year_submitted == 2014) {

    if (data.yaml.maker_answers["impact_LA_County"] == 1) {
      data.yaml.maker_answers["Does your project impact Los Angeles County?"] = "Yes (benefits all of LA County)"
    } else if (data.yaml.maker_answers["region_county"] == 1) {
      data.yaml.maker_answers["Does your project impact Los Angeles County?"] = "Yes (benefits a region of LA County)"
    } else if (data.yaml.maker_answers["population_county"] == 1) {
      data.yaml.maker_answers["Does your project impact Los Angeles County?"] = "Yes (benefits a population of LA County)"
    } else {
      data.yaml.maker_answers["Does your project impact Los Angeles County?"] = "No"
    }

    if (data.yaml.maker_answers["describe_soloactor"] == 1) {
      data.yaml.maker_answers["Please describe yourself"] = "Solo actor (just us on this project!)"
    } else if (data.yaml.maker_answers["describe_proposedcollaboration"] == 1) {
      data.yaml.maker_answers["Please describe yourself"] = "Proposed collaboration (we want to work with partners!)"
    } else if (data.yaml.maker_answers["describe_collaboration"] == 1) {
      data.yaml.maker_answers["Please describe yourself"] = "Collaboration (partners are signed up and ready to hit the ground running!)"
    }

    let project_areas = []
    projectAreas2014.forEach(area => {
      // console.log(area)
      if (data.yaml.maker_answers[area] == "1" && area != "area_other") {
        project_areas.push(projectAreas2014Labels[area])
        // console.log(area.replace("Where will you be working? ", ""))
      } else if (area == "area_other_blank" && data.yaml.maker_answers[area] != "") {
        project_areas.push(data.yaml.maker_answers[area])
        // console.log(data.yaml.maker_answers[area])
      }
      // delete data[area]
    })
    // console.log("project_areas")
    // console.dir(project_areas)
    data.yaml.maker_answers["Which area(s) of LA does your project benefit?"] = project_areas



    /*
    let how_use_resources = []
    useResources2015.forEach(area => {
      // console.log(area)
      if (data.yaml.maker_answers[area] == "1" && area != "How do you plan to use these resources to make change? Other") {
        how_use_resources.push(area.replace("How do you plan to use these resources to make change? ", ""))
        // console.log(area.replace("Where will you be working? ", ""))
      } else if (area == "How do you plan to use these resources to make change? Specifics" && data.yaml.maker_answers[area] != "") {
        how_use_resources.push(data.yaml.maker_answers[area])
        // console.log(data.yaml.maker_answers[area])
      }
      // delete data[area]
    })
    // console.log("project_areas")
    // console.dir(project_areas)
    data.yaml.maker_answers["How do you plan to use these resources to make change?"] = how_use_resources
    */


    /*
    let help_from_community = []
    helpFromCommunity2015.forEach(area => {
      // console.log(area)
      if (data.yaml.maker_answers[area] == "1" && area != "How can the LA2050 community and other stakeholders help your proposal succeed? Other") {
        help_from_community.push(area.replace("How can the LA2050 community and other stakeholders help your proposal succeed? ", ""))
        // console.log(area.replace("Where will you be working? ", ""))
      } else if (area == "How can the LA2050 community and other stakeholders help your proposal succeed? Specifics" && data.yaml.maker_answers[area] != "") {
        help_from_community.push(data.yaml.maker_answers[area])
        // console.log(data.yaml.maker_answers[area])
      }
      // delete data[area]
    })
    // console.log("project_areas")
    // console.dir(project_areas)
    data.yaml.maker_answers["How can the LA2050 community and other stakeholders help your proposal succeed?"] = help_from_community
    */


    // delete data.yaml.maker_answers["How will your proposal improve the following “Create” metrics? "]
    let improve_metrics = {}
    categories.forEach(category => {
      improve_metrics[category] = []

      // https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript#1026087
      let categoryCapitalized = category.charAt(0).toUpperCase() + category.slice(1);
      let question = `How will your project impact the LA2050 “${categoryCapitalized}” metrics?`

      improveMetrics2014[category].list.forEach(metric => {
        if (data.yaml.maker_answers[improveMetrics2014[category].map[metric]] == "1") {
          improve_metrics[category].push(metric)
        }
      })
      if (data.yaml.maker_answers[`metrics_${category}_blank`]) {
        improve_metrics[category].push(data.yaml.maker_answers[`metrics_${category}_blank`])
      }
      if (improve_metrics[category].length > 0) {
        //console.dir(improve_metrics[category])
        data.yaml.maker_answers[question] = improve_metrics[category]
        data.yaml.category = category
      }
    })
  }



  // data.yaml.published = true
  // data.yaml.body_class = category_colors[data.yaml.category] || "strawberry"

  // for (let prop in data.yaml) {
  //   if (data.yaml.hasOwnProperty(prop)) {
  //     if (data.yaml[prop] === null) data.yaml[prop] = ""
  //   }
  // }


  // if (data.yaml.year_submitted && data.yaml.year_submitted != "") {
  //   if (!uniqueAttributes[data.yaml.year_submitted]) {
  //     uniqueAttributes[data.yaml.year_submitted] = {}
  //   }
  //   for (let prop in data.yaml) {
  //     if (data.yaml.hasOwnProperty(prop)) {
  //       uniqueAttributes[data.yaml.year_submitted][prop] = 1
  //     }
  //   }
  // }


  // if (data.yaml.project_image.startsWith("'")) {
  //   console.log("*****found image with quote: " + data.yaml.project_image)
  //   data.yaml.project_image = data.yaml.project_image.replace(/^'/, "").replace(/'$/, "")
  // }


  // if (markdownOrganizationsLookup[data.yaml.project_id]) {
  //   data.yaml.organization_id = markdownOrganizationsLookup[data.yaml.project_id].organization_id
  // } else if (markdownOrganizationsAggregatedLookup[data.yaml.project_id]) {
  //   data.yaml.organization_id = markdownOrganizationsAggregatedLookup[data.yaml.project_id].organization_id
  // }


  // organizationMarkdownFiles.forEach(item => {
  //   let organization_id = null

  //   item.project_ids.forEach(project_id => {
  //     if (data.yaml.project_id == project_id) {
  //       organization_id = item.organization_id
  //     }
  //   })

  //   if (!organization_id) {
  //     item.aggregated.project_ids.forEach(project_id => {
  //       if (data.yaml.project_id == project_id && data.yaml.organization_id == item.organization_id) {
  //         organization_id = item.organization_id
  //       }
  //     })
  //   }

  //   if (organization_id && organization_id != data.yaml.organization_id) {
  //     console.log("changing organization_id from " + data.yaml.organization_id + " to " + organization_id)
  //     data.yaml.organization_id = organization_id
  //   }
  // })

  // organizationMarkdownFiles.forEach(item => {
  //   let organization_id = null

  //   item.calculated_project_ids.forEach(project_id => {
  //     if (data.yaml.project_id == project_id) {
  //       organization_id = item.organization_id
  //     }
  //   })

  //   if (organization_id && organization_id != data.yaml.organization_id) {
  //     console.log("changing organization_id from " + data.yaml.organization_id + " to " + organization_id)
  //     // data.yaml.organization_id = organization_id
  //   }
  // })


  /*
  let matches = []
  let suspectByWebAddress = []
  let suspectByTitle = []
  let text = getStringForComparison(fs.readFileSync(filename, 'utf8'))
  organizationMarkdownFiles.forEach(item => {
    if (item.calculated_project_ids) {
      item.calculated_project_ids.forEach(project_id => {
        if (data.yaml.project_id == project_id) {
          if (text.indexOf(getStringForComparison(item.title)) < 0) {
            if (item.published) suspectByTitle.push(item)
          }
          if (item.organization_website && item.organization_website.length && item.organization_website.length > 0 && item.organization_website.forEach) {
            let found = false
            item.organization_website.forEach(website => {
              if (website.length > 5 && text.indexOf(getStringForComparison(website)) >= 0) {
                found = true
              }
            })
            if (!found && item.published) suspectByWebAddress.push(item)
          }
          if (item.published) matches.push(item)
        }
      })
    } else {
      // console.log("Coulnd’t find calculated_project_ids for organization:" + item.organization_id + " :: " + item.title)
    }
  })


  if (suspectByWebAddress.length > 0 || suspectByTitle.length > 0) {
    console.log("")
    console.log("*******")
    suspectByWebAddress.forEach(item => {
      console.log("Found an organization link that might not be correct, based on web address: " + item.organization_id + " :: " + item.title)
      console.log(`https://archive.la2050.org/${stringToURI(item.title)}/`)
      if (item.aggregated.challenge_url) {
        console.dir(item.aggregated.challenge_url)
      }
      console.log("…does not match content in: " + data.yaml.project_id + " :: " + data.yaml.title)
      console.log(`https://archive.la2050.org/${data.yaml.year_submitted}/${stringToURI(data.yaml.title)}/`)
      if (data.yaml.challenge_url) {
        console.dir(item.aggregated.challenge_url)
      }
    })
    suspectByTitle.forEach(item => {
      console.log("Found an organization link that might not be correct, based on title: " + item.organization_id + " :: " + item.title)
      console.log(`https://archive.la2050.org/${stringToURI(item.title)}/`)
      if (item.aggregated.challenge_url) {
        console.dir(item.aggregated.challenge_url)
      }
      console.log("…does not match content in: " + data.yaml.project_id + " :: " + data.yaml.title)
      console.log(`https://archive.la2050.org/${data.yaml.year_submitted}/${stringToURI(data.yaml.title)}/`)
      if (data.yaml.challenge_url) {
        console.dir(item.aggregated.challenge_url)
      }
    })

    console.log("")
    console.log("Looking for candidate matches…")
    let candidates = []
    organizationMarkdownFiles.forEach(item => {
      if (text.indexOf(getStringForComparison(item.title)) >= 0) {
        candidates.push(item)
      }
    })

    if (candidates.length > 0) {
      console.log("")
      candidates.forEach(item => {
        console.log("Candidate found: " + item.organization_id + " :: " + item.title)
        console.log(`https://archive.la2050.org/${stringToURI(item.title)}/`)
      })
    } else {
      console.log("< No candidates found >")
    }
  }


  if (data.yaml.published && matches.length == 0) {
    console.log("")
    console.log("________")
    console.log("Couldn’t find an organization that links to " + data.yaml.project_id + " :: " + data.yaml.title)
    console.log(`https://archive.la2050.org/${data.yaml.year_submitted}/${stringToURI(data.yaml.title)}/`)
    console.log("")
    organizationMarkdownFiles.forEach(item => {
      if (item.organization_id == data.yaml.organization_id) {
        console.log("Found the organization this project links to: " + item.organization_id + " :: " + item.title)
        console.log(`https://archive.la2050.org/${stringToURI(item.title)}/`)
      }
    })
    console.log("")
    console.log("Looking for candidate matches by web address…")
    let candidates = []
    organizationMarkdownFiles.forEach(item => {
      if (!item.published) return
      if (item.organization_website && item.organization_website.length && item.organization_website.length > 0) {
        item.organization_website.forEach(website => {
          if (website.length > 5 && text.indexOf(getStringForComparison(website)) >= 0) {
            candidates.push(item)
          }
        })
      }
    })

    if (candidates.length > 0) {
      console.log("")
      candidates.forEach(item => {
        console.log("Candidate by website found: " + item.organization_id + " :: " + item.title)
        console.log(`https://archive.la2050.org/${stringToURI(item.title)}/`)
      })
    } else {
      console.log("< No candidates found >")
    }


    console.log("")
    console.log("Looking for candidate matches by title…")
    candidates = []
    organizationMarkdownFiles.forEach(item => {
      if (text.indexOf(getStringForComparison(item.title)) >= 0) {
        candidates.push(item)
      }
    })

    if (candidates.length > 0) {
      console.log("")
      candidates.forEach(item => {
        console.log("Candidate by title found: " + item.organization_id + " :: " + item.title)
        console.log(`https://archive.la2050.org/${stringToURI(item.title)}/`)
      })
    } else {
      console.log("< No candidates found >")
    }
  }

  if (data.yaml.published && matches.length > 1) {
    console.log("")
    console.log("$$$$$$$$$")
    console.log("Found multiple organization that link to " + data.yaml.project_id + " :: " + data.yaml.title)
    console.log(`https://archive.la2050.org/${data.yaml.year_submitted}/${stringToURI(data.yaml.title)}/`)
    matches.forEach(match => {
      console.log(match.organization_id + " :: " + match.title)
      console.log(`https://archive.la2050.org/${stringToURI(match.title)}/`)
    })
  }
  */


  /*
  {% assign data_collection = site.collections | where: "label", "organizations" | first %}

  {% for item in data_collection.docs %}

    {% for project_id in item.project_ids %}
      {% if page.project_id == project_id %}
        {% assign organization = item %}
      {% endif %}
    {% endfor %}

    {% assign project_id_list = item.aggregated.project_ids %}
    {% for project_id in project_id_list %}
      {% if page.project_id == project_id %}
        {% assign organization = item %}
      {% endif %}
    {% endfor %}

    {% unless organization %}
      {% if item.organization_id == page.organization_id %}
        {% assign organization = item %}
      {% endif %}
    {% endunless %}

  {% endfor %}
  */


  saveMarkdown(filename, data)
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
// let markdownOrganizationsLookup = {}
// let markdownOrganizationsAggregatedLookup = {}
let organizationMarkdownFiles

function createOrganizationsLookup() {

  // Load the markdown files
  let records = getRecords(`../_organizations`)

  // records.forEach(record => {
  //   record.project_ids.forEach(project_id => {
  //     markdownOrganizationsLookup[project_id] = record
  //   })
  //   record.aggregated.project_ids.forEach(project_id => {
  //     markdownOrganizationsAggregatedLookup[project_id] = record
  //   })
  // })

  organizationMarkdownFiles = records
}

createOrganizationsLookup()




updateFolder('../_projects')

// console.dir(uniqueAttributes)

/*
{ '2013': 
   { organization_id: 1,
     project_image: 1,
     project_id: 1,
     title: 1,
     indicator: 1,
     'What is your idea and how will it impact your indicator?': 1,
     'What are some of your organization’s most important achievements to date?': 1,
     'Please identify any partners or collaborators who will work with you on this project.': 1,
     'Please explain how you will evaluate your project. How will you measure success?': 1,
     'How will your project benefit Los Angeles? Please be specific.': 1,
     'What would success look like in the year 2050 regarding your indicator?': 1,
     year_submitted: 1,
     project_video: 1,
     youtube_video_identifier: 1,
     maker_answers: 1,
     maker_answers_list: 1,
     body_class: 1,
     project_summary: 1,
     published: 1,
     maker_image_id: 1,
     maker_image_file_name: 1 },
  '2014': 
   { project_id: 1,
     title: 1,
     project_summary: 1,
     category: 1,
     organization_id: 1,
     year_submitted: 1,
     project_image: 1,
     project_video: 1,
     'Which area(s) of LA does your project benefit? Other (elaborate)': 1,
     'What is your idea/project in more detail?': 1,
     'What will you do to implement this idea/project?': 1,
     'How will your idea/project help make LA the best place to connect today? In LA2050?': 1,
     'Whom will your project benefit? Please be specific.': 1,
     empty_column_1: 1,
     youtube_video_identifier: 1,
     project_areas: 1,
     maker_answers: 1,
     maker_answers_list: 1,
     body_class: 1,
     published: 1,
     maker_image_id: 1,
     maker_image_file_name: 1 },
  '2015': 
   { project_id: 1,
     title: 1,
     organization_id: 1,
     areas_impacted: 1,
     partners: 1,
     project_summary: 1,
     'Please specify below': 1,
     category: 1,
     'Describe in greater detail how you will make LA the best place to connect:': 1,
     'Please list at least one major barrier/challenge you anticipate. What is your strategy for overcoming these obstacles?': 1,
     'Please explain how you will evaluate your work.': 1,
     'Are there other organizations doing similar work (whether complementary or competitive)? What is unique about your proposed approach?': 1,
     'Please identify any partners or collaborators who will work with you on this project. How much of the $100,000 grant award will each partner receive?': 1,
     'How much do you think this will cost? If more than $100,000 – how will you cover the additional costs?': 1,
     'Please include a detailed budget of how you will use $100,000 to implement this project.': 1,
     'How do you plan to scale the success of your proposal?': 1,
     year_submitted: 1,
     project_image: 1,
     project_video: 1,
     youtube_video_identifier: 1,
     project_areas: 1,
     maker_answers: 1,
     maker_answers_list: 1,
     body_class: 1,
     organization_name: 1,
     published: 1,
     maker_image_id: 1,
     maker_image_file_name: 1 },
  '2016': 
   { organization_id: 1,
     year_submitted: 1,
     organization_name: 1,
     organization_website: 1,
     ein: 1,
     project_image_2: 1,
     project_id: 1,
     title: 1,
     organization_name_2: 1,
     organization_activity: 1,
     project_image: 1,
     project_video: 1,
     project_summary: 1,
     project_is_collaboration: 1,
     project_collaborators: 1,
     project_areas: 1,
     project_measure: 1,
     project_proposal_help: 1,
     project_description: 1,
     project_impact: 1,
     project_proposal_best_place: 1,
     challenge_url: 1,
     empty_column_1: 1,
     project_proposal_description: 1,
     project_proposal_impact: 1,
     category: 1,
     body_class: 1,
     published: 1 },
  '2018': 
   { project_id: 1,
     project_id_2: 1,
     title: 1,
     project_summary: 1,
     'Please describe the activation your organization seeks to launch.': 1,
     'Describe in greater detail how your activation will make LA the best place?': 1,
     'How will your activation engage Angelenos to make LA the best place': 1,
     'Please explain how you will define and measure success for your activation.': 1,
     'Where do you hope this activation or your organization will be in five years?': 1,
     impact_metrics: 1,
     make_la_great: 1,
     category: 1,
     organization_id: 1,
     project_image: 1,
     project_video: 1,
     project_id_3: 1,
     year_submitted: 1,
     organization_name: 1,
     project_proposal_description: 1,
     project_areas: 1,
     project_proposal_mobilize: 1,
     project_proposal_best_place: 1,
     project_proposal_engage: 1,
     project_measure: 1,
     project_five_years: 1,
     category_metrics: 1,
     category_other: 1,
     challenge_url: 1,
     body_class: 1,
     published: 1 } }
*/


// let years = [2013, 2014, 2015, 2016, 2018]

// let uniqueAttributesArray = {}

// years.forEach(year => {
//   uniqueAttributesArray[year] = []
//   for (let prop in uniqueAttributes[year]) {
//     if (uniqueAttributes[year].hasOwnProperty(prop)) {
//       uniqueAttributesArray[year].push(prop)
//     }
//   }
//   uniqueAttributesArray[year] = Array.from(new Set(uniqueAttributesArray[year]))
// })


// console.dir(uniqueAttributesArray)

/*

{ '2013': 
   [ 'organization_id',
     'project_image',
     'project_id',
     'title',
     'indicator',
     'What is your idea and how will it impact your indicator?',
     'What are some of your organization’s most important achievements to date?',
     'Please identify any partners or collaborators who will work with you on this project.',
     'Please explain how you will evaluate your project. How will you measure success?',
     'How will your project benefit Los Angeles? Please be specific.',
     'What would success look like in the year 2050 regarding your indicator?',
     'year_submitted',
     'project_video',
     'youtube_video_identifier',
     'maker_answers',
     'maker_answers_list',
     'body_class',
     'project_summary',
     'published',
     'maker_image_id',
     'maker_image_file_name' ],
  '2014': 
   [ 'project_id',
     'title',
     'project_summary',
     'category',
     'organization_id',
     'year_submitted',
     'project_image',
     'project_video',
     'Which area(s) of LA does your project benefit? Other (elaborate)',
     'What is your idea/project in more detail?',
     'What will you do to implement this idea/project?',
     'How will your idea/project help make LA the best place to connect today? In LA2050?',
     'Whom will your project benefit? Please be specific.',
     'empty_column_1',
     'youtube_video_identifier',
     'project_areas',
     'maker_answers',
     'maker_answers_list',
     'body_class',
     'published',
     'maker_image_id',
     'maker_image_file_name' ],
  '2015': 
   [ 'project_id',
     'title',
     'organization_id',
     'areas_impacted',
     'partners',
     'project_summary',
     'Please specify below',
     'category',
     'Describe in greater detail how you will make LA the best place to connect:',
     'Please list at least one major barrier/challenge you anticipate. What is your strategy for overcoming these obstacles?',
     'Please explain how you will evaluate your work.',
     'Are there other organizations doing similar work (whether complementary or competitive)? What is unique about your proposed approach?',
     'Please identify any partners or collaborators who will work with you on this project. How much of the $100,000 grant award will each partner receive?',
     'How much do you think this will cost? If more than $100,000 – how will you cover the additional costs?',
     'Please include a detailed budget of how you will use $100,000 to implement this project.',
     'How do you plan to scale the success of your proposal?',
     'year_submitted',
     'project_image',
     'project_video',
     'youtube_video_identifier',
     'project_areas',
     'maker_answers',
     'maker_answers_list',
     'body_class',
     'organization_name',
     'published',
     'maker_image_id',
     'maker_image_file_name' ],
  '2016': 
   [ 'organization_id',
     'year_submitted',
     'organization_name',
     'organization_website',
     'ein',
     'project_image_2',
     'project_id',
     'title',
     'organization_name_2',
     'organization_activity',
     'project_image',
     'project_video',
     'project_summary',
     'project_is_collaboration',
     'project_collaborators',
     'project_areas',
     'project_measure',
     'project_proposal_help',
     'project_description',
     'project_impact',
     'project_proposal_best_place',
     'challenge_url',
     'empty_column_1',
     'project_proposal_description',
     'project_proposal_impact',
     'category',
     'body_class',
     'published' ],
  '2018': 
   [ 'project_id',
     'project_id_2',
     'title',
     'project_summary',
     'Please describe the activation your organization seeks to launch.',
     'Describe in greater detail how your activation will make LA the best place?',
     'How will your activation engage Angelenos to make LA the best place',
     'Please explain how you will define and measure success for your activation.',
     'Where do you hope this activation or your organization will be in five years?',
     'impact_metrics',
     'make_la_great',
     'category',
     'organization_id',
     'project_image',
     'project_video',
     'project_id_3',
     'year_submitted',
     'organization_name',
     'project_proposal_description',
     'project_areas',
     'project_proposal_mobilize',
     'project_proposal_best_place',
     'project_proposal_engage',
     'project_measure',
     'project_five_years',
     'category_metrics',
     'category_other',
     'challenge_url',
     'body_class',
     'published' ] }
*/


