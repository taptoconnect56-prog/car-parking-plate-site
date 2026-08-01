import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ========================================
// ADMIN LOGIN CHECK
// ========================================

auth.onAuthStateChanged((user) => {

    if (!user) {

        window.location.href = "login.html";

    }

});


// ========================================
// ELEMENTS
// ========================================

const createBtn =
    document.getElementById("createBtn");

const cleanBtn =
    document.getElementById("cleanBtn");

const stickerInput =
    document.getElementById("stickerCount");

const table =
    document.getElementById("stickerTable");


// ========================================
// PROCESS LOCK
// ========================================

let processing = false;


// ========================================
// LOAD STICKERS
// ========================================

async function loadStickers() {

    table.innerHTML = "";

    try {

        const snapshot =
            await getDocs(
                collection(db, "stickers")
            );


        const records = [];


        snapshot.forEach((item) => {

            records.push({

                id: item.id,

                data: item.data()

            });

        });


        // Sort Sticker IDs
        records.sort((a, b) => {

            const idA =
                a.data.stickerId || "";

            const idB =
                b.data.stickerId || "";


            return idA.localeCompare(
                idB,
                undefined,
                {
                    numeric: true
                }
            );

        });


        records.forEach((record) => {

            const data =
                record.data;


            const stickerId =
                data.stickerId ||
                record.id;


            const name =
                data.name || "-";


            const vehicle =
                data.vehicle || "-";


            const mobile =
                data.mobile || "-";


            const status =
                data.status || "available";


            const statusClass =
                status === "active"
                    ? "status-active"
                    : "status-available";


            table.innerHTML += `

                <tr>

                    <td>
                        ${stickerId}
                    </td>

                    <td>
                        ${name}
                    </td>

                    <td>
                        ${vehicle}
                    </td>

                    <td>
                        ${mobile}
                    </td>

                    <td class="${statusClass}">
                        ${status}
                    </td>

                </tr>

            `;

        });


    } catch (error) {

        console.error(
            "Load stickers error:",
            error
        );

        alert(
            "Could not load stickers:\n" +
            error.message
        );

    }

}


// ========================================
// CLEAN DUPLICATES
// ========================================

async function cleanDuplicates() {


    if (processing) return;


    const confirmClean =
        confirm(

            "Clean duplicate TC001-TC500 records?\n\n" +

            "One record will be kept for each Sticker ID.\n\n" +

            "Activated stickers will be preserved."

        );


    if (!confirmClean) {

        return;

    }


    processing = true;


    cleanBtn.disabled = true;

    cleanBtn.textContent =
        "Cleaning...";


    try {


        const snapshot =
            await getDocs(
                collection(db, "stickers")
            );


        const groups = {};


        // Group TC001-TC500
        snapshot.forEach((item) => {

            const data =
                item.data();


            const stickerId =
                data.stickerId;


            if (!stickerId) {

                return;

            }


            // Only numbered stickers
            if (
                !/^TC\d{3}$/.test(
                    stickerId
                )
            ) {

                return;

            }


            if (
                !groups[stickerId]
            ) {

                groups[stickerId] = [];

            }


            groups[stickerId].push({

                id: item.id,

                data: data

            });

        });


        let deleted = 0;


        // Process every duplicate group
        for (
            const stickerId in groups
        ) {


            const records =
                groups[stickerId];


            if (
                records.length <= 1
            ) {

                continue;

            }


            // Keep active record first
            let keep =
                records.find(
                    record =>
                        record.data.status ===
                        "active"
                );


            // If no active record,
            // keep first record
            if (!keep) {

                keep = records[0];

            }


            // Delete duplicates
            for (
                const record of records
            ) {


                if (
                    record.id ===
                    keep.id
                ) {

                    continue;

                }


                await deleteDoc(

                    doc(
                        db,
                        "stickers",
                        record.id
                    )

                );


                deleted++;

            }

        }


        alert(

            deleted +
            " duplicate sticker record(s) removed."

        );


        await loadStickers();


    } catch (error) {


        console.error(
            "Cleanup error:",
            error
        );


        alert(

            "Cleanup failed:\n" +
            error.message

        );


    } finally {


        processing = false;


        cleanBtn.disabled =
            false;


        cleanBtn.textContent =
            "Clean Duplicates";

    }

}


// ========================================
// CONNECT REAL CLEANUP TO BUTTON
// ========================================

cleanBtn.addEventListener(
    "click",
    cleanDuplicates
);


// ========================================
// GENERATE STICKERS
// ========================================

createBtn.addEventListener(
    "click",
    async () => {


        if (processing) return;


        const count =
            Number(
                stickerInput.value
            );


        if (
            !count ||
            count < 1 ||
            count > 500
        ) {


            alert(
                "Enter a number between 1 and 500."
            );


            return;

        }


        processing = true;


        createBtn.disabled =
            true;


        createBtn.textContent =
            "Processing...";


        try {


            const snapshot =
                await getDocs(
                    collection(
                        db,
                        "stickers"
                    )
                );


            const existingIds =
                new Set();


            snapshot.forEach(
                (item) => {

                    const data =
                        item.data();


                    if (
                        data.stickerId
                    ) {

                        existingIds.add(
                            data.stickerId
                        );

                    }

                }
            );


            let created = 0;


            for (
                let i = 1;
                i <= count;
                i++
            ) {


                const stickerId =
                    "TC" +
                    String(i)
                        .padStart(
                            3,
                            "0"
                        );


                // Skip existing ID
                if (
                    existingIds.has(
                        stickerId
                    )
                ) {

                    continue;

                }


                await addDoc(

                    collection(
                        db,
                        "stickers"
                    ),

                    {

                        stickerId:
                            stickerId,

                        name:
                            "",

                        vehicle:
                            "",

                        mobile:
                            "",

                        status:
                            "available",

                        createdAt:
                            new Date()

                    }

                );


                existingIds.add(
                    stickerId
                );


                created++;

            }


            alert(

                created +
                " new sticker(s) created."

            );


            stickerInput.value = "";


            await loadStickers();


        } catch (error) {


            console.error(
                "Sticker creation error:",
                error
            );


            alert(

                "Sticker creation failed:\n" +
                error.message

            );


        } finally {


            processing = false;


            createBtn.disabled =
                false;


            createBtn.textContent =
                "Generate";

        }

    }
);


// ========================================
// DASHBOARD BUTTON
// ========================================

window.goBack = function () {

    window.location.href =
        "admin.html";

};


// ========================================
// INITIAL LOAD
// ========================================

loadStickers();