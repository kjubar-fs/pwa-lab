/*
 *  Author: Kaleb Jubar
 *  Created: 5 Jun 2024, 1:24:13 PM
 *  Last update: 4 Jul 2024, 11:17:53 AM
 *  Copyright (c) 2024 Kaleb Jubar
 */
const version = "1"
const cacheName = `cacheAssets-v${version}`;

/**
 * On Install event.
 * Builds the static cache.
 */
self.addEventListener("install", (event) => {
    // skip waiting for other tabs to be closed
    self.skipWaiting();

    // generate the static cache
    // wait until we store everything in the cache before activating
    event.waitUntil(
        caches.open(cacheName)
            .then((cache) => {
                cache.addAll([
                    // HTML
                    "/",
                    "/index.html",

                    // we could include styles, scripts, images, and icons here
                    // but for the sake of demo, I'll leave them out of the static cache
                    
                    // PWA manifest
                    "/manifest.json",
                ]);
            })
    );
});

/**
 * On Activate event.
 * Claims open pages for the current worker and deletes old caches.
 */
self.addEventListener("activate", (event) => {
    // claim all uncontrolled open pages
    event.waitUntil(clients.claim());

    // delete any old caches if the version updates
    event.waitUntil(caches.keys().then((cacheNames) => {
        return Promise.all(
            // filter down to all caches but the current version
            cacheNames.filter(item => item !== cacheName)
                // and then delete them
                .map(item => caches.delete(item))
        );
    }));
});

/**
 * On Fetch event.
 * Triggered when the service worker retrieves an asset.
 */
self.addEventListener("fetch", (event) => {
    // this code uses cache strategy: Stale While Revalidate
    
    // only cache things from URLs starting with http
    // this makes us not attempt to cache things like chrome extensions,
    // react devtools, etc.
    if (event.request.url.startsWith("http") && event.request.method === "GET") {
        // a variant of the code given in the demo video using an async IIFE
        // and await instead of .then().catch()
        event.respondWith((async () => {
            // get the cache and response from the cache
            const cache = await caches.open(cacheName);
            // cache.match() can return undefined so we don't need a .catch() to handle match failing
            const cachedResp = await cache.match(event.request);

            // check for an updated version of the page
            // need a .catch() to return undefined in the event the fetch fails
            // this will only explicitly fail if the user is offline
            // non-success HTTP responses (like 404, 500) still return a response object
            // if we needed to handle other HTTP responses,
            // we'd need to check that first before storing in the cache
            let fetchedResp = await fetch(event.request).catch(() => undefined);
            // if we got a response, clone it (so it doesn't disappear) and cache it
            if (fetchedResp) {
                cache.put(event.request, fetchedResp.clone());
            }
            // if we had an offline page, we could return that from the static cache
            // here if the fetch fails

            // if we had a cached copy of the resource, return it
            // otherwise return whatever we fetched
            return cachedResp || fetchedResp;
        })());
    } else {
        event.respondWith(fetch(event.request));
    }
});