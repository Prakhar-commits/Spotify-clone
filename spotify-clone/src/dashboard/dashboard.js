import { fetchRequest } from "../api";
import { ENDPOINT, SECTIONTYPE, logout } from "../common";



const audio = new Audio();


const onProfileClick = (event) => {
  event.stopPropagation();
  const profileMenu = document.querySelector("#profile-menu");
  profileMenu.classList.toggle("hidden");
  if (!profileMenu.classList.contains("hidden")) {
    profileMenu.querySelector("li#logout").addEventListener("click", logout);
  }
};
const loaduserProfile = async () => {
  const defaultImage = document.querySelector("#default-image");
  const profileButton = document.querySelector("#user-profile-btn");
  const displayNameElement = document.querySelector("#display-name");

  const { display_name: displayName, images } = await fetchRequest(
    ENDPOINT.userInfo
  );

  if (images?.length) {
    defaultImage.classList.add("hidden");
  } else {
    defaultImage.classList.remove("hidden");
  }

  profileButton.addEventListener("click", onProfileClick);
  displayNameElement.textContent = displayName;
};

const onPlaylistItemClicked = (event, id) => {
  console.log(event.target);
  const section = { type: SECTIONTYPE.PLAYLIST, playlist: id };
  history.pushState(section, "", `playlist/${id}`);
  loadSection(section);
};

const loadPlaylist = async (endpoint, elementId) => {
  const { playlists: { items } } = await fetchRequest(endpoint);
  const playlistItemsSection = document.querySelector(`#${elementId}`);

  for (let { name, description, images, id } of items) {
    const playlistItem = document.createElement("section");
    playlistItem.className =
      "bg-black-secondary rounded p-4 hover:cursor-pointer hover:bg-light-black";
    playlistItem.id = id;
    playlistItem.setAttribute("data-type", "playlist");
    playlistItem.addEventListener("click", (event) =>
      onPlaylistItemClicked(event, id)
    );
    const [{ url: imageUrl }] = images;
    playlistItem.innerHTML = `<img src="${imageUrl}" alt="${name} class="rounded mb-2 object-contain shadow "/>
    <h2 class="text-base font-semibold mb-4 truncate">${name}</h2>
    <h3 class="text-sm text-secondary line-clamp-2">${description}</h3>`;

    playlistItemsSection.appendChild(playlistItem);
  }
};

const loadPlaylists = () => {
  loadPlaylist(ENDPOINT.featuredPlaylist, "featured-playlist-items");
  loadPlaylist(ENDPOINT.toplists, "top-playlist-items");
};

const formatTime = (duration) => {
  const min = Math.floor(duration / 60_000);
  const sec = ((duration % 6_000) / 1000).toFixed(0);
  const formattedTime =
    sec == 60 ? min + 1 + ":00" : min + ":" + (sec < 10 ? "0" : "") + sec;
  return formattedTime;
};


const fillContentForDashboard = () => {
  const pageContent = document.querySelector("#page-content");
  const playlistMap = new Map([
    ["featured", "featured-playlist-items"],
    ["top playlists", "top-playlist-items"],
  ]);
  let innerHTML = "";
  for (let [type, id] of playlistMap) {
    innerHTML += `<article class="p-4">
    <h1 class="mb-4 text-2xl font-bold capitalize">${type}</h1>
    <section
      id="${id}"class="featured-songs grid grid-cols-auto-fill-cards gap-4"></section>
  </article>
    `;
  }
  pageContent.innerHTML = innerHTML;
};

const onTrackSelection = (id, event) => {
  document.querySelectorAll("#tracks .track").forEach((trackItem) => {
    if (trackItem.id === id) {
      trackItem.classList.add("bg-gray", "selected");
    } else {
      trackItem.classList.remove("bg-gray", "selected");
    }
  });
};

const updatedIconsForPlayMode = (id) => {
  playButton.querySelector("span").textContent = "pause_circle";
  const playButtonFromTracks = document.querySelector(`#play-track${id}`);
  playButtonFromTracks.textContent = "| |"
  playButtonFromTracks.setAttribute("data-play","true");
};

