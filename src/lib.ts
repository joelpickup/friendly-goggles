import fs from 'fs/promises'
import yaml from 'js-yaml'
import mysql from 'mysql'

interface ReadDataProps {
  box_id?: string
  from?: string
  to?: string
  aggregate?: boolean
}

interface SensorReading {
  box_id: string
  sensor_id: string
  name: string
  unit: string
  reading?: string
  reading_ts?: string
  max?: string
  min?: string
  avg?: string
}

const buildWhereStatement = (options: Omit<ReadDataProps, 'aggregate'>) => {
  let where = ''

  const values = []

  for (const [key, value] of Object.entries(options)) {
    if (!value) {
      continue
    }

    if (values.length === 0) {
      where += `
        WHERE
      `
    } else {
      where += `
        AND
      `
    }
    if (key === 'box_id') where += `readings.box_id = ?`
    if (key === 'from') where += `readings.reading_ts >= ?`
    if (key === 'to') where += `readings.reading_ts <= ?`

    values.push(value)
  }

  return {
    where,
    values,
  }
}

export const createClient = async (dbConfigPath: string) => {
  // open connection to rds
  const yamlFile = await fs.readFile(dbConfigPath, 'utf8')

  if (!yamlFile) {
    throw new Error(`could not find file at path: ${dbConfigPath}`)
  }

  const parsed = yaml.load(yamlFile)

  const connection = mysql.createConnection(parsed)

  connection.connect()

  const sendQuery = (query: string, values: string[]) =>
    new Promise<SensorReading[]>((res, rej) => {
      connection.query(query, values, function (error, results) {
        if (error) {
          rej(error)
        } else {
          res(results)
        }
      })
    })

  return {
    readData: ({
      box_id,
      from,
      to,
      aggregate,
    }: ReadDataProps): Promise<Array<SensorReading>> => {
      let selectors = `
        box_id,
        sensor_id,
        name,
        unit,
      `
      let groupBy = ''

      if (aggregate === true) {
        selectors += `
          MIN(reading) AS min,
          MAX(reading) AS max,
          AVG(reading) AS avg
        `
        groupBy = `
          GROUP BY
            readings.sensor_id
        `
      } else {
        selectors += `
          unit,
          reading,
          reading_ts
        `
      }

      const { where, values } = buildWhereStatement({ from, to, box_id })

      const query = `
        SELECT
          ${selectors}
        FROM
          readings
        JOIN
          sensors
        ${where}
        ${groupBy}
      `

      return sendQuery(query, values)
    },
  }
}
