import HelloWorldEmail from "@/emails/test";
import { NextResponse, NextRequest } from 'next/server';
import { Resend } from 'resend';
import { render } from "@react-email/render";
import Nodemailer from "nodemailer";

const resendFrom = process.env.RESEND_SENDER
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const {NODEMAILER_HOST, NODEMAILER_USER, NODEMAILER_PASS} = process.env;
const nodemailer = NODEMAILER_HOST && NODEMAILER_USER && NODEMAILER_PASS ? Nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  }) : null;
const nodemailerFrom = process.env.NODEMAILER_SENDER;

async function sendResendEmail(to: string) {
  if (!resendFrom || !resend) {
    throw new Error('Resend config invalid');
  }

  return await resend.emails.send({
      from: resendFrom,
      to,
      subject: "hello world",
      react: HelloWorldEmail(),
    });
}

async function sendNodemailerEmail(to: string) {
  if (!nodemailer || !nodemailerFrom) {
    throw new Error('Nodemailer config invalid');
  }
  const emailHtml = render(HelloWorldEmail());
  const options = {
    from: nodemailerFrom,
    to,
    subject: "hello world",
    html: emailHtml,
  };
  return await nodemailer.sendMail(options);
}

async function sendToLog(to: string) {
  console.log(`Sending email to ${to}`);
  const emailHtml = render(HelloWorldEmail());
  console.log('----- email ------')
  console.log(emailHtml);
  return { success: true };
}

const senderFunctions: Record<string, (to: string) => Promise<any>> = {
  resend: sendResendEmail,
  nodemailer: sendNodemailerEmail,
  log: sendToLog,
}

export async function POST(request: NextRequest) {
  const data = await request.json() as { type: string, to: string } ;
  const {type, to} = data;

  if (!type || type in senderFunctions === false) {
    return NextResponse.json({ error: 'Invalid type' });
  }

  try {
    const data = await senderFunctions[type](to);
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error });
  }
}
