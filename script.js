const SYSTEM_SIZE = 1050 / 2

document.getElementById("hubble").addEventListener("click", ()=>{
  window.open("https://twitter.com/spacetelelive")
})

const nameBox = document.getElementById("nameBox")
const salutationName = document.getElementById("salutationName")
salutationName.textContent = (localStorage.name || "Hacker") + "!"
nameBox.value = localStorage.name || "Hacker"

nameBox.addEventListener("keyup", ()=>{
  if (nameBox.value.trim() != "") {
    localStorage.name = nameBox.value.trim()
    salutationName.textContent = nameBox.value.trim() + "!"

  }
})

document.getElementById("apod").addEventListener("click", ()=>{
  document.getElementById("apod-overlay").classList.add("visible")
  document.getElementById("dim").classList.add("visible")
})

document.getElementById("settings").addEventListener("click", ()=>{
  document.getElementById("settings-overlay").classList.add("visible")
  document.getElementById("dim").classList.add("visible")
})

document.getElementById("info").addEventListener("click", ()=>{
  document.getElementById("about-overlay").classList.add("visible")
  document.getElementById("dim").classList.add("visible")
})

document.getElementById("close-apod").addEventListener("click", ()=>{
  document.getElementById("apod-overlay").classList.remove("visible")
  document.getElementById("dim").classList.remove("visible")
})

document.getElementById("close-settings").addEventListener("click", ()=>{
  document.getElementById("settings-overlay").classList.remove("visible")
  document.getElementById("dim").classList.remove("visible")
})

document.getElementById("close-about").addEventListener("click", ()=>{
  document.getElementById("about-overlay").classList.remove("visible")
  document.getElementById("dim").classList.remove("visible")
})

document.getElementById("dim").addEventListener("click", ()=>{
  document.getElementById("apod-overlay").classList.remove("visible")
  document.getElementById("about-overlay").classList.remove("visible")
  document.getElementById("settings-overlay").classList.remove("visible")
  document.getElementById("dim").classList.remove("visible")
})

function fetchJSON(url) {
  return fetch(url)
    .then(data => data.json())
}
function fetchEnhancedEpicData() {
  return fetchJSON("https://epic.gsfc.nasa.gov/api/enhanced")
}

async function getMarsWeather() {
  const data = await fetchJSON("https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json")
  document.getElementById("mars-sol").innerHTML = data.soles[0].sol
  document.getElementById("mars-temperature").innerHTML = data.soles[0].min_temp + "&deg;C"
}

async function getWeather() {
  navigator.geolocation.getCurrentPosition(async (location)=>{

    const weather = await fetchJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${OPENWEATHERMAPKEY}&units=imperial`)
    fetchJSON(`https://api.openweathermap.org/geo/1.0/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}&limit=10&appid=${OPENWEATHERMAPKEY}`)
      .then((res)=>{
        document.getElementById("subtitle-earth").textContent = `${res[0].name}, ${res[0].state}` 
        console.log()
      })
    console.log(weather.currently)
    document.getElementById("earth-weather").textContent = weather.weather[0].main
    document.getElementById("earth-temp").innerHTML = weather.main.temp + "&deg;F"
  }, ()=>{
    document.getElementById("earth-weather").textContent = "Unknown"
    document.getElementById("earth-temp").innerHTML = weather.main.temp + "Unknown"
  })

  
}

function epicImageToURL(imageData) {
  const year = imageData.identifier.slice(0,4)
  const month = imageData.identifier.slice(4,6)
  const day = imageData.identifier.slice(6,8)
  return `https://epic.gsfc.nasa.gov/archive/enhanced/${year}/${month}/${day}/png/${imageData.image}.png`
}

async function epicImages() {
  const imageData = await fetchEnhancedEpicData()
  return imageData
    .map(epicImageToURL)
    .map((url)=>{
      const img = new Image()
      img.src = url
      return img
    })
}



async function apodImage() {
  let data = await fetchJSON(`https://api.nasa.gov/planetary/apod?api_key=${NASAAPIKEY}`)
  const img = new Image()
  img.src = data.hdurl
  return img
}

// epicImages().then((imgs=>imgs.forEach((img)=>document.body.append(img))))
apodImage().then(img=>document.getElementById("apod-overlay").append(img))



function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateStars() {
  const canvas = document.getElementById("starfield")
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = canvas.getContext("2d")
  const numOfStars = 300
  for (var i = 0; i < numOfStars; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const radius = Math.random() + 0.6
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 360)
    ctx.fillStyle = "#dce4eaaa"
    ctx.fill()
  }
}

