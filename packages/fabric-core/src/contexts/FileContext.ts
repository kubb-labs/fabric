import { createContext } from '../context.ts'
import type * as KubbFile from '../KubbFile.ts'

/**
 * Provides app-level metadata and lifecycle hooks (like `exit`) to
 * components and composables within a Fabric runtime.
 */
export const FileContext = createContext<KubbFile.ResolvedFile | null>(null)
