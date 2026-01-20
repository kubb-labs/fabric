import { createContext } from '../context.ts'

export type RenderContextProps = {
  indentLevel: number
  indentSize: number
  currentLineLength: number
  shouldBreak: boolean
}

/**
 * Provides a context for tracking rendering state such as indentation and line length.
 */
export const RenderContext = createContext<RenderContextProps>({ indentLevel: 0, indentSize: 2, currentLineLength: 0, shouldBreak: false })
