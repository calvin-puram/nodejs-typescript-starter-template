import * as nodemailer from "nodemailer";
import * as pug from "pug";
import * as path from "path";
import * as htmlToText from "html-to-text";
import User from "../interface/user.interface";
import { EmailData } from "../interface/auth.interface";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";

const nodemailerOptions: SMTPTransport.Options | any = {
  service: "sendGrid",
  secureConnection: true,
  ports: 465,
  auth: {
    user: process.env.SENDGRID_USERNAME,
    pass: process.env.SENDGRID_PASSWORD,
  },
};

export default class SendEmail implements EmailData {
  public to: string;
  public firstName: string;
  public url: string;
  public from: string;

  constructor(user: User, url: string) {
    this.to = user.email;
    this.firstName = user.name;
    this.url = url;
    this.from = "domain <noreply@domain.org>";
  }

  sendTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport(nodemailerOptions);
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 2525,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async send(template: string, subject: string) {
    //render html template
    const html = pug.renderFile(
      path.join(__dirname, `../views/emails/${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    //email options
    const message = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    //create transport and send email
    await this.sendTransport().sendMail(message);
  }

  // send user welcome message
  async sendWelcome() {
    await this.send("welcome", "Welcome to Domain.com");
  }

  // send reset password message
  async passwordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid only for 10 minutes)"
    );
  }
}
