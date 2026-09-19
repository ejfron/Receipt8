
import { python } from './python'
import { node } from './node'
import { php } from './php'
import { csharp } from './csharp'
import { escpos } from './escpos'
import { capacitor } from './capacitor'
import type { Lang } from './shared'

export type { Lang, LangId } from './shared'

export const languages: Lang[] = [python, node, php, csharp, escpos, capacitor]
