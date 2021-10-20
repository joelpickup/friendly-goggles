const test = require('tape')
const { start } = require('../src/app')
const axios = require('axios')

test('should start', async (t) => {
  // start server
  try {
    await start()
  } catch (e) {
    t.fail('should not have thrown')
  }
})

test.onFinish(() => process.exit(1))
