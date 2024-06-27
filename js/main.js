/*
 *  Author: Kaleb Jubar
 *  Created: 23 May 2024, 5:07:07 PM
 *  Last update: 5 Jun 2024, 1:25:02 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */

// register the service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
}

let idCounter = 0;

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
    // create <li> element for the card
    const card = document.createElement("li");
    card.id = `song-${idCounter++}`;    // set unique ID from counter and increment
    card.className = "card";
    card.innerHTML =
        `<h3>${title}</h3>
        <p class="text-muted">${artist}</p>
        <button class="card-close">X</button>`;
    
    // add a close handler to the button to remove the card from the DOM
    const closeButton = card.lastChild;
    const playlist = getElID("playlistContainer");
    closeButton.addEventListener("click", () => {
        playlist.removeChild(card);
    });
    
    // append card to the playlist
    playlist.appendChild(card);
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