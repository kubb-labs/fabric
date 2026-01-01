import { createFabric } from '@kubb/fabric-core'
import { describe, expect, test } from 'vitest'
import { reactPlugin } from '../plugins/reactPlugin.ts'
import { Enum } from './Enum.tsx'

describe('<Enum/>', () => {
  test('should render a basic enum', async () => {
    const Component = () => {
      return (
        <Enum name="Status">
          Pending,{'\n'}
          Active,{'\n'}
          Completed
        </Enum>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "enum Status {
        Pending,
        Active,
        Completed
      }"
    `)
  })

  test('should render an exported enum', async () => {
    const Component = () => {
      return (
        <Enum name="Status" export>
          Pending = "pending",{'\n'}
          Active = "active",{'\n'}
          Completed = "completed"
        </Enum>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "export enum Status {
        Pending = "pending",
        Active = "active",
        Completed = "completed"
      }"
    `)
  })

  test('should render a const enum', async () => {
    const Component = () => {
      return (
        <Enum name="Direction" const>
          Up,{'\n'}
          Down,{'\n'}
          Left,{'\n'}
          Right
        </Enum>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "const enum Direction {
        Up,
        Down,
        Left,
        Right
      }"
    `)
  })

  test('should render with numeric values', async () => {
    const Component = () => {
      return (
        <Enum name="HttpStatus" export>
          OK = 200,{'\n'}
          NotFound = 404,{'\n'}
          ServerError = 500
        </Enum>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "export enum HttpStatus {
        OK = 200,
        NotFound = 404,
        ServerError = 500
      }"
    `)
  })

  test('should render with JSDoc', async () => {
    const Component = () => {
      return (
        <Enum
          name="Color"
          export
          JSDoc={{
            comments: ['Available color options'],
          }}
        >
          Red = "red",{'\n'}
          Green = "green",{'\n'}
          Blue = "blue"
        </Enum>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "/**
       * Available color options
       */
      export enum Color {
        Red = "red",
        Green = "green",
        Blue = "blue"
      }"
    `)
  })

  test('should render exported const enum', async () => {
    const Component = () => {
      return (
        <Enum name="Feature" export const>
          Auth = "auth",{'\n'}
          Logging = "logging",{'\n'}
          Cache = "cache"
        </Enum>
      )
    }

    const fabric = createFabric()
    fabric.use(reactPlugin)
    const output = await fabric.renderToString(Component)

    expect(output).toMatchSnapshot()
      "export const enum Feature {
        Auth = "auth",
        Logging = "logging",
        Cache = "cache"
      }"
    `)
  })
})
