export class PromisedBatchRequest {
  constructor(web3) {
    this.web3 = web3
    this.reset()
  }

  /**
   * Add a request to the batch
   * @param _request Must be a .request call (e.g. web3.eth.getBlock.request)
   * @param params Params passed to the normal call in order, separated by comma
   */
  add(_request, ...params) {
    // eslint-disable-next-line max-len
    const request = new Promise((resolve, reject) => this.batch.add(_request.call(null, ...params, (err, data) => (err ? reject(err) : resolve(data)))))
    this.requests.push(request)
  }

  async execute() {
    this.batch.execute()
    return Promise.all(this.requests)
  }

  reset() {
    this.batch = new this.web3.BatchRequest()
    this.requests = []
  }
}

export class PromisedBatchRequestWithCallbacks extends PromisedBatchRequest {
  /**
   * Add a request to the batch
   * @param _request Must be a .request call (e.g. web3.eth.getBlock.request)
   * @param {Object} params Order matters but keys don't matter, except `callback`, which should come last in object
   */
  add(_request, params) {
    let { callback } = params
    if (typeof callback !== 'function') callback = () => {}
    // eslint-disable-next-line max-len
    const request = new Promise((resolve, reject) => this.batch.add(_request.call(null, ...Object.values(params), async (err, data) => {
      if (err) {
        await callback(err, null)
        return reject(err)
      }

      await callback(null, data)
      return resolve(data)
    })))
    this.requests.push(request)
  }
}
