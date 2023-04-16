import { fetchRequest } from "../api";
import { ENDPOINT, SECTIONTYPE, logout } from "../common";

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
  const {
    playlists: { items },
  } = await fetchRequest(endpoint);
  const playlistItemsSection = document.querySelector(`#${elementId}`);

  for (let { name, description, images, id } of items) {
    const playlistItem = document.createElement("section");
    playlistItem.className =
      "bg-black-secondary rounded p-4  hover:cursor-pointer hover:bg-light-black";
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

const loadPlaylistTracks =({tracks})=>{
const trackSections = document.querySelector("#tracks");
for(let trackItem of tracks.items){
  let{id, artists, name , album , duration_ms} = trackItem;
  let track = document.createElement("section");
  track.className = "track p-1 grid grid-cols-[50px_2fr_1fr_50px] items-center justify-items-start gap-4 text-secondary rounded-md hover: bg-light-black";
  let image = album.images.find(img=>img.height === 64);
  track.innerHTML =` <section
  <p class="justify-self-center">1</p>
  <section class="grid grid-cols-2 gap-2">
    <img class="h-8 w-8" src="${img.url}" alt="${name}" />
    <article class="flex flex-col gap-1">
      <h2 class="text-xl text-white">${name}</h2>
      <p class="text-sm">${Array.from(artists, artist=>artist.name)}</p>
    </article>
  </section>
  <p>album</p>
  <p>1:36</p>
</section>  `
}
}

const fillContentForPlaylist = async (playlistId) => {
  const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
  const pageContent = document.querySelector("#page-content");
  pageContent.innerHTML=`   <header class="px-8">
  <nav>
    <ul
      class="track grid grid-cols-[50px_2fr_1fr_50px] items-center justify-items-start gap-4 text-secondary rounded-md ">
      <li class="justify-self-center">#</li>
      <li>Title</li>
      <li>Album</li>
      <li>🕔</li>
    </ul>
  </nav>
</header>
<section class="px-8" id="tracks">
</section>`
document.createElement("section")
loadPlaylistTracks(playlist);
  console.log(playlist);
  
};

const loadSection = (section) => {
  if (section.type === SECTIONTYPE.DASHBOARD) {
    // fillContentForDashboard();
    // loadPlaylists();
  } else if (section.type === SECTIONTYPE.PLAYLIST) {
    fillContentForPlaylist(section.playlist);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loaduserProfile();
  const section = { type: SECTIONTYPE.DASHBOARD };
  history.pushState(section, "", "");
  loadSection(section);
  document.addEventListener("click", () => {
    const profileMenu = document.querySelector("#profile-menu");
    if (!profileMenu.classList.contains("hidden")) {
      profileMenu.classList.add("hidden");
    }
  });
  document.querySelector(".content").addEventListener("scroll", (event) => {
    const { scrollTop } = event.target;
    const header = document.querySelector(".header");
    if (scrollTop >= header.offsetHeight) {
      header.classList.add("sticky", "top-0", "bg-black-secondary");
      header.classList.remove("bg-transparent");
    } else {
      header.classList.remove("sticky", "top-0", "bg-black-secondary");
      header.classList.add("bg-transparent");
    }
  });
  window.addEventListener("popstate", (event) => {
    loadSection(event.state);
  });
});
