// Untyped JSON module declaration. resolveJsonModule is deliberately OFF:
// the 1.8 MB seed file would make tsc infer its full literal type on every
// build. src/data.ts applies the SeedData type instead.
declare module '*.json' {
  const value: unknown
  export default value
}
