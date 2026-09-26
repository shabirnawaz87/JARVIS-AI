export default async (req) => {
    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({ error: "POST required" }),
            {
                status: 405,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    try {
        const body = await req.json();

        const message = body.message;
        const provider = body.provider || "openai";

        if (!message) {
            return new Response(
                JSON.stringify({ error: "Message is required" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        let answer = "";

        if (provider === "gemini") {

            const apiKey = Netlify.env.get("GEMINI_API_KEY");

            if (!apiKey) {
                throw new Error("Gemini API key is not configured.");
            }

            const response = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
                apiKey,
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
                                            "Answer clearly and concisely.\n\nUser: " +
                                            message
                                    }
                                ]
                            }
                        ]
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error?.message || "Gemini request failed."
                );
            }

            answer =
                data.candidates?.[0]?.content?.parts?.[0]?.text ||
                "I could not generate a response.";

        } else {

            const apiKey = Netlify.env.get("OPENAI_API_KEY");

            if (!apiKey) {
                throw new Error("OpenAI API key is not configured.");
            }

            const response = await fetch(
                "https://api.openai.com/v1/responses",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: "gpt-5",
                        instructions:
                            "You are JARVIS, a helpful personal AI assistant. " +
                            "Answer clearly and concisely.",
                        input: message
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error?.message || "OpenAI request failed."
                );
            }

            answer = data.output_text || "I could not generate a response.";
        }

        return new Response(
            JSON.stringify({
                success: true,
                provider,
                answer
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {

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
