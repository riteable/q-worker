const test = require('ava')
const worker = require('../')

const timeout = 100

function incrementTask () {
  let i = 0

  return () => new Promise((resolve) => {
    setTimeout(() => {
      i++

      return resolve(i)
    }, timeout)
  })
}

test('Should execute in order', async (t) => {
  const queue = worker({
    concurrent: 1
  })

  const task = incrementTask()

  const task1 = queue.add(task)
  const task2 = await queue.add(task)
  const task3 = queue.add(task)

  const result = await Promise.all([task1, task2, task3])

  t.deepEqual(result, [1, 2, 3])
})

test('Should emit done event', async (t) => {
  const queue = worker({
    concurrent: 1
  })

  const task = incrementTask()

  const task1 = queue.add(task)
  const task2 = queue.add(task)
  const task3 = queue.add(task)

  const result = await new Promise((resolve) => {
    queue.events.on('done', () => resolve(Promise.all([task1, task2, task3])))
  })

  t.deepEqual(result, [1, 2, 3])
})
