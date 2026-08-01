import { db, auth } from "./firebase.js";


import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



// Check Admin Login

auth.onAuthStateChanged((user)=>{

    if(!user){

        window.location.href="login.html";

    }

});



// Load Sticker Data

async function loadData(){


    const table = document.getElementById("userTable");


    let total = 0;
    let active = 0;



    try{


        const querySnapshot = await getDocs(
            collection(db,"stickers")
        );



        querySnapshot.forEach((doc)=>{


            const data = doc.data();


            total++;


            if(data.status === "active"){

                active++;

            }



            table.innerHTML += `

            <tr>

            <td>
            ${data.stickerId || doc.id}
            </td>


            <td>
            ${data.name || "-"}
            </td>


            <td>
            ${data.vehicle || "-"}
            </td>


            <td>
            ${data.mobile || "-"}
            </td>


            <td>
            ${data.status || "active"}
            </td>


            </tr>

            `;



        });



        document.getElementById("totalCount").innerHTML = total;

        document.getElementById("activeCount").innerHTML = active;

        document.getElementById("userCount").innerHTML = total;



    }
    catch(error){

        console.log(error);

    }


}



// Logout

document
.getElementById("logoutBtn")
.addEventListener("click",async()=>{


    await signOut(auth);


    window.location.href="login.html";


});




// Start

loadData();