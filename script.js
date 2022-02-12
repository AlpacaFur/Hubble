
function fetchJSON(url) {
  return fetch(url)
    .then(data => data.json())
}
function fetchEnhancedEpicData() {
  return fetchJSON("https://epic.gsfc.nasa.gov/api/enhanced")
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
  let data = await fetchJSON("https://api.nasa.gov/planetary/apod?api_key=aB8KkbPvQwWNeEIZ4sGJdUhEaMghSac1MGXSD1d4")
  const img = new Image()
  img.src = data.hdurl
  return img
}

// epicImages().then((imgs=>imgs.forEach((img)=>document.body.append(img))))
apodImage().then(img=>document.getElementById("test-overlay").append(img))