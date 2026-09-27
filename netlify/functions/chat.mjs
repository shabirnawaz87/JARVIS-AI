export default async (req) => {

    // Simple browser test
    if (req.method === "GET") {
        return new Response(
            JSON.stringify({
                success: true,
                message: "JARVIS AI backend is online."
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({
                success: false,
                error: "POST request required."
            }),
            {
                status: 405,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    try {

        const body = await req.json();

        const message = body.message;

        if (!message) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "No message received."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const apiKey =
            process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error(
                "GEMINI_API_KEY is missing in Netlify."
            );
        }

        const geminiResponse = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
            encodeURIComponent(apiKey),
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text:
                                        "You are JARVIS, a helpful personal AI assistant. " +
                                        "Answer naturally, clearly and concisely. " +
                                        "The user may speak English, Urdu or Roman Urdu.\n\n" +
                                        "User: " +
                                        message
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data =
            await geminiResponse.json();

        if (!geminiResponse.ok) {

            throw new Error(
                data?.error?.message ||
                "Gemini API request failed."
            );
        }

        const answer =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!answer) {

            throw new Error(
                "Gemini returned no text response."
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                provider: "gemini",
                answer: answer
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {

        console.error("JARVIS ERROR:", error);

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
};
