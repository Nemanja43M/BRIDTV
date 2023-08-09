const app = document.querySelector(".box");

function secondsToTimeString(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

function getCachedData(key) {
  const cachedData = localStorage.getItem(key);
  const cachedExpiration = localStorage.getItem(`${key}_expiration`);

  if (
    cachedData &&
    cachedExpiration &&
    new Date().getTime() < parseInt(cachedExpiration)
  ) {
    return JSON.parse(cachedData);
  }
  return null;
}

function setCachedData(key, data) {
  const expirationTime = new Date().getTime() + 5 * 60 * 1000;
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(`${key}_expiration`, expirationTime);
}

function fetchDataAndUpdateCache() {
  const cachedVideoData = getCachedData("cachedVideoData");
  console.log(cachedVideoData);
  if (cachedVideoData) {
    populateData(cachedVideoData);
    addEventListenersToTitles(cachedVideoData);
  } else {
    fetchAndCacheData();
  }
}

function fetchAndCacheData() {
  fetch("https://services.brid.tv/services/get/latest/26456/0/1/25/0.json")
    .then((res) => res.json())
    .then((completeData) => {
      console.log("api call");
      setCachedData("cachedVideoData", completeData);
      populateData(completeData);
      addEventListenersToTitles(completeData);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function populateData(data) {
  $bp("DIV_ID", {
    id: data.Player.id,
    width: "480",
    height: "270",
    video: data.Video[0].id,
  });
  let html = "";
  data.Video.forEach((values) => {
    const formattedDuration = secondsToTimeString(values.duration);
    html += `
    <div class="video-container">
      <video id="video-${values.id}" class="video" poster="${values.snapshots.th}" src="${values.source.hd}" controls muted></video>
      <h3 id="heading-${values.id}" class="heading">${values.name}</h3>
      <h4>${formattedDuration}</h4>
    </div>
    `;
  });
  app.innerHTML = html;
}

function addEventListenersToTitles(data) {
  const playerElement = document.getElementById("DIV_ID");
  const playerInstance = $bp(playerElement, {
    width: "480",
    height: "270",
  });

  data.Video.forEach((values) => {
    console.log(values);

    const videoId = `video-${values.id}`;
    const titleId = `heading-${values.id}`;
    const videoElement = document.getElementById(videoId);
    const titleElement = document.getElementById(titleId);

    videoElement.addEventListener("click", () => {
      playerInstance.src(values).play();
    });

    titleElement.addEventListener("click", () => {
      videoElement.play();
      playerInstance.src(values).play();
    });
  });
}

fetchDataAndUpdateCache();

setInterval(fetchDataAndUpdateCache, 5 * 60 * 1000);
