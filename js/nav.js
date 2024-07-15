/*
 *  Author: Kaleb Jubar
 *  Created: 15 Jul 2024, 2:19:25 PM
 *  Last update: 15 Jul 2024, 2:21:31 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */

/**
 * Toggle the navigation drawer.
 */
function toggleNavDrawer() {
    const drawer = document.getElementById("navDrawer");
    if (!drawer.classList.contains("open")) {
        // open drawer
        drawer.classList.add("open");
    } else {
        // close drawer
        drawer.classList.remove("open");
    }
}

/**
 * Enable the navigation drawer for the current page.
 */
export function enableNav() {
    document.getElementById("navBurger").addEventListener("click", toggleNavDrawer);
}