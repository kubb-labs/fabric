import { useFileCollector } from '../composables/useFileCollector.ts'
import { useNodeTree } from '../composables/useNodeTree.ts'
import { provide } from '../context.ts'
import { NodeTreeContext } from '../contexts/NodeTreeContext.ts'
import type { KubbFile } from '../types.ts'
import { Text } from './Text.ts'

export type FileProps<TMeta extends object = object> = {
  /**
   * Name to be used to dynamically create the baseName(based on input.path).
   * Based on UNIX basename
   * @link https://nodejs.org/api/path.html#pathbasenamepath-suffix
   */
  readonly baseName: KubbFile.BaseName
  /**
   * Path will be full qualified path to a specified file.
   */
  readonly path: KubbFile.Path
  readonly meta?: TMeta
  readonly banner?: string
  readonly footer?: string
  readonly children?: string | (() => string | Array<string>)
}

/**
 * File component for fsx - registers files via context
 *
 * When executed this will create or reuse a FileCollector from context and
 * register the file (baseName/path) so it can be emitted later. Returns the
 * children string content for fsx renderers.
 */
export function File<TMeta extends object = object>({ children, ...props }: FileProps<TMeta>): string {
  const { baseName, path, meta = {}, footer, banner } = props

  const fileCollector = useFileCollector()
  const nodeTree = useNodeTree()

  if (nodeTree) {
    const childTree = nodeTree.addChild({ type: 'File', props })

    provide(NodeTreeContext, childTree)
  }

  fileCollector.add({
    baseName,
    path,
    meta,
    banner,
    footer,
    sources: [],
    imports: [],
    exports: [],
  })

  return Text({ children })
}

/**
 * FileSource - for adding source code to a file
 *
 * Returns the provided children string so the fsx renderer can collect it.
 */
export function FileSource(props: Omit<KubbFile.Source, 'value'> & { children?: string }): string {
  return props.children || ''
}

/**
 * FileExport - for adding exports to a file
 *
 * No-op function used by renderers to record exports.
 */
export function FileExport(_props: KubbFile.Export): string {
  return ''
}

/**
 * FileImport - for adding imports to a file
 *
 * No-op function used by renderers to record imports.
 */
export function FileImport(_props: KubbFile.Import): string {
  return ''
}

File.Source = FileSource
File.Import = FileImport
File.Export = FileExport
