/* =====================================================
   Tap to Connect
   Firebase Configuration
===================================================== */

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* =====================================================
   Firebase Config
===================================================== */

const firebaseConfig = {

    apiKey: "AIzaSyAoMiVcl1llAgeZZIlUxPHNNPViiJE5mr8",

    authDomain: "tap-to-connect-542b7.firebaseapp.com",

    databaseURL:
    "https://tap-to-connect-542b7-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId: "tap-to-connect-542b7",

    storageBucket:
    "tap-to-connect-542b7.firebasestorage.app",

    messagingSenderId: "759274925578",

    appId:
    "1:759274925578:web:ea3350300a41c6f7f1f9f3"

};


/* =====================================================
   Initialize Firebase
===================================================== */

const app = initializeApp(firebaseConfig);


/* =====================================================
   Firestore
===================================================== */

const db = getFirestore(app);


/* =====================================================
   Authentication
===================================================== */

const auth = getAuth(app);


/* =====================================================
   Export
===================================================== */

export {
    db,
    auth
};