const AI_SERVICE_URL = "http://localhost:5000";

const classifyComplaint = async (complaintText) => {

    try {

        const response = await fetch(
            `${AI_SERVICE_URL}/predict`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    complaint: complaintText
                })
            }
        );

        if (!response.ok) {

            throw new Error(
                `AI service returned status ${response.status}`
            );
        }

        const data = await response.json();

        return {
            category: data.category,
            priority: data.priority
        };

    } catch (error) {

        console.error(
            "AI service error:",
            error.message
        );

        return null;
    }
};


module.exports = {
    classifyComplaint
};