/*
 *  Author: Kaleb Jubar
 *  Created: 15 Jul 2024, 2:17:09 PM
 *  Last update: 16 Jul 2024, 1:03:08 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import { enableNav } from "../../js/nav.js";
import { clearMessage, displayError, displayMessage, getElID } from "../../js/util.js";

if (!("Notification" in window)) {
    // notifications not supported
    displayError("Warning:", "Your browser does not support notifications. Change browsers to use this feature!");
    disableNotifs();
} else {
    handleNotifPermStatus(Notification.permission);
}

enableNav();

/**
 * Update the UI to reflect the status of the notifications permission.
 * @param {NotificationPermission} status notification permission status
 */
function handleNotifPermStatus(status) {
    if (status === "denied") {
        // notifications denied
        displayError("Warning:", "Notifications have been disabled for this site. Change permissions for this website to use this feature.");
        disableNotifs();
    } else if (status === "granted") {
        // notifications allowed
        setFormShown(true);
    } else {
        // unsure, show just the button
        getElID("allowNotifs").disabled = false;
        setFormShown(false);
    }
}

/**
 * Ask the user for permission to show notifications.
 */
function requestNotifPerms() {
    // ask for permission from the user
    Notification.requestPermission().then((permission) => {
        handleNotifPermStatus(permission);
    });
}
getElID("allowNotifs").addEventListener("click", requestNotifPerms);

/**
 * Toggle whether the form or send notifications button is shown.
 * @param {boolean} showForm true to show the form, false to show the button
 */
function setFormShown(showForm) {
    const notifBtn = getElID("allowNotifs");
    const notifForm = getElID("notifForm");

    if (showForm) {
        notifBtn.classList.add("hidden");
        notifForm.classList.remove("hidden");
    } else {
        notifBtn.classList.remove("hidden");
        notifForm.classList.add("hidden");
    }
}

/**
 * Disable the notifications button and hide the form.
 */
function disableNotifs() {
    console.trace();
    getElID("allowNotifs").disabled = true;
    setFormShown(false);
}

/**
 * Retrieve the user's notification information from the form, validate it,
 * show errors if invalid, or send a notification to the user if valid.
 * 
 * @param {MouseEvent} event click event from DOM
 */
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
    if (!title) {
        // set flag
        hasError = true;

        // show error about title
        titleLabel.classList.add("invalid");
    } else {
        // clear the error
        titleLabel.classList.remove("invalid");
    }
    if (hasError) return;

    // sanity check for permissions and service worker
    if (Notification.permission !== "granted") {
        displayError("Unable to show notification:", "Notifications have been disabled for this site. Change permissions for this website to use this feature.");
        return;
    }
    
    if (!("serviceWorker" in navigator)) {
        displayError("Unable to show notification:", "Service workers are not supported in this browser.");
        return;
    }

    // hide any messages
    clearMessage();

    // have the service worker send a notification
    navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
            body: desc,

            badge: "/images/icons/android-chrome-192x192.png",
            icon: "/images/icons/android-chrome-192x192.png",
            image: "/images/icons/android-chrome-192x192.png",

            actions: [
                {
                    action: "jamagree",
                    title: "Agree",
                },
                {
                    action: "jamdisagree",
                    title: "Disagree",
                }
            ],
        });
    });
}
getElID("showNotif").addEventListener("click", showNotif);

// add listener for messages from the service worker
navigator.serviceWorker.addEventListener('message', (event) => {
    displayMessage("Message from SW:", event.data);
});