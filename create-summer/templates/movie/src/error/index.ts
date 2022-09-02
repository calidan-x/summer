import { ResponseError } from '@summer-js/summer'

const E = (statusCode: number, message: string) => {
  return new ResponseError(statusCode, { message })
}

export const ResError = {
  // Movie Errors
  FETCH_MOVIE_LIST_FAIL: E(400, 'Fetch movie list fail'),
  MOVIE_NOT_FOUND: E(404, 'Movie not exist')
}
