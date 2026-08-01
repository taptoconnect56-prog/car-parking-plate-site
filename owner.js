import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================
// ELEMENTS
// =====================================

const ownerName =
    document.getElementById("ownerName");

const vehicleNumber =
    document.getElementById("vehicleNumber");

const callButton =
    document.getElementById("callButton");


// =====================================
// GET STICKER ID
// =====================================

const params =
    new URLSearchParams(
        window.location.search
    );


const stickerId =
    (
        params.get("sticker") ||
        params.get("stickerId") ||
        ""
    )
    .trim()
    .toUpperCase();


console.log(
    "Owner page sticker:",
    stickerId
);


// =====================================
// LOAD OWNER
// =====================================

async function loadOwner() {


    // ---------------------------------
    // CHECK STICKER ID
    // ---------------------------------

    if (!stickerId) {

        ownerName.textContent =
            "Sticker ID Missing";

        vehicleNumber.textContent =
            "Please scan a valid Tap to Connect sticker.";

        callButton.style.display =
            "none";

        return;

    }


    try {


        // ---------------------------------
        // GET FIRESTORE DOCUMENT
        // ---------------------------------

        const stickerRef =
            doc(
                db,
                "stickers",
                stickerId
            );


        const stickerSnap =
            await getDoc(
                stickerRef
            );


        console.log(
            "Sticker exists:",
            stickerSnap.exists()
        );


        // ---------------------------------
        // NOT FOUND
        // ---------------------------------

        if (!stickerSnap.exists()) {

            ownerName.textContent =
                "Sticker Not Found";

            vehicleNumber.textContent =
                "Sticker ID: " +
                stickerId;

            callButton.style.display =
                "none";

            return;

        }


        // ---------------------------------
        // GET DATA
        // ---------------------------------

        const data =
            stickerSnap.data();


        console.log(
            "Owner data:",
            data
        );


        // ---------------------------------
        // CHECK STATUS
        // ---------------------------------

        if (
            String(data.status)
                .toLowerCase() !==
            "active"
        ) {

            ownerName.textContent =
                "Sticker Not Activated";

            vehicleNumber.textContent =
                "Sticker ID: " +
                stickerId;

            callButton.style.display =
                "none";

            return;

        }


        // ---------------------------------
        // OWNER NAME
        // ---------------------------------

        ownerName.textContent =
            data.name ||
            "Vehicle Owner";


        // ---------------------------------
        // VEHICLE NUMBER
        // ---------------------------------

        vehicleNumber.textContent =
            data.vehicle ||
            "Vehicle Number Not Available";


        // ---------------------------------
        // MOBILE NUMBER
        // ---------------------------------

        const mobile =
            String(
                data.mobile ||
                ""
            )
            .replace(
                /\D/g,
                ""
            );


        if (!mobile) {

            callButton.style.display =
                "none";

            return;

        }


        // ---------------------------------
        // CALL OWNER
        // ---------------------------------

        callButton.href =
            "tel:+91" + mobile;


        // ---------------------------------
        // SHOW BUTTON
        // ---------------------------------

        callButton.style.display =
            "inline-block";


        console.log(
            "Owner page loaded successfully"
        );


    } catch (error) {


        console.error(
            "Owner page error:",
            error
        );


        ownerName.textContent =
            "Unable to Load";


        vehicleNumber.textContent =
            "Please try again later.";


        callButton.style.display =
            "none";

    }

}


// =====================================
// START
// =====================================

loadOwner();