const AudioMetadataLoaded = (id) => {
  const totalSongDuration = document.querySelector("#total-song-duration");
  totalSongDuration.textContent = `0:${audio.duration.toFixed(0)}`;
};

const updateIconsForPause =(id)=>{
  playButton.querySelector("span").textContent = "play_circle";
  const playButtonFromTracks = document.querySelector(`#play-track${id}`);
  playButtonFromTracks.textContent = "▶";
}

const onNowPlayingPlayButtonClicked = (id) => {
  if (audio.paused) {
    audio.play();
    updatedIconsForPlayMode(id);
  } else {
    audio.pause();
    updateIconsForPause(id);
   
  }
};

const togglePlay = ()=>{
  if(audio.src){
  if(audio.paused){
    audio.play();
  }else{
    audio.pause();
  }
  }
}

const playTrack = (event,{ image, artistNames, name, duration, previewUrl, id }) => {
  const buttonWithDataPlay = document.querySelector(`[data-play="true"]`);
  const button = event.target;
  if(audio.src === previewUrl){
    togglePlay();
  }else{
  
    const nowPlayingSongImage = document.querySelector("#now-playing-image");
    nowPlayingSongImage.src = image.url;
    const songTitle = document.querySelector("#now-playing-song");
    const artists = document.querySelector("#now-playing-artists");
  
    songTitle.textContent = name;
    artists.textContent - artistNames;
    if (!audio.paused) {
    }
    audio.src = previewUrl;
    
    audio.play();
   
  }
};

const loadPlaylistTracks = ({ tracks }) => {
  const trackSections = document.querySelector("#tracks");
  let trackNumber = 1;
  for (let trackItem of tracks.items) {
    let {
      id,
      artists,
      name,
      album,
      duration_ms: duration,
      preview_url: previewUrl,
    } = trackItem.track;
    let track = document.createElement("section");
    track.id = id;
    track.className =
      "track p-1 grid grid-cols-[50px_1fr_1fr_50px] items-center justify-items-start gap-4 rounded-md hover:bg-light-black";
    let image = album.images.find(img => img.height === 64);
    let artistNames = Array.from(artists, artist => artist.name).join(", ");
    track.innerHTML = `
  <p class="relative w-full flex items-center justify-center justify-self-center"><span class="track-no">${trackNumber++}</span></p>
  <section class="grid grid-cols-[auto_1fr] place-items-center gap-2">
    <img class="h-10 w-10" src="${image.url}" alt="${name}" />
    <article class="flex flex-col gap-2 justify-center">
      <h2 class="text-base text-white line-clamp-1 song-title ">${name}</h2>
      <p class="text-xs line-clamp-1">${artistNames}</p>
    </article>
  </section>
  <p class="text-sm">${album.name}</p>
  <p class="text-sm">${formatTime(duration)}</p>
`;
    track.addEventListener("click", (event) => onTrackSelection(id, event));
    const playButton = document.createElement("button");
    playButton.id = `play-track${id}`;
    playButton.className = `play w-full absolute left-0 text-lg invisible material-symbols-outlined`;
    playButton.textContent = "play_arrow";
    playButton.addEventListener("click", (event) =>
      onPlayTrack(event, { image, artistNames, name, duration, previewUrl, id })
    );
    track.querySelector("p").appendChild(playButton);
    trackSections.appendChild(track);
  }
};

const fillContentForPlaylist = async (playlistId) => {
  const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
  const{name , description , images , tracks} =playlist;
   const coverElement = document.querySelector("#cover-content");
  coverElement.innerHTML = ` 
   <img class="object-contain h-36 w-36" src="${images[0].url}" alt="">
   <section>
  <h2 id="playlist-name" class="text-4xl">${name}</h2>
  <p id="playlist-artists">artists</p>
  <p id="playlist-details">${tracks.items.length}</p>
  </section>`
  
  const pageContent = document.querySelector("#page-content");
  pageContent.innerHTML = `<header id="playlist-header" class="mx-8 py-4 border-secondary border-b-[0.5px] z-10">
  <nav class="py-2">
    <ul
      class="track grid grid-cols-[50px_1fr_1fr_50px] items-center justify-items-start gap-4 text-secondary rounded-md  ">
      <li class="justify-self-center">#</li>
      <li>Title</li>
      <li>Album</li>
      <li>🕔</li>
    </ul>
  </nav>
</header>
<section class="px-8 mt-4" id="tracks">
</section>`;
  document.createElement("section");
  loadPlaylistTracks(playlist);
  console.log(playlist);
};

