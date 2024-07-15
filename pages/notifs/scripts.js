/*
 *  Author: Kaleb Jubar
 *  Created: 15 Jul 2024, 2:17:09 PM
 *  Last update: 15 Jul 2024, 2:50:46 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import { enableNav } from "../../js/nav.js";
import { getElID } from "../../js/util.js";

enableNav();

function showNotif(event) {
    // prevent refreshing the page
    event.preventDefault();

    // get title and desc from form
    const titleInput = getElID("notifTitle");
    const title = titleInput.value.trim();
    const descInput = getElID("notifDesc");
    const desc = descInput.value.trim();

    // check if input is valid
    let hasError = false;
    const titleLabel = getElID("notifTitleLabel");
    const descLabel = getElID("notifDescLabel");
    if (!title) {
        // set flag
        hasError = true;

        // show error about title
        titleLabel.classList.add("invalid");
    } else {
        // clear the error
        titleLabel.classList.remove("invalid");
    }
    if (!desc) {
        // set flag
        hasError = true;

        // show error about artist
        descLabel.classList.add("invalid");
    } else {
        // clear the error
        descLabel.classList.remove("invalid");
    }
    if (hasError) return;

    console.log(title, ", ", desc);
}
getElID("showNotif").addEventListener("click", showNotif);