const { workerData, parentPort } = require('node:worker_threads')
const { i32a } = workerData
// promise.then((result) => {
//   parentPort.postMessage(result)
//   Atomics.notify(i32a, 0)
// })

parentPort.on('message', (msg) => {
  console.log(msg)
})
