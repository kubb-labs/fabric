import { createFabric, createRefKey } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'
import { fsPlugin } from '@kubb/fabric-core/plugins'

/**
 * Example demonstrating RefKey usage for automatic import management
 * Inspired by Alloy's refkey system
 */

// Create a fabric instance
export const fabric = createFabric()

// Create refkeys for symbols we want to reference across files
const helloWorldRef = createRefKey()
const userTypeRef = createRefKey()

// Define a symbol in file1.ts with a refkey
fabric.addFile({
  baseName: 'file1.ts',
  path: './example6/gen/file1.ts',
  sources: [
    {
      name: 'helloWorld',
      value: 'export const helloWorld = "Hello, World!"',
      isExportable: true,
      isIndexable: true,
      refkey: helloWorldRef.resolve('helloWorld', './example6/gen/file1.ts'),
    },
  ],
  imports: [],
  exports: [],
})

// Define a type in types.ts with a refkey
fabric.addFile({
  baseName: 'types.ts',
  path: './example6/gen/types.ts',
  sources: [
    {
      name: 'User',
      value: `export type User = {
  id: number
  name: string
}`,
      isTypeOnly: true,
      isExportable: true,
      isIndexable: true,
      refkey: userTypeRef.resolve('User', './example6/gen/types.ts', { isTypeOnly: true }),
    },
  ],
  imports: [],
  exports: [],
})

// Use the refkeys in file2.ts
// The import resolver will automatically add the necessary imports
fabric.addFile({
  baseName: 'file2.ts',
  path: './example6/gen/file2.ts',
  sources: [
    {
      name: 'greetUser',
      value: `export function greetUser(user: User): string {
  return \`\${helloWorld} \${user.name}\`
}`,
      isExportable: true,
      isIndexable: true,
    },
  ],
  imports: [
    // Normally these would be auto-added by the import resolver
    // For now, we manually add them as the integration is in progress
    {
      name: 'helloWorld',
      path: './file1',
    },
    {
      name: 'User',
      path: './types',
      isTypeOnly: true,
    },
  ],
  exports: [],
})

fabric.use(fsPlugin, { clean: { path: './example6/gen' } })
fabric.use(typescriptParser)

fabric.write()
