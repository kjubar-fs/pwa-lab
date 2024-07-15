/*
 *  Author: Kaleb Jubar
 *  Created: 15 Jul 2024, 2:36:24 PM
 *  Last update: 15 Jul 2024, 2:37:57 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */

/**
 * Given the ID of a DOM element, find that element
 * Wrapper for getElementById to make code less verbose
 * @param {string} id element ID to search for
 * @returns an Element reference found in the DOM, or null if not found
 */
export function getElID(id) {
    return document.getElementById(id);
}

/**
 * Show an error on the page, or hide the display if an empty title is provided
 * @param {(string | null)} title Error title, or ""/null to hide
 * @param {(string | null)} errMsg Error to display
 */
export function displayError(title, errMsg) {
    const errorsElem = getElID("errors");
    if (title) {
        getElID("errTitle").innerText = title;
        getElID("errMsg").innerText = errMsg;
        errorsElem.classList.remove("hidden");
    } else {
        errorsElem.classList.add("hidden");
    }
}