const onContentScroll = (event) => {
  const { scrollTop } = event.target;
  const header = document.querySelector(".header");
  if (scrollTop >= header.offsetHeight) {
    header.classList.add("sticky", "top-0", "bg-black-secondary");
    header.classList.remove("bg-transparent");
  } else {
    header.classList.remove("sticky", "top-0", "bg-black-secondary");
    header.classList.add("bg-transparent");
  }
  if (history.state.type === SECTIONTYPE.PLAYLIST) {
    const coverElement = document.querySelector("#cover-content");
    const playlistHeader = document.querySelector("#playlist-header");
    if (scrollTop >= coverElement.offsetHeight - header.offsetHeight) {
      playlistHeader.classList.add("sticky", "bg-black-secondary", "px-8");
      playlistHeader.classList.remove("mx-8");
      playlistHeader.style.top = `${header.offsetHeight}px`;
    } else {
      playlistHeader.classList.remove("sticky", "bg-black-secondary", "px-8");
      playlistHeader.classList.add("mx-8");
      playlistHeader.style.top = `revert`;
    }
  }
};

const loadSection = (section) => {
  if (section.type === SECTIONTYPE.DASHBOARD) {
    fillContentForDashboard();
    loadPlaylists();
  } else if (section.type === SECTIONTYPE.PLAYLIST) {
    fillContentForPlaylist(section.playlist);
  }
  document
    .querySelector(".content")
    .removeEventListener("scroll", onContentScroll);
  document
    .querySelector(".content")
    .addEventListener("scroll", onContentScroll);
};

document.addEventListener("DOMContentLoaded", () => {
const volume = document.querySelector("#volume");
const playButton = document.querySelector("#play");

const songDurationCompleted = document.querySelector(
  "#song-Duration-Completed"
);
const songProgress = document.querySelector("#progress");
const timeline = document.querySelector("#timeline");
let progressInterval;
  loaduserProfile();
  // const section = { type: SECTIONTYPE.DASHBOARD };
  const section = {
    type: SECTIONTYPE.PLAYLIST,
    playlist: "37i9dQZF1DX44osRHySC1k",
  };
  // history.pushState(section, "", "");
  history.pushState(section, "", `/dashboard/playlist/${section.playlist}`);
  loadSection(section);
  document.addEventListener("click", () => {
    const profileMenu = document.querySelector("#profile-menu");
    if (!profileMenu.classList.contains("hidden")) {
      profileMenu.classList.add("hidden");
    }
  });

  audio.addEventListener("play",()=>{
  
    progressInterval = setInterval(() => {
      if (audio.paused) {
        return;
      }
      songDurationCompleted.textContent = `${
        audio.currentTime.toFixed(0) < 10
          ? "0:0" + audio.currentTime.toFixed(0)
          : audio.currentTime.toFixed(0)
      }`;
      songProgress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    }, 100);
  })

  audio.addEventListener("pause",()=>{
    if(progressInterval){
      clearInterval(progressInterval);
    }
  })

  audio.addEventListener("loadedmetadata", AudioMetadataLoaded);
  playButton.addEventListener("click", () => onNowPlayingPlayButtonClicked(id));

  volume.addEventListener("change",()=>{
    audio.volume = volume.value / 100;
  })

  timeline.addEventListener("click",(e)=>{
    const timelineWidth = window.getComputedStyle(timeline).width;
    const timeToSeek = (e.OffsetX / parseInt(timelineWidth)) * audio.duration;
    audio.currentTime = timeToSeek;
    songProgress.style.width = `${(audio.currentTime / audio.duration)*100}%`;
  }, false);
  
  window.addEventListener("popstate", (event) => {
    loadSection(event.state);
  });
});
