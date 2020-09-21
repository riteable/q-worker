const EventEmitter = require('events')

function qWorker (options = {}) {
  const _delay = options.delay || 0
  const _concurrent = options.concurrent || 0
  const _queue = new Map()
  const _processing = new Map()
  const _emitter = new EventEmitter()
  let _i = 0

  function _addQueueTask (fn) {
    _i++
    _queue.set(_i, fn)

    return _i
  }

  function _addProcessingTask (i, fn) {
    _processing.set(i, fn)

    return i
  }

  function _removeQueuedTask (i) {
    return _queue.delete(i)
  }

  function _removeProcessingTask (i) {
    _processing.delete(i)

    if (_processing.size === 0) {
      return _emitter.emit('done')
    }
  }

  async function _handleTask (i, fn) {
    let res

    _removeQueuedTask(i)
    _addProcessingTask(i, fn)

    try {
      res = await fn()

      return _emitter.emit(`done:${i}`, res)
    } catch (err) {
      return _emitter.emit(`error:${i}`, err)
    } finally {
      setTimeout(() => _removeProcessingTask(i))
    }
  }

  function _work () {
    setTimeout(() => {
      let current = 0

      for (const [i, fn] of _queue) {
        if (_concurrent && current === _concurrent) {
          break
        }

        _handleTask(i, fn)

        current++
      }

      _work()
    }, _delay)
  }

  async function _add (fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('Function required.')
    }

    const i = _addQueueTask(fn)

    return new Promise((resolve, reject) => {
      _emitter.on(`done:${i}`, (res) => {
        _emitter.removeAllListeners(`done:${i}`)
        return resolve(res)
      })

      _emitter.on(`error:${i}`, (err) => {
        _emitter.removeAllListeners(`error:${i}`)
        return reject(err)
      })
    })
  }

  _work()

  return {
    add: _add,
    events: _emitter
  }
}

module.exports = qWorker
