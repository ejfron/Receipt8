export interface DocSection {
  heading: string
  body: string[]
  code?: string
  codeCaption?: string
}

export interface LangDoc {
  summary: string
  runtime: string
  install: string
  connections: { label: string; detail: string }[]
  sections: DocSection[]
  gotchas: { title: string; body: string }[]
  links: { label: string; href: string }[]
}
