"use client";

import { useState } from "react";

interface DraftEditorProps {
    ticketId: string;
    initialText: string;
}

export default function DraftEditor({
    ticketId,
    initialText,
}: DraftEditorProps) {
    const [editedText, setEditedText] = useState(initialText);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSave() {
        setSaving(true);
        setMessage("");

        try {
            const response = await fetch(`/api/drafts/${ticketId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    editedText,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to save draft.");
            }

            setMessage("Draft saved.");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to save draft."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <section>
            <textarea
                value={editedText}
                onChange={(event) => setEditedText(event.target.value)}
                rows={8}
            />

            <button
                type="button"
                onClick={handleSave}
                disabled={saving || !editedText.trim()}
            >
                {saving ? "Saving..." : "Save Edit"}
            </button>

            {message && <p>{message}</p>}
        </section>
    );
}