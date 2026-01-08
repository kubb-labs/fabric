/**
 * TypeGenerator utility for generating TypeScript type definitions
 * in a specific format for API requests and responses.
 */

type PropertyDefinition = {
  name: string
  type: string
  optional?: boolean
  comment?: string
}

type ObjectTypeDefinition = {
  properties: PropertyDefinition[]
}

type RequestTypeDefinition = {
  body?: ObjectTypeDefinition
  pathParams?: ObjectTypeDefinition
  queryParams?: ObjectTypeDefinition
  url: string
}

type ResponseTypeDefinition = {
  [statusCode: string]: string
}

/**
 * Generate a property definition with optional JSDoc comment
 */
function printProperty(property: PropertyDefinition, indent = 4): string {
  const spaces = ' '.repeat(indent)
  const optionalMarker = property.optional ? '?' : ''
  let result = ''
  
  if (property.comment) {
    result += `${spaces}/**\n`
    result += `${spaces} * ${property.comment}\n`
    result += `${spaces} */\n`
  }
  
  result += `${spaces}${property.name}${optionalMarker}: ${property.type};`
  return result
}

/**
 * Generate combined schema types for API requests and responses
 */
export function printCombinedSchema(
  baseName: string,
  request: RequestTypeDefinition,
  responses: ResponseTypeDefinition
): string {
  const parts: string[] = []

  // Generate Request Type
  const requestTypeName = `${baseName}Request`
  parts.push(`export type ${requestTypeName} = {`)
  
  // Add body
  if (request.body) {
    const bodyOptional = request.body.properties.every(p => p.optional) ? '?' : ''
    parts.push(`    body${bodyOptional}: {`)
    request.body.properties.forEach(prop => {
      parts.push(printProperty(prop, 8))
    })
    parts.push('    };')
  }
  
  // Add pathParams
  if (request.pathParams) {
    const pathOptional = request.pathParams.properties.every(p => p.optional) ? '?' : ''
    parts.push(`    pathParams${pathOptional}: {`)
    request.pathParams.properties.forEach(prop => {
      parts.push(printProperty(prop, 8))
    })
    parts.push('    };')
  }
  
  // Add queryParams
  if (request.queryParams) {
    const queryOptional = request.queryParams.properties.every(p => p.optional) ? '?' : ''
    parts.push(`    queryParams${queryOptional}: {`)
    request.queryParams.properties.forEach(prop => {
      parts.push(printProperty(prop, 8))
    })
    parts.push('    };')
  } else {
    // If no queryParams, set to never
    parts.push('    queryParams?: never;')
  }
  
  // Add url
  parts.push(`    url: '${request.url}';`)
  parts.push('};')
  parts.push('')

  // Generate Responses Type
  const responsesTypeName = `${baseName}Responses`
  parts.push(`export type ${responsesTypeName} = {`)
  Object.entries(responses).forEach(([statusCode, type]) => {
    parts.push(`    ${statusCode}: ${type};`)
  })
  parts.push('};')
  parts.push('')

  // Generate Response Type (union type from responses)
  const responseTypeName = `${baseName}Response`
  parts.push(`export type ${responseTypeName} = ${responsesTypeName}[keyof ${responsesTypeName}];`)

  return parts.join('\n')
}

export const TypeGenerator = {
  printCombinedSchema,
}
