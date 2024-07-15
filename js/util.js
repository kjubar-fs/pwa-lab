/*
 *  Author: Kaleb Jubar
 *  Created: 15 Jul 2024, 2:36:24 PM
 *  Last update: 15 Jul 2024, 3:54:37 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */

const MSG_TYPES = Object.freeze({
    standard: 0,
    error: 1,
    clear: 2,
});

/**
 * Given the ID of a DOM element, find that element
 * Wrapper for getElementById to make code less verbose
 * @param {string} id element ID to search for
 * @returns an Element reference found in the DOM, or null if not found
 */
export function getElID(id) {
    return document.getElementById(id);
}

export function displayMessage(title, msg) {
    displayMessageInternal(MSG_TYPES.standard, title, msg);
}

/**
 * Show an error on the page
 * @param {(string | null)} title Error title
 * @param {(string | null)} errMsg Error to display
 */
export function displayError(title, errMsg) {
    displayMessageInternal(MSG_TYPES.error, title, errMsg);
}

export function clearMessage() {
    displayMessageInternal(MSG_TYPES.clear);
}

/**
 * Display a message on the page, or hide if the proper type is set
 * @param {number} type enum value from MSG_TYPES defining message type
 * @param {(string | null)} title message title
 * @param {(string | null)} msg message to display
 */
function displayMessageInternal(type, title, msg) {
    console.log("showing message: ", type, title, msg);
    const msgElem = getElID("messages");

    // clear message if necessary
    if (type === MSG_TYPES.clear) {
        msgElem.classList.add("hidden");
        return;
    }
    
    // set message info
    getElID("msgTitle").innerText = title;
    getElID("msgDesc").innerText = msg;

    // set style based on type
    if (type === MSG_TYPES.error) {
        msgElem.classList.add("error");
    } else {
        msgElem.classList.remove("error");
    }

    // show message
    msgElem.classList.remove("hidden");
}