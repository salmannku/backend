import { text } from 'express'
import * as fs from 'fs'

export const template = fs.readFileSync(
  './src/email/templates/template.min.html',
  'utf-8'
)

export class EmailTemplateUtils {
  static renderLinkButton = ({
    buttonText,
    link,
  }: {
    buttonText: string
    link: string
  }) => {
    return `<table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="text-align:center;margin:32px 0"><tbody><tr><td><a href="${link}" style="color:#fff;text-decoration:none;background-color:#111;font-size:14px;border:0;border-radius:6px;padding:14px 24px;display:inline-block;text-align:center;font-weight:500" target="_blank">${buttonText}</a></td></tr></tbody></table>`
  }

  static renderLink = ({ text, link }: { text: string; link: string }) => {
    return `<a href="${link}" style="color:#067df7;text-decoration:none" target="_blank">${text}</a>`
  }

  static renderText = ({ text }: { text: string }) => {
    return `<p style="font-size:14px;line-height:1.5;margin:16px 0;color:#000000">${text}</p>`
  }
}

export const buildEmail = ({
  greeting,
  content,
}: {
  greeting: string
  content: string
}) => {
  return template.replace('{greeting}', greeting).replace('{content}', content)
}
