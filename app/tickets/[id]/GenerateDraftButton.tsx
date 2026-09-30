"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GenerateDraftButtonProps {
    ticketId: string;
}

export default function GenerateDraftButton({
    ticketId,
}: GenerateDraftButtonProps) {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleGenerateDraft() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/tickets/${ticketId}/draft`, {
                method: "POST",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Unable to generate draft.");
            }

            const contentType = response.headers.get("content-type") ?? "";

            if (contentType.includes("application/json")) {
                router.refresh();
                return;
            }

            if (!response.body) {
                throw new Error("The AI response stream is unavailable.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let streamedText = "";

            while (true) {
                const { value, done } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });

                streamedText += chunk;
                console.log("AI draft chunk:", chunk);
            }

            console.log("Complete streamed draft:", streamedText);

            router.refresh();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to generate draft.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section>
            <button
                type="button"
                onClick={handleGenerateDraft}
                disabled={loading}
            >
                {loading ? "Generating draft..." : "Generate AI Draft"}
            </button>

            {error && <p>{error}</p>}
        </section>
    );
}