function planetHoverHandler(planetId, isHovering) {
  if (isHovering) {
    document.getElementById(`planet-card-${planetId}`).classList.add("hover")
  } else {
    document.getElementById(`planet-card-${planetId}`).classList.remove("hover")
  }
}


const solarSystem = document.getElementById("solar-system")

function addOrbitCircle(radius) {
  const testCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  testCircle.setAttribute("cx", SYSTEM_SIZE)
  testCircle.setAttribute("cy", SYSTEM_SIZE)
  testCircle.setAttribute("r", radius)
  testCircle.classList.add("orbitCircle")
  solarSystem.prepend(testCircle)
}

function fakePlanet(radius) {
  const testCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  testCircle.setAttribute("cx", SYSTEM_SIZE)
  testCircle.setAttribute("cy", SYSTEM_SIZE)
  testCircle.setAttribute("r", radius)
  testCircle.classList.add("fakePlanet")
  return testCircle
}

function calculateXCoordinate(planetData) {
  const angle = planetData.angle
  return (Math.cos(-1 * angle / (180/Math.PI)) * planetData.orbitRadius) -  planetData.displaySize / 2 - planetData.centerOffset.x
}
function calculateYCoordinate(planetData) {
  const angle = planetData.angle
  return (Math.sin(-1 * angle / (180/Math.PI)) * planetData.orbitRadius) - planetData.displaySize * (planetData.originalSize.y / planetData.originalSize.x) / 2 - planetData.centerOffset.y
}

function placePlanetOnOrbit(planetData) {
  const planet = document.createElementNS("http://www.w3.org/2000/svg", "image")
  planet.setAttribute("href", "/planets/" + planetData.img)
  planet.setAttribute("width", planetData.displaySize)
  planet.classList.add("planet")
  const xPos = calculateXCoordinate(planetData)
  const yPos = calculateYCoordinate(planetData)
  planet.setAttribute("x", xPos+SYSTEM_SIZE)
  planet.setAttribute("y", yPos+SYSTEM_SIZE)
  planet.addEventListener("mouseenter", ()=>{
    planetHoverHandler(planetData.id, true)
  })
  planet.addEventListener("mouseleave", ()=>{
    planetHoverHandler(planetData.id, false)
  })
  planet.style = ("transform-origin: " + Math.round(xPos + SYSTEM_SIZE + planetData.displaySize/2)  + "px " + Math.round(yPos + SYSTEM_SIZE + planetData.displaySize * (planetData.originalSize.y / planetData.originalSize.x) / 2) + "px;")
  // planet.style = "transform-origin: 5px 5px;"
  //planet.style.transform = `translate(${xPos}px, ${yPos}px)`
  solarSystem.append(planet)
}

