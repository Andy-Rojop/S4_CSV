# Unit Tests with TypeScript

## Setup

1. `pnpm init` setup a the pnpm project
2. `pnpm add -D vitest`, add Vitest as a development dependency 

## Tarea: comas dentro de valores entre comillas

- Prueba: `tests/csv_reader.test.ts` → `handles commas inside quoted values` (usa `data/with_commas.csv`).
- Solución: `src/csv_reader.ts` reemplaza `split(',')` por un parser caracter por caracter
  (`parseCsv`) que solo separa por coma o salto de línea cuando está **fuera** de comillas,
  quita las comillas delimitadoras y soporta `""` como comilla escapada.

```bash
pnpm install
pnpm test --run
```
