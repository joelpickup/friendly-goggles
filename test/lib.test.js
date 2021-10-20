const test = require('tape')
const { createClient } = require('../src/lib')

test('should return expected data', async (t) => {
  const client = await createClient('./conf.yml')

  const from = '2021-04-01T05:40:00'
  const to = '2021-04-19T12:00:00'

  const box_id = 'Box-A1'

  const res = await client.readData({
    box_id: 'Box-A1',
    from: '2021-04-07T05:40:00',
    to: '2021-04-19T12:00:00',
  })

  t.assert(res.length, 'returned data')
  t.assert(
    res.every(
      (x) =>
        new Date(x.reading_ts) <= new Date(to) &&
        new Date(x.reading_ts) >= new Date(from) &&
        x.box_id === box_id
    ),
    'did not select correct rows'
  )
})

test('should return expected data -- aggregate', async (t) => {
  const client = await createClient('./conf.yml')

  const box_id = 'Box-A1'

  const res = await client.readData({
    aggregate: true,
  })

  t.assert(res.length, 'returned data')
  t.assert(
    res.every((x) => x.max !== null && x.average !== null && x.min !== null),
    'did not select correct rows'
  )

  let ref = {}

  t.assert(
    res.every((x) => {
      if (ref[x.sensor_id] != null) {
        return false
      }

      ref[x.sensor_id] = x.sensor_id
      return true
    }),
    'returned more than one row for some sensors'
  )
})

test.onFinish(() => process.exit(0))
