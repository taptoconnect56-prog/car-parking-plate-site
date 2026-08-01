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
    "Sticker ID:",
    stickerId
);



// =====================================
// LOAD OWNER
// =====================================

async function loadOwner(){


if(!stickerId){

    ownerName.textContent =
    "Sticker ID Missing";

    vehicleNumber.textContent =
    "Invalid sticker";

    callButton.style.display="none";

    return;

}



try{


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



if(!stickerSnap.exists()){


ownerName.textContent =
"Sticker Not Found";


vehicleNumber.textContent =
stickerId;


callButton.style.display="none";


return;


}



const data =
stickerSnap.data();



if(
String(data.status).toLowerCase()
!=="active"
){


ownerName.textContent =
"Sticker Not Activated";


vehicleNumber.textContent =
stickerId;


callButton.style.display="none";


return;


}



// OWNER NAME

ownerName.textContent =
data.name || 
"Vehicle Owner";



// VEHICLE

vehicleNumber.textContent =
data.vehicle ||
"Vehicle Number";





// MOBILE

const mobile =
String(data.mobile || "")
.replace(/\D/g,"");



if(!mobile){


callButton.style.display="none";

return;


}





// =====================================
// MASKED CALL
// =====================================


callButton.onclick =
async function(e){


e.preventDefault();



callButton.innerHTML =
"Connecting...";


callButton.disabled=true;



try{


const response =
await fetch(
"/api/exotel",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},


body:JSON.stringify({

stickerId:
stickerId,


ownerMobile:
mobile


})


}

);



const result =
await response.json();



console.log(
"Exotel:",
result
);



if(result.success){


alert(
"Connecting call..."
);


}

else{


alert(
"Call failed. Try again."
);


}



}
catch(error){


console.error(
error
);


alert(
"Unable to connect call"
);


}



finally{


callButton.innerHTML =
"📞 Call Owner";


callButton.disabled=false;


}



};



callButton.style.display =
"inline-block";



}
catch(error){


console.error(
"Owner load error",
error
);


ownerName.textContent =
"Error Loading";


vehicleNumber.textContent =
"Try again later";


callButton.style.display =
"none";


}



}



loadOwner();