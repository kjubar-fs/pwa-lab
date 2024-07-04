/*
 *  Author: Kaleb Jubar
 *  Created: 4 Jul 2024, 9:30:51 AM
 *  Last update: 4 Jul 2024, 10:38:34 AM
 *  Copyright (c) 2024 Kaleb Jubar
 */
import {
    getFirestore,
    // collection,
    // doc,
    // addDoc,
    // getDoc,
    // getDocs,
    // query,
    // where,
    // updateDoc,
    // deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

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
}

export default new SongDB();