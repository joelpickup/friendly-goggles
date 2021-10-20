import Koa from 'koa'
import Router from '@koa/router'
import { createClient } from './lib'

export const start = async () => {
  const app = new Koa()
  const router = new Router()

  const client = await createClient('./conf.yml')

  router.get('/readings/:box_id/:from/:to', async (ctx) => {
    const { box_id, from, to } = ctx.params

    const res = await client.readData({
      box_id,
      from,
      to,
    })

    if (res?.length > 0) {
      ctx.status = 200
      ctx.body = res
    }
  })

  app.use(router.routes())

  app.listen(8000, () => console.log('server started!'))
}
