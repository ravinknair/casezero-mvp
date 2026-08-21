"use client";

import { useState } from "react";

export function InviteMemberForm() {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("viewer");
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		setMessage("");
		try {
			const response = await fetch("/api/workspaces/invitations", {
				method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }),
			});
			const result = await response.json() as { error?: string; invitationUrl?: string };
			if (!response.ok) throw new Error(result.error ?? "Invitation failed");
			setMessage(`Invitation created: ${result.invitationUrl}`);
			setEmail("");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Invitation failed");
		} finally {
			setBusy(false);
		}
	}

	return (
		<form onSubmit={submit} className="rounded-lg border border-gray-200 bg-white p-5">
			<h2 className="text-lg font-bold text-gray-900">Invite a collaborator</h2>
			<div className="mt-4 grid gap-3 md:grid-cols-[1fr_10rem_auto]">
				<input aria-label="Email address" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" className="rounded border border-gray-300 px-3 py-2 text-sm" />
				<select aria-label="Role" value={role} onChange={(event) => setRole(event.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm">
					<option value="viewer">Viewer</option>
					<option value="operator">Operator</option>
					<option value="admin">Admin</option>
				</select>
				<button disabled={busy} className="rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Creating..." : "Create invitation"}</button>
			</div>
			{message && <p className="mt-3 break-all text-sm text-gray-600" role="status">{message}</p>}
		</form>
	);
}