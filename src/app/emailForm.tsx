"use client";

import { useState } from "react";

const isValidEmail = (text: string) => {
  return text.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
}

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const hasValidEmail = isValidEmail(email);

  async function onSendClick(type: string) {
    fetch("/api/send", {method: "POST", body: JSON.stringify({type, to: email})});
  }

  return (
    <>
      <div className="w-full flex gap-4">
        <label htmlFor="emailTo">Reciepient</label>
        <input className="bg-slate-200 text-slate-950" type="email" name="emailTo" id="emailTo" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="flex flex-row justify-evenly">
        <button onClick={() => onSendClick('resend')} disabled={!hasValidEmail} className="bg-slate-200 p-3 text-slate-950 rounded">Send by Resend</button>
        <button onClick={() => onSendClick('nodemailer')} disabled={!hasValidEmail} className="bg-slate-200 p-3 text-slate-950 rounded">Send by Nodemailer</button>
      </div>
    </>
  )
}