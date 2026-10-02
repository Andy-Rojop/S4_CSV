import fs from 'fs'

interface CsvReaderResult {
    error: boolean
    message: string
    data?: {
        headers: string[]
        rows: string[][]
    }
}

function read(path: string): CsvReaderResult {
    // 1. Validate the path
    if (!path ||!fs.existsSync(path)) {
        return {
            error: true,
            message: `File ${path} not found`
        }
    }

    // 2. Validate the file type
    if (path.split('.').pop() !== 'csv') {
        return {
            error: true,
            message: `File ${path} is not a CSV file`
        }
    }

    // 3. Read the file
    const fileContent = fs.readFileSync(path, 'utf8')
    const records = parseCsv(fileContent)

    const headers = (records[0] ?? []).filter(header => header.trim() !== '')
    const rows = records.slice(1)

    return {
        error: false,
        message: `File ${path} read successfully`,
        data: { headers, rows }
    }
}

/**
 * Recorre el contenido caracter por caracter (máquina de estados) siguiendo RFC 4180:
 * - Una coma separa campos SOLO si estamos fuera de comillas.
 * - Un salto de línea (\n o \r\n) termina el registro SOLO si estamos fuera de comillas.
 * - Dentro de comillas, "" representa una comilla literal.
 * - Las comillas que delimitan el campo no forman parte del valor.
 * Los registros completamente vacíos (p. ej. la línea final) se descartan.
 */
function parseCsv(content: string): string[][] {
    const records: string[][] = []
    let record: string[] = []
    let field = ''
    let inQuotes = false

    const pushField = () => {
        record.push(field)
        field = ''
    }

    const pushRecord = () => {
        pushField()
        const isEmpty = record.length === 1 && record[0] === ''
        if (!isEmpty) {
            records.push(record)
        }
        record = []
    }

    for (let i = 0; i < content.length; i++) {
        const char = content[i]

        if (inQuotes) {
            if (char === '"') {
                if (content[i + 1] === '"') {
                    field += '"' // comilla escapada ("")
                    i++
                } else {
                    inQuotes = false // cierre del campo entrecomillado
                }
            } else {
                field += char // incluye comas y saltos de línea literales
            }
            continue
        }

        if (char === '"') {
            inQuotes = true
        } else if (char === ',') {
            pushField()
        } else if (char === '\n') {
            pushRecord()
        } else if (char === '\r') {
            if (content[i + 1] === '\n') i++
            pushRecord()
        } else {
            field += char
        }
    }

    if (field !== '' || record.length > 0) {
        pushRecord()
    }

    return records
}

export default { read }