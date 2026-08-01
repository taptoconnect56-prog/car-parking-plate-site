import { db, auth } from "./firebase.js";

import {
    updateDoc,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =====================================
// ELEMENTS
// =====================================

const form = document.getElementById("registerForm");

const nameInput = document.getElementById("name");

const mobileInput = document.getElementById("mobile");

const vehicleInput = document.getElementById("vehicle");

const otpInput = document.getElementById("otp");

const sendOtpBtn = document.getElementById("sendOtpBtn");

const verifyOtpBtn = document.getElementById("verifyOtpBtn");

const activateBtn = document.getElementById("activateBtn");

const otpSection = document.getElementById("otpSection");

const message = document.getElementById("message");

const stickerDisplay =
    document.getElementById("stickerDisplay");


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


// =====================================
// DISPLAY STICKER
// =====================================

stickerDisplay.textContent =
    stickerId || "Not provided";


// =====================================
// MESSAGE
// =====================================

function showMessage(text, type) {

    message.textContent = text;

    message.className =
        "message " + type;
}


// =====================================
// FIND STICKER BY DOCUMENT ID
// =====================================

async function findSticker(id) {

    console.log(
        "Looking for sticker document:",
        id
    );

    const stickerRef =
        doc(
            db,
            "stickers",
            id
        );

    const stickerSnap =
        await getDoc(
            stickerRef
        );


    if (!stickerSnap.exists()) {

        console.log(
            "Sticker document not found:",
            id
        );

        return null;
    }


    console.log(
        "Sticker found:",
        stickerSnap.data()
    );


    return {

        id: stickerSnap.id,

        data: stickerSnap.data()

    };
}


// =====================================
// RECAPTCHA
// =====================================

let recaptchaVerifier = null;

let confirmationResult = null;


try {

    recaptchaVerifier =
        new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {

                size: "normal",

                callback: function () {

                    console.log(
                        "reCAPTCHA verified"
                    );

                },

                "expired-callback": function () {

                    showMessage(
                        "reCAPTCHA expired. Please verify again.",
                        "error"
                    );

                }

            }
        );


    await recaptchaVerifier.render();

} catch (error) {

    console.error(
        "reCAPTCHA error:",
        error
    );

}


// =====================================
// SEND OTP
// =====================================

sendOtpBtn.addEventListener(
    "click",
    async function () {

        console.log(
            "Send OTP clicked"
        );


        if (!stickerId) {

            showMessage(
                "Sticker ID is missing.",
                "error"
            );

            return;
        }


        const name =
            nameInput.value.trim();

        const mobile =
            mobileInput.value.trim();


        if (!name) {

            showMessage(
                "Please enter your name.",
                "error"
            );

            return;
        }


        if (
            !/^[0-9]{10}$/.test(
                mobile
            )
        ) {

            showMessage(
                "Enter a valid 10-digit mobile number.",
                "error"
            );

            return;
        }


        try {


            // =================================
            // FIND TC001
            // =================================

            const sticker =
                await findSticker(
                    stickerId
                );


            if (!sticker) {

                showMessage(
                    "Sticker ID " +
                    stickerId +
                    " was not found in Firebase.",
                    "error"
                );

                return;
            }


            // =================================
            // CHECK STATUS
            // =================================

            if (
                String(
                    sticker.data.status
                ).toLowerCase() ===
                "active"
            ) {

                showMessage(
                    "This sticker is already activated.",
                    "error"
                );

                return;
            }


            // =================================
            // SEND OTP
            // =================================

            sendOtpBtn.disabled =
                true;

            sendOtpBtn.textContent =
                "Sending OTP...";


            const phoneNumber =
                "+91" + mobile;


            confirmationResult =
                await signInWithPhoneNumber(
                    auth,
                    phoneNumber,
                    recaptchaVerifier
                );


            otpSection.style.display =
                "block";


            showMessage(
                "OTP sent to +91 " + mobile,
                "success"
            );


            sendOtpBtn.textContent =
                "OTP Sent";


        } catch (error) {

            console.error(
                "OTP Error:",
                error
            );


            showMessage(
                "OTP could not be sent: " +
                error.message,
                "error"
            );


            sendOtpBtn.disabled =
                false;

            sendOtpBtn.textContent =
                "Send OTP";

        }

    }
);


