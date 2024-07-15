/*
 *  Author: Kaleb Jubar
 *  Created: 15 Jul 2024, 2:19:25 PM
 *  Last update: 15 Jul 2024, 2:37:32 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import { getElID } from "./util.js";

/**
 * Toggle the navigation drawer.
 */
function toggleNavDrawer() {
    const drawer = getElID("navDrawer");
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
    getElID("navBurger").addEventListener("click", toggleNavDrawer);
}