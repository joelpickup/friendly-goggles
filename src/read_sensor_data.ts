#!/usr/bin/env node
import { createClient } from './lib.js'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import assert from 'assert'

const argv = yargs(hideBin(process.argv))
  .options({
    box_id: { type: 'string' },
    from: { type: 'string' },
    to: { type: 'string' },
    conf: { type: 'string' },
    aggregate: { type: 'boolean' },
  })
  .parseSync()

const fn = async () => {
  const { box_id, from, to, conf, aggregate } = argv

  assert(conf, 'did not pass conf')

  const client = await createClient(conf)

  const res = await client.readData({
    box_id,
    from,
    to,
    aggregate,
  })

  process.stdout.write(JSON.stringify(res))
}

fn()
  .then(() => process.exit(0))
  .catch((e) => {
    process.stderr.write(e.message)
    process.exit(1)
  })
