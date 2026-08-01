export default async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });

    }


    try {

        const {
            stickerId
        } = req.body || {};


        if (!stickerId) {

            return res.status(400).json({
                success: false,
                message: "Sticker ID is required"
            });

        }


        // -----------------------------------
        // TEMPORARY TEST RESPONSE
        // -----------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Exotel backend is working",

            stickerId:
                stickerId

        });


    } catch (error) {

        console.error(
            "Exotel API error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error"

        });

    }

}