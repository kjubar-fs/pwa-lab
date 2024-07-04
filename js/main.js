/*
 *  Author: Kaleb Jubar
 *  Created: 23 May 2024, 5:07:07 PM
 *  Last update: 4 Jul 2024, 11:58:29 AM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import songDB from "./song-db/song-db.js";

// register the service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
}

// setup Firebase connections
initFirebaseAndDB();

// get the initial song list
// TODO: make the list refreshing reactive to any DB changes,
//       regardless of where they come from (this app or outside)
songDB.getAll().then(displaySongs).catch((err) => {
    displayError("Error getting song list:", err);
});

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
        displayError("");
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
            displayError("");
        }).catch((err) => {
            displayError("Error liking song:", err);
        });
    });

    // add to likes div
    const likesDiv = card.querySelector(".likes");
    likesDiv.appendChild(likeCounter);
    likesDiv.appendChild(likeBtn);
    
    // add a close handler to the button to remove the card from the DOM
    const deleteBtn = card.lastChild;
    const playlist = getElID("playlistContainer");
    deleteBtn.addEventListener("click", () => {
        if (confirm(`Are you sure you wish to delete ${title}?`)) {
            songDB.delete(id).then(() => {
                // remove the card from the playlist
                playlist.removeChild(card);

                // hide any errors
                displayError("");
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
    for (let song of songList) {
        createSongCard(song.id, song.title, song.artist, song.likes);
    }
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
        displayError("");
    } catch(err) {
        displayError("Error connecting to Firebase:", err);
        return;
    }

    // initialize DB
    songDB.open(app)
        .then(() => { displayError(""); })
        .catch((err) => {
            displayError("Error opening database:", err);
        });
}

/**
 * Show an error on the page, or hide the display if an empty title is provided
 * @param {(string | null)} title Error title, or ""/null to hide
 * @param {(string | null)} errMsg Error to display
 */
function displayError(title, errMsg) {
    const errorsElem = getElID("errors");
    if (title) {
        getElID("errTitle").innerText = title;
        getElID("errMsg").innerText = errMsg;
        errorsElem.classList.remove("hidden");
    } else {
        errorsElem.classList.add("hidden");
    }
}