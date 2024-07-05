/*
 *  Author: Kaleb Jubar
 *  Created: 4 Jul 2024, 9:30:51 AM
 *  Last update: 5 Jul 2024, 1:44:11 PM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import {
    getFirestore, collection, doc,
    addDoc, getDocs, updateDoc, deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const SONGS_COLL = "SongList";

class SongDB {
    constructor() {
        this.db = null;
        this.isAvailable = false;
    }

    /**
     * Given the root Firebase app, open the songs Firestore
     * @param {any} app Firebase app to open
     * @returns a Promise indicating if the operation was successful
     */
    open(app) {
        return new Promise((resolve, reject) => {
            try {
                // initialize db
                const db = getFirestore(app);
                if (db) {
                    this.db = db;
                    this.isAvailable = true;
                    resolve();
                } else {
                    reject("Database is not available");
                }
            } catch(err) {
                reject(err);
            }
        });
    }

    /**
     * Close the database
     * Used when the app is going offline to disable connection
     * @returns a Promise indicating if the operation was successful (which it always will be)
     */
    close() {
        return new Promise((resolve, _reject) => {
            this.db = null;
            this.isAvailable = false;
            resolve();
        });
    }

    /**
     * Adds a new song to the database
     * @param {string} title song title
     * @param {string} artist song artist
     * @returns a Promise that resolves to the doc returned from addDoc
     */
    add(title, artist) {
        return new Promise((resolve, reject) => {
            // reject if database isn't opened
            if (!this.isAvailable) {
                reject("Database not opened.");
                return;
            }

            // create song object
            const song = {
                title,
                artist,
                likes: 0,   // default to 0 likes
            }

            // get collection for songs
            const coll = collection(this.db, SONGS_COLL);

            // add song to collection
            addDoc(coll, song).then((doc) => {
                resolve(doc);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    /**
     * Gets all songs
     * @returns a Promise that resolves to the results of the query
     */
    getAll() {
        return new Promise((resolve, reject) => {
            // reject if database isn't opened
            if (!this.isAvailable) {
                reject("Database not opened.");
                return;
            }

            // get collection for songs
            const coll = collection(this.db, SONGS_COLL);

            // get all documents in the collection
            getDocs(coll).then((snapshot) => {
                const results = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    data.id = doc.id;
                    results.push(data);
                });
                resolve(results);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    /**
     * Given a song ID and data object, update its values in the database
     * @param {string} id ID of song to update
     * @param {any} updatedSong updated song data
     * @returns a Promise indicating if the operation was successful
     */
    update(id, updatedSong) {
        return new Promise((resolve, reject) => {
            if (!this.isAvailable) {
                reject("Database not opened.");
            }

            // get a reference to the song document to update
            const docRef = doc(this.db, SONGS_COLL, id);

            // update the doc in the collection
            updateDoc(docRef, updatedSong).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    /**
     * Delete the song with the given ID from the database
     * @param {string} id ID of song to delete
     * @returns a Promise indicating if the operation was successful
     */
    delete(id) {
        return new Promise((resolve, reject) => {
            if (!this.isAvailable) {
                reject("Database not opened.");
            }

            // get a reference to the song document to delete
            const docRef = doc(this.db, SONGS_COLL, id);

            // delete the doc
            deleteDoc(docRef).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }
}

// export a new instance of SongDB, rather than the class itself,
// so that every part of the app uses the same DB object
export default new SongDB();