function createPopup(planet) {
  const WIDTH = 330
  const HEIGHT = 150
  let g = document.createElementNS("http://www.w3.org/2000/svg", "g")
  
  const popupInfo = planet.popupInfo
  let x = calculateXCoordinate(planet) + SYSTEM_SIZE + planet.displaySize + 10
  let y = calculateYCoordinate(planet) + SYSTEM_SIZE + 20
  if (x > SYSTEM_SIZE*1.3) {
    x = calculateXCoordinate(planet) + SYSTEM_SIZE - WIDTH - 10
    g.classList.add("left")
  }
  if (y > SYSTEM_SIZE*1.3) {
    y = calculateYCoordinate(planet) + SYSTEM_SIZE - HEIGHT + 50
  }

  let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  rect.setAttribute("fill", "transparent")
  rect.setAttribute("x", x)
  rect.setAttribute("y", y)
  rect.setAttribute("rx", 10)
  rect.setAttribute("width", WIDTH)
  rect.setAttribute("height", HEIGHT)
  rect.classList.add("popup-bg")
  g.append(rect)

  let title = document.createElementNS("http://www.w3.org/2000/svg", "text")
  title.setAttribute("x", x+WIDTH/2)
  title.setAttribute("y", y+40)
  
  title.setAttribute("fill", "white")
  title.classList.add("title-text")
  title.textContent = popupInfo.title
  title.setAttribute("text-anchor", "middle")

  let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
  text.setAttribute("x", x)
  if (popupInfo.subtitle) {
    text.setAttribute("y", y+70)
  } else {
    text.setAttribute("y", y+42)
  }
  text.setAttribute("dy", 10)
  text.setAttribute("fill", "white")
  // text.setAttribute("filter", "url(#solid)")
  let data = document.createElementNS("http://www.w3.org/2000/svg", "text")
  data.setAttribute("x", x+WIDTH)
  if (popupInfo.subtitle) {
    data.setAttribute("y", y+70)
  } else {
    data.setAttribute("y", y+42)
  }
  data.setAttribute("dy", 10)
  data.setAttribute("fill", "white")
  data.setAttribute("text-anchor", "end")
  // data.setAttribute("filter", "url(#solid)")
  // text.setAttribute("fill", "white")
  popupInfo.stats.forEach((line, index)=>{
    let tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan")
    tspan.innerHTML = line.title + "&nbsp;"
    tspan.setAttribute("dy", 30)
    tspan.setAttribute("x", x+20)
    tspan.classList.add("description-text")

    // let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    // rect.classList.add("data-line")
    // rect.setAttribute("x", x+20)
    // rect.setAttribute("width", WIDTH-40)
    // rect.setAttribute("height", 3)
    // rect.setAttribute("y", y+42 + 25 + 30*index)
    g.append(rect)
    g.setAttribute("id", `planet-card-${planet.id}`)
    text.append(tspan)
  })

  popupInfo.stats.forEach((line)=>{
    let tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan")
    tspan.innerHTML = "&nbsp" + line.data
    tspan.setAttribute("dy", 30)
    tspan.setAttribute("x", WIDTH + x - 20)
    tspan.classList.add("data-text")
    if (line.id) {
      tspan.setAttribute("id", line.id)
    }
    data.append(tspan)
  })
  g.append(text)
  g.append(data)
  g.append(title)

  if (popupInfo.subtitle) {
    let subtitle = document.createElementNS("http://www.w3.org/2000/svg", "text")
    subtitle.setAttribute("x", x+WIDTH/2)
    subtitle.setAttribute("y", y+70)
    
    subtitle.setAttribute("fill", "white")
    subtitle.setAttribute("id", `subtitle-${planet.id}`)
    subtitle.classList.add("subtitle-text")
    subtitle.textContent = popupInfo.subtitle
    subtitle.setAttribute("text-anchor", "middle")
    g.append(subtitle)
  }

  g.classList.add("fact-card")
  solarSystem.append(g)
}


function placePlanet(planet) {
  addOrbitCircle(planet.orbitRadius)
  placePlanetOnOrbit(planet)
}

function randomAngleShift(angle) {
  // return angle;
  return angle + Math.floor(Math.random()*20) - 10
  // return Math.floor(Math.random()*360)
}

