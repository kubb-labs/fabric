import path from 'node:path'
import { createFabric, File, TypeGenerator } from '@kubb/react-fabric'
import { fsPlugin, reactPlugin } from '@kubb/react-fabric/plugins'

/**
 * Generate TypeScript type definitions using TypeGenerator
 */
function App() {
  const combinedSchema = TypeGenerator.printCombinedSchema(
    'UploadFileData',
    {
      body: {
        properties: [
          { name: 'additionalMetadata', type: 'string', optional: true },
          { name: 'file', type: 'Blob | File', optional: true },
        ],
      },
      pathParams: {
        properties: [
          { name: 'petId', type: 'number', comment: 'ID of pet to update' },
        ],
      },
      url: '/pet/{petId}/uploadImage',
    },
    {
      200: 'ApiResponse',
    }
  )

  return (
    <File path={path.resolve(__dirname, 'gen/api-types.ts')} baseName={'api-types.ts'}>
      <File.Source>{combinedSchema}</File.Source>
    </File>
  )
}

async function start() {
  const fabric = createFabric()

  fabric.use(fsPlugin)
  fabric.use(reactPlugin)

  await fabric.render(App)

  await fabric.waitUntilExit()

  const files = fabric.files

  console.log('\nFiles: ', files.length)
  await fabric.write()
}

start()
