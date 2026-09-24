"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function TicketForm() {
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const response = await fetch("/api/tickets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                customerName,
                customerEmail,
                subject,
                message,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            setError(data.error ?? "Unable to create ticket.");
            return;
        }

        setSuccess("Ticket created successfully.");

        setCustomerName("");
        setCustomerEmail("");
        setSubject("");
        setMessage("");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create Ticket</h2>

            <div>
                <label htmlFor="customerName">Customer name</label>
                <input
                    id="customerName"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                />
            </div>

            <div>
                <label htmlFor="customerEmail">Customer email</label>
                <input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                />
            </div>

            <div>
                <label htmlFor="subject">Subject</label>
                <input
                    id="subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                />
            </div>

            <div>
                <label htmlFor="message">Message</label>
                <textarea
                    id="message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                />
            </div>

            <button type="submit">Create Ticket</button>

            {error && <p>{error}</p>}
            {success && <p>{success}</p>}
        </form>
    );
}