// =====================================
// VERIFY OTP
// =====================================

verifyOtpBtn.addEventListener(
    "click",
    async function () {

        const otp =
            otpInput.value.trim();


        if (!confirmationResult) {

            showMessage(
                "Please request OTP first.",
                "error"
            );

            return;
        }


        if (
            !/^[0-9]{6}$/.test(
                otp
            )
        ) {

            showMessage(
                "Enter the 6-digit OTP.",
                "error"
            );

            return;
        }


        try {

            verifyOtpBtn.disabled =
                true;

            verifyOtpBtn.textContent =
                "Verifying...";


            await confirmationResult.confirm(
                otp
            );


            showMessage(
                "Mobile number verified successfully!",
                "success"
            );


            activateBtn.disabled =
                false;

            verifyOtpBtn.textContent =
                "Verified";


        } catch (error) {

            console.error(
                "OTP verification error:",
                error
            );


            showMessage(
                "Invalid OTP. Please try again.",
                "error"
            );


            verifyOtpBtn.disabled =
                false;

            verifyOtpBtn.textContent =
                "Verify OTP";

        }

    }
);


// =====================================
// ACTIVATE STICKER
// =====================================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!confirmationResult) {

            showMessage(
                "Please verify your mobile number first.",
                "error"
            );

            return;
        }


        const name =
            nameInput.value.trim();

        const mobile =
            mobileInput.value.trim();

        const vehicle =
            vehicleInput.value
                .trim()
                .toUpperCase();


        if (!name) {

            showMessage(
                "Please enter your name.",
                "error"
            );

            return;
        }


        if (
            !/^[0-9]{10}$/.test(
                mobile
            )
        ) {

            showMessage(
                "Invalid mobile number.",
                "error"
            );

            return;
        }


        if (!vehicle) {

            showMessage(
                "Please enter vehicle number.",
                "error"
            );

            return;
        }


        try {

            activateBtn.disabled =
                true;

            activateBtn.textContent =
                "Activating...";


            // =================================
            // GET TC001 AGAIN
            // =================================

            const sticker =
                await findSticker(
                    stickerId
                );


            if (!sticker) {

                showMessage(
                    "Sticker ID " +
                    stickerId +
                    " was not found.",
                    "error"
                );

                return;
            }


            // =================================
            // UPDATE TC001
            // =================================

            await updateDoc(

                doc(
                    db,
                    "stickers",
                    sticker.id
                ),

                {

                    activated: true,

                    ownerId: mobile,

                    status: "active",

                    name: name,

                    mobile: mobile,

                    vehicle: vehicle,

                    stickerId: stickerId,

                    activatedAt:
                        new Date()

                }

            );


            // =================================
            // SUCCESS
            // =================================

            showMessage(
                "Sticker activated successfully!",
                "success"
            );


            activateBtn.textContent =
                "Activated";


            nameInput.disabled = true;

            mobileInput.disabled = true;

            vehicleInput.disabled = true;

            otpInput.disabled = true;

            sendOtpBtn.disabled = true;

            verifyOtpBtn.disabled = true;


            console.log(
                "Sticker activated:",
                stickerId
            );


        } catch (error) {

            console.error(
                "Activation error:",
                error
            );


            showMessage(
                "Activation failed: " +
                error.message,
                "error"
            );


            activateBtn.disabled =
                false;

            activateBtn.textContent =
                "Activate Sticker";

        }

    }
);


console.log(
    "register.js loaded successfully"
);