const planetImgs = [
  {
    id: "sun",
    img:"sun.png",
    displaySize: 180,
    originalSize: {
      x: 1260,
      y: 1260
    },
    centerOffset: {
      x: 0,
      y: 0
    },
    orbitRadius: 0,
    angle: randomAngleShift(0),
    popupInfo: {
      title: "The Sun",
      subtitle: false,
      stats: [
        {title: "Speed", data: "220 km/s"},
        {title: "Temperature", data: "15 Million &deg;C"},
        {title: "Class", data: "Yellow Dwarf Star"},
      ]
    }
  },
  {
    id: "mercury",
    img:"mercury.png",
    displaySize: 40,
    originalSize: {
      x: 156,
      y: 156
    },
    centerOffset: {
      x: 0,
      y: 0
    },
    orbitRadius: 115,
    angle: randomAngleShift(200),
    popupInfo: {
      title: "Mercury",
      subtitle: false,
      stats: [
        {title: "Sidereal Time", data: "58.65 Days"},
        {title: "Miles from Sun", data: "40.11 Million"},
        {title: "Tilt of Axis", data: "2&deg;"},
      ]
    }
  },
  {
    id: "venus",
    img:"venus.png",
    displaySize: 60,
    originalSize: {
      x: 183,
      y: 183
    },
    centerOffset: {
      x: 0,
      y: 0
    },
    orbitRadius: 160,
    angle: randomAngleShift(330),
    popupInfo: {
      title: "Venus",
      subtitle: false,
      stats: [
        {title: "Sidereal Time", data: "243 Days"},
        {title: "Miles from Sun", data: "66.87 Million"},
        {title: "Tilt of Axis", data: "3&deg;"},
      ]
    }
  },
  {
    id: "earth",
    img:"earth.png",
    displaySize: 80,
    originalSize: {
      x: 285,
      y: 285
    },
    centerOffset: {
      x: 0,
      y: 0
    },
    orbitRadius: 200,
    angle: randomAngleShift(0),
    popupInfo: {
      title: "Earth",
      subtitle: "Unknown Location",
      stats: [
        {title: "Temperature", data: "Loading...", id: "earth-temp"},
        {title: "Weather", data: "Loading...", id:"earth-weather"}
      ]
    }
  },
  {
    id: "mars",
    img:"mars.png",
    displaySize: 70,
    originalSize: {
      x: 201,
      y: 201
    },
    centerOffset: {
      x: 0,
      y: 0
    },
    orbitRadius: 250,
    angle: randomAngleShift(300),
    popupInfo: {
      title: "Mars",
      subtitle: false,
      stats: [
        {title: "Last Reported Sol", data: "205", id:"mars-sol"},
        {title: "Miles from Sun", data: "139 Million"},
        {title: "Most Recent Low", data: "18.2&deg", id:"mars-temperature"},
      ]
    }
  },
  {
    id: "jupiter",
    img:"jupiter.png",
    displaySize: 80,
    originalSize: {
      x: 411,
      y: 411
    },
    centerOffset: {
      x: 0,
      y: 0
    },
    orbitRadius: 300,
    angle: randomAngleShift(330),
    popupInfo: {
      title: "Jupiter",
      subtitle: false,
      stats: [
        {title: "Sidereal Time", data: "4333 Days"},
        {title: "Miles from Sun", data: "464 Million"},
        {title: "Tilt of Axis", data: "3&deg;"},
      ]
    }
  },
  {
    id: "saturn",
    img:"saturn.png",
    displaySize: 130,
    originalSize: {
      x: 547,
      y: 316
    },
    centerOffset: {
      x: 0,
      y: 0
    },
    orbitRadius: 350,
    angle: randomAngleShift(170),
    popupInfo: {
      title: "Saturn",
      subtitle: false,
      stats: [
        {title: "Sidereal Time", data: "29.5 Days"},
        {title: "Miles from Sun", data: "920 Million"},
        {title: "Tilt of Axis", data: "26.73&deg;"},
      ]
    }
  },
  {
    id: "uranus",
    img:"uranus.png",
    displaySize: 90,
    originalSize: {
      x: 305,
      y: 254
    },
    centerOffset: {
      x: 0,
      y: 0
    },
    orbitRadius: 400,
    angle: randomAngleShift(200),
    popupInfo: {
      title: "Uranus",
      subtitle: false,
      stats: [
        {title: "Sidereal Time", data: "84 Years"},
        {title: "Miles from Sun", data: "1.83 Billion"},
        {title: "Tilt of Axis", data: "97.77&deg;"},
      ]
    }
  },
  {
    id: "neptune",
    img:"neptune.png",
    displaySize: 60,
    originalSize: {
      x: 198,
      y: 198
    },
    centerOffset: {
      x: 0,
      y: 0
    },
    orbitRadius: 450,
    angle: randomAngleShift(0),
    popupInfo: {
      title: "Neptune",
      subtitle: false,
      stats: [
        {title: "Sidereal Time", data: "16 hours"},
        {title: "Miles from Sun", data: "2.8 Billion"},
        {title: "Tilt of Axis", data: "28.2&deg;"},
      ]
    }
  },
  {
    id: "pluto",
    img:"pluto.png",
    displaySize: 50,
    originalSize: {
      x: 130,
      y: 130
    },
    centerOffset: {
      x: 0,
      y: 0
    },
    orbitRadius: 500,
    angle: randomAngleShift(330),
    popupInfo: {
      title: "Pluto",
      subtitle: false,
      stats: [
        {title: "Sidereal Time", data: "249 Years"},
        {title: "Miles from Sun", data: "3.7 Billion"},
        {title: "Tilt of Axis", data: "122.5&deg;"},
      ]
    }
  }
]

generateStars()
planetImgs.forEach(placePlanet)
planetImgs.forEach(createPopup)

const timeElem = document.getElementById("time")
const dateElem = document.getElementById("date")

function hoursAndMinsToTime(hours, minsRaw) {
  let mins = String(minsRaw).padStart(2, "0")
  if (hours == 0) {
    return `12:${mins} AM`
  }
  else if (hours > 0 && hours < 12) {
    return `${hours}:${mins} AM`
  } 
  else if (hours == 12) {
    return `${hours}:${mins} PM`
  }
  else {
    return `${hours-12}:${mins} PM`
  }
}

function tickClock() {
  const time = new Date()
  timeElem.textContent = hoursAndMinsToTime(time.getHours(), time.getMinutes())
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function getDate() {
  const time = new Date()
  return dayNames[time.getDay()] + ", " + monthNames[time.getMonth()] + " " + time.getDate()
}
dateElem.textContent = getDate()

tickClock()
setInterval(tickClock, 1)
getMarsWeather()
getWeather()
// createPopup(560, 560)
