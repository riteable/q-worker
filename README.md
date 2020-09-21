# Q-Worker

Rate limit and queue async functions.

## Description

This module lets you queue up async tasks to be executed at a predetermined interval. For example, if you're working with a REST API that's rate limited, you can use this module to only execute requests X amount of times per second.

## Install

You can install using npm:

```
$ npm i @riteable/q-worker
```

## Usage

```
const worker = require('q-worker')

const queue = worker({
    delay: 1000,
    concurrent: 1
})

function someAsyncTask () {
    return new Promise((resolve) => {
        setTimeout(() => resolve(new Date()), 100)
    })
}

const task1 = queue.add(someAsyncTask)
const task2 = queue.add(someAsyncTask)
const task3 = queue.add(someAsyncTask)

Promise.all([task1, task2, task3])
    .then(console.log)
    .catch(console.error)

```

The `console.log` would output something like the following:

```
[
  2020-09-17T12:00:56.471Z,
  2020-09-17T12:00:57.474Z,
  2020-09-17T12:00:58.474Z
]
```

The output shows the timestamps are all 1 second (1000ms) apart, which is determined by the `delay: 1000` setting.

If the `concurrent` option is set to `2`, you might get something like this:

```
[
  2020-09-17T12:04:15.035Z,
  2020-09-17T12:04:15.035Z,
  2020-09-17T12:04:16.038Z
]
```

The first two tasks are executed at the same time, but the third task is delayed by the `delay` amount.

## API

### Config

- `delay`: The amounts of milliseconds between tasks.
- `concurrent`: The amount of tasks executed at the same time.

### Methods

Available on the configured object, eg.: `queue.add()`.

- `add(fn)`: Add an async function to the queue.

### Events

Available on the configured object, through the `events` key, eg.: `queue.events.on()`.

- `'done'`: Fired when all tasks are done executing.
