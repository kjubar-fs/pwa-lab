/*
 *  Author: Kaleb Jubar
 *  Created: 23 May 2024, 5:07:07 PM
 *  Last update: 4 Jul 2024, 9:20:53 AM
 *  Copyright (c) 2024 Kaleb Jubar
 */

// register the service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
}

let idCounter = 0;
let songLikes = {};

// create and attach click handler for submit button
/**
 * Retrieve the user's song information from the form, validate it,
 * show errors if invalid, or add a card to the playlist if valid
 * 
 * @param {MouseEvent} event click event from DOM
 */
function addSong(event) {
    // prevent refreshing the page
    event.preventDefault();

    // get title and artist from form
    const titleInput = getElID("songName");
    const title = titleInput.value.trim();
    const artistInput = getElID("artistName");
    const artist = artistInput.value.trim();

    // check if input is valid
    let hasError = false;
    const titleLabel = getElID("songNameLabel");
    const artistLabel = getElID("artistNameLabel");
    if (!title) {
        // set flag
        hasError = true;

        // show error about title
        titleLabel.classList.add("invalid");
    } else {
        // clear the error
        titleLabel.classList.remove("invalid");
    }
    if (!artist) {
        // set flag
        hasError = true;

        // show error about artist
        artistLabel.classList.add("invalid");
    } else {
        // clear the error
        artistLabel.classList.remove("invalid");
    }
    if (hasError) return;

    // if we get here, we can make a card for the song in the playlist
    createSongCard(title, artist);

    // clear the inputs to make the workflow faster
    titleInput.value = "";
    artistInput.value = "";

    // if focus is on the artist field (the user hit enter to submit), move focus to the title field
    // keeps keyboard-only workflows easy
    if (document.activeElement.id === "artistName") {
        titleInput.focus();
    }
}
getElID("addSong").addEventListener("click", addSong);

/**
 * Given information about a song, create a card for it
 * and add it to the playlist in the DOM
 * @param {string} title song title
 * @param {string} artist song artist
 */
function createSongCard(title, artist) {
    // set up the initial song likes
    const songID = `song${idCounter}`;
    songLikes[songID] = 0;

    // create <li> element for the card
    const card = document.createElement("li");
    card.id = songID;
    card.className = "card";
    card.innerHTML =
        `<h3>${title}</h3>
        <div class="song-details">
            <p class="text-muted">${artist}</p>
            <div class="likes"></div>
        </div>
        <button class="card-close">X</button>`;
    
    // add the like button and counter to the song card
    const likeBtn = document.createElement("img");
    likeBtn.id = `${songID}LikeBtn`;
    likeBtn.src = "images/like.png";
    likeBtn.className = "like-icon";
    // mousedown/up to change the icon
    likeBtn.addEventListener("mousedown", function () {
        this.src = "images/like_highlight.png";
    });
    likeBtn.addEventListener("mouseup", function () {
        this.src = "images/like.png";
    });

    const likeCounter = document.createElement("p");
    likeCounter.id = `${songID}Likes`;
    likeCounter.innerText = songLikes[songID];

    // click to increment the counter
    likeBtn.addEventListener("click", () => {
        songLikes[songID]++;
        likeCounter.innerText = songLikes[songID];
    });

    // add to likes div
    const likesDiv = card.querySelector(".likes");
    likesDiv.appendChild(likeCounter);
    likesDiv.appendChild(likeBtn);
    
    // add a close handler to the button to remove the card from the DOM
    const closeBtn = card.lastChild;
    const playlist = getElID("playlistContainer");
    closeBtn.addEventListener("click", () => {
        playlist.removeChild(card);
    });
    
    // append card to the playlist
    playlist.appendChild(card);

    // increment number of songs
    idCounter++;
}

/**
 * Given the ID of a DOM element, find that element
 * Wrapper for getElementById to make code less verbose
 * @param {string} id element ID to search for
 * @returns an Element reference found in the DOM, or null if not found
 */
function getElID(id) {
    return document.getElementById(id);
}