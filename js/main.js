/*
 *  Author: Kaleb Jubar
 *  Created: 23 May 2024, 5:07:07 PM
 *  Last update: 15 Jul 2024, 3:57:31 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import songDB from "./song-db/song-db.js";
import { enableNav } from "./nav.js";
import { getElID, displayError, clearMessage } from "./util.js";

// register the service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
}

// run initial online/offline setup
if (!navigator.onLine) {
    goOffline();
} else {
    goOnline();
}

// add handlers for network status change to enable/disable app
window.addEventListener("offline", () => {
    goOffline();
});
window.addEventListener("online", () => {
    goOnline();
});

enableNav();

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

    // TODO: store user's add order to load in the initial order, not by key
    songDB.add(title, artist).then((song) => {
        // make a card for the song in the playlist
        createSongCard(song.id, title, artist, 0);
    
        // clear the inputs to make the workflow faster
        titleInput.value = "";
        artistInput.value = "";
    
        // if focus is on the artist field (the user hit enter to submit), move focus to the title field
        // keeps keyboard-only workflows easy
        if (document.activeElement.id === "artistName") {
            titleInput.focus();
        }

        // clear errors
        clearMessage();
    }).catch((err) => {
        displayError("Error adding song:", err);
    });
}
getElID("addSong").addEventListener("click", addSong);

// TODO: add sorting by title, artist, number of likes, and user order

/**
 * Given information about a song, create a card for it
 * and add it to the playlist in the DOM
 * @param {string} id song ID
 * @param {string} title song title
 * @param {string} artist song artist
 * @param {number} likes number of song likes
 */
function createSongCard(id, title, artist, likes) {
    // create <li> element for the card
    const card = document.createElement("li");
    card.id = id;
    card.className = "card";
    // TODO: make the header a link to Spotify using an API
    card.innerHTML =
        `<h3>${title}</h3>
        <div class="song-details">
            <p class="text-muted">${artist}</p>
            <div class="likes"></div>
        </div>
        <button class="card-close">X</button>`;
    
    // add the like button and counter to the song card
    const likeBtn = document.createElement("img");
    likeBtn.id = `${id}LikeBtn`;
    likeBtn.src = "images/like.png";
    likeBtn.className = "like-icon";
    // mousedown/up to change the icon
    // use anon functions instead of arrow functions here so that
    // we bind to the HTML element raising the event, not window
    likeBtn.addEventListener("mousedown", function () {
        this.src = "images/like_highlight.png";
    });
    likeBtn.addEventListener("mouseup", function () {
        this.src = "images/like.png";
    });

    const likeCounter = document.createElement("p");
    likeCounter.id = `${id}Likes`;
    likeCounter.innerText = likes;

    // click to increment the counter
    likeBtn.addEventListener("click", () => {
        // get the current likes and increment
        // realistically, this should come from the DB and not our DOM
        // but for this app it works fine
        let curLikes = Number(likeCounter.innerText);
        curLikes++;

        // update in database
        songDB.update(id, { likes: curLikes }).then(() => {
            // update counter on screen
            likeCounter.innerText = curLikes;

            // hide any errors
            clearMessage();
        }).catch((err) => {
            displayError("Error liking song:", err);
        });
    });

    // add to likes div
    const likesDiv = card.querySelector(".likes");
    likesDiv.appendChild(likeCounter);
    likesDiv.appendChild(likeBtn);
    
    // add a delete handler to the button to remove the card from the DOM
    const deleteBtn = card.lastChild;
    const playlist = getElID("playlistContainer");
    deleteBtn.addEventListener("click", () => {
        // TODO: make a custom modal for confirmation
        if (confirm(`Are you sure you wish to delete ${title}?`)) {
            songDB.delete(id).then(() => {
                // remove the card from the playlist
                playlist.removeChild(card);

                // hide any errors
                clearMessage();
            }).catch((err) => {
                displayError(`Error deleting ${title}:`, err);
            });
        }
    });
    
    // append card to the playlist
    playlist.appendChild(card);
}

/**
 * Renders cards for the given list of songs
 * @param {any[]} songList list of songs to display
 */
function displaySongs(songList) {
    getElID("playlistContainer").innerHTML = "";

    if (!songList || songList.length === 0) {
        return;
    }

    for (let song of songList) {
        createSongCard(song.id, song.title, song.artist, song.likes);
    }
}

/**
 * Enables or disables the form controls
 * @param {boolean} enabled whether or not to enable the form
 */
function setFormEnabled(enabled) {
    getElID("songName").disabled = !enabled;
    getElID("artistName").disabled = !enabled;
    getElID("addSong").disabled = !enabled;
}

/**
 * Set up the app for usage
 * Run this every time the app comes online
 */
function setupApp() {
    // setup Firebase connections
    initFirebaseAndDB();
    
    // get the initial song list
    // TODO: make the list refresh reactively to any DB changes,
    //       regardless of where they come from (this app or outside)
    songDB.getAll().then(displaySongs).catch((err) => {
        displayError("Error getting song list:", err);
    });
}

/**
 * Create a Firebase connection and initialize the database
 */
function initFirebaseAndDB() {
    // initialize Firebase
    let app;
    try {
        const firebaseConfig = {
            apiKey: "AIzaSyAxYESDPqFHcUs5tIGZ2yiJiD-dX_fg0-k",
            authDomain: "info6128-1207020.firebaseapp.com",
            projectId: "info6128-1207020",
            storageBucket: "info6128-1207020.appspot.com",
            messagingSenderId: "166483613685",
            appId: "1:166483613685:web:ecd87a7e7f7fc2ff5f72bc"
        };
        app = initializeApp(firebaseConfig);
        clearMessage();
    } catch(err) {
        displayError("Error connecting to Firebase:", err);
        return;
    }

    // initialize DB
    songDB.open(app)
        .then(() => {
            clearMessage();
        })
        .catch((err) => {
            displayError("Error opening database:", err);
        });
}

/**
 * Disable app functionality when going offline
 */
function goOffline() {
    // disable the form and clear the playlist
    setFormEnabled(false);
    displaySongs();

    // display an offline message
    displayError("You're offline!", "Find the internet to continue.");

    // close the DB connection
    songDB.close();
}

/**
 * Enable app functionality when going online
 */
function goOnline() {
    // reestablish Firebase connection and DB
    setupApp();

    // enable the form and clear the offline message
    setFormEnabled(true);
    clearMessage();

    // TODO: add a toast for connection coming online
}