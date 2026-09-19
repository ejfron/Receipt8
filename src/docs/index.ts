
import type { LangId } from '../generators'
import type { LangDoc } from './shared'
import { pythonDoc } from './python'
import { nodeDoc } from './node'
import { phpDoc } from './php'
import { csharpDoc } from './csharp'
import { escposDoc } from './escpos'
import { capacitorDoc } from './capacitor'

export type { LangDoc, DocSection } from './shared'

export const docs: Record<LangId, LangDoc> = {
  python: pythonDoc,
  node: nodeDoc,
  php: phpDoc,
  csharp: csharpDoc,
  escpos: escposDoc,
  capacitor: capacitorDoc,
}
