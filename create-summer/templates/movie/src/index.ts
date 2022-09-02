import { summerStart, handler, Logger } from '@summer-js/summer'
import { getDataSource } from '@summer-js/typeorm'
export { handler }

summerStart({
  async before(config) {
    await getDataSource('MOVIE_DB').synchronize()
  },
  async after(config) {}
})
