import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const message =
    document.getElementById("message");


// Get sticker ID from URL

const params =
    new URLSearchParams(
        window.location.search
    );


const stickerId =
    params.get("sticker");



if (!stickerId) {

    message.innerHTML =
        "Invalid Sticker";

}
else {


    findSticker(stickerId);


}



async function findSticker(id) {


    try {


        const q =
            query(

                collection(
                    db,
                    "stickers"
                ),

                where(
                    "stickerId",
                    "==",
                    id
                )

            );



        const snapshot =
            await getDocs(q);



        if (
            snapshot.empty
        ) {


            message.innerHTML =
                "Sticker not found";


            return;

        }



        let stickerData;



        snapshot.forEach(
            (doc)=>{

                stickerData =
                    doc.data();

            }
        );



        // Open owner page

        window.location.href =
            "owner.html?sticker=" +
            encodeURIComponent(id);



    }
    catch(error){


        console.error(
            error
        );


        message.innerHTML =
            "Something went wrong";


    }


}