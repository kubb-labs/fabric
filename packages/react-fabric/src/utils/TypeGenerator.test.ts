import { describe, expect, test } from 'vitest'
import { TypeGenerator } from './TypeGenerator.ts'

describe('TypeGenerator', () => {
  describe('printCombinedSchema', () => {
    test('generates combined schema with all request parts', () => {
      const output = TypeGenerator.printCombinedSchema(
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

      expect(output).toBe(`export type UploadFileDataRequest = {
    body?: {
        additionalMetadata?: string;
        file?: Blob | File;
    };
    pathParams: {
        /**
         * ID of pet to update
         */
        petId: number;
    };
    queryParams?: never;
    url: '/pet/{petId}/uploadImage';
};

export type UploadFileDataResponses = {
    200: ApiResponse;
};

export type UploadFileDataResponse = UploadFileDataResponses[keyof UploadFileDataResponses];`)
    })

    test('generates combined schema with required body', () => {
      const output = TypeGenerator.printCombinedSchema(
        'CreateUser',
        {
          body: {
            properties: [
              { name: 'username', type: 'string' },
              { name: 'email', type: 'string' },
            ],
          },
          url: '/users',
        },
        {
          201: 'User',
          400: 'ErrorResponse',
        }
      )

      expect(output).toContain('body: {')
      expect(output).toContain('username: string;')
      expect(output).toContain('email: string;')
      expect(output).toContain('queryParams?: never;')
      expect(output).toContain('201: User;')
      expect(output).toContain('400: ErrorResponse;')
    })

    test('generates combined schema with queryParams', () => {
      const output = TypeGenerator.printCombinedSchema(
        'SearchPets',
        {
          queryParams: {
            properties: [
              { name: 'status', type: 'string', optional: true },
              { name: 'limit', type: 'number', optional: true },
            ],
          },
          url: '/pets/search',
        },
        {
          200: 'Pet[]',
        }
      )

      expect(output).toContain('queryParams?: {')
      expect(output).toContain('status?: string;')
      expect(output).toContain('limit?: number;')
    })

    test('generates combined schema with all params', () => {
      const output = TypeGenerator.printCombinedSchema(
        'UpdatePet',
        {
          body: {
            properties: [
              { name: 'name', type: 'string' },
              { name: 'age', type: 'number', optional: true },
            ],
          },
          pathParams: {
            properties: [
              { name: 'petId', type: 'string' },
            ],
          },
          queryParams: {
            properties: [
              { name: 'notify', type: 'boolean', optional: true },
            ],
          },
          url: '/pets/{petId}',
        },
        {
          200: 'Pet',
          404: 'NotFoundError',
        }
      )

      expect(output).toContain('body: {')
      expect(output).toContain('pathParams: {')
      expect(output).toContain('queryParams?: {')
      expect(output).toContain('200: Pet;')
      expect(output).toContain('404: NotFoundError;')
    })
  })
})
