import { summerStart, handler, Logger } from '@summer-js/summer'
import { getDataSource } from '@summer-js/typeorm'
export { handler }

summerStart({
  async before(config) {
    // You need to create database first
    // SQL: CREATE DATABASE `movie-db` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
    const movieDataSource = getDataSource('MOVIE_DB')
    await movieDataSource.synchronize()
  },
  async after(config) {}
})
