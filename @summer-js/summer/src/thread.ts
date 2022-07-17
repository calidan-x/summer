import { Worker } from 'node:worker_threads'

const msleep = (n) => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n)
}

export const sync = <T>(promise: Promise<T>): T => {
  let result
  let lock = true

  //   const sab = new SharedArrayBuffer(4)
  //   const i32a = new Int32Array(sab)
  //   const worker = new Worker('./worker2.js', {
  //     workerData: { i32a }
  //   }).on('message', (msg) => {
  //     result = msg
  //   })

  //   worker.postMessage(promise)

  //   Atomics.wait(i32a, 0, 0, 10000)

  //   promise
  //     .then((promiseResult) => {
  //       result = promiseResult
  //       lock = false
  //     })
  //     .catch((err) => {
  //       throw err
  //     })

  while (lock) {
    msleep(2000)
    ;(async () => {
      console.log('hello')
      const r = await promise
      console.log('hi', r)
    })()
  }

  return result
}
