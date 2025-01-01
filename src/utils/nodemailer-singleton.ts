import * as nodemailer from 'nodemailer'

class NodeMailerSingleton {
  private transport: nodemailer.Transporter
  static instance: NodeMailerSingleton
  constructor() {
    if (!NodeMailerSingleton.instance) {
      this.transport = nodemailer.createTransport({
        port: 587,
        host: process.env.SMTP_HOST,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      })
      NodeMailerSingleton.instance = this
    }

    return NodeMailerSingleton.instance
  }

  getTransport() {
    return this.transport
  }
}

const nodeMailerInstance = new NodeMailerSingleton()
export default nodeMailerInstance
