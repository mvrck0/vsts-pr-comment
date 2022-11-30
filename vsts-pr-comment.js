const http = require("node:https");

module.exports = class VstsPrComment {

  config = {
    url: process.env.SYSTEM_COLLECTIONURI,
    project: process.env.SYSTEM_TEAMPROJECT,
    repository: process.env.BUILD_REPOSITORY_NAME,
    pr: process.env.SYSTEM_PULLREQUEST_PULLREQUESTID,
    token: process.env.AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN,
  }

  constructor(config={}) {
    //this.config = Object.assign(this.config, config)
  }

  /**
   * Common getters
   */

  get url() {
    return new URL(this.config.url)
  }

  get project() {
    return this.config.project
  }

  get repository (){
    return this.config.repository
  }

  get pr () {
    return this.config.pr
  }

  get apiPath() {
    // https://dev.azure.com/{orgName}/{projectName}
    return `${this.url.pathname}${this.project}/_apis/`
  }

  get token() {
    return this.config.token
  }

  get prPath() {
    return `git/repositories/${this.repository}/pullRequests/${this.pr}`
  }

  /**
   * Cread, read, update and delete methods for threads and comments
   */
  async addComment(thread, comment = "") {
    let url = `${this.prPath}/threads/${thread}/comments`
    this.request(url, 'POST', {
      content,
      commentType: 1
    })
  }

  async updateComment(threadId, comment){
    let url = `${this.prPath}/threads/${threadId}/comments/${comment.id}`
    return await this.request(url, 'PATCH', comment)
  }

  async createThread(thread) {
    let url = `${this.prPath}/threads`
    return await this.request(url, 'POST', Object.assign({
      "comments": [
        {
          "parentCommentId": 0,
          "content": "VSTS Comment",
          "commentType": 1
        }
      ],
      "status": 0,
      "threadContext": {},
      "pullRequestThreadContext": null,
      "properties": null
    }, thread))
  }

  async updateThread(threadId, thread) {
    return await this.request(`${this.prPath}/threads/${threadId}`, 'PATCH', thread)
  }

  async getThreads() {
    let threads = await this.request(`${this.prPath}/threads`);
    return threads.value
  }

  async getTaggedThread(value = '', tag = 'vsts-pr-comment') {

    let threads = await this.getThreads()
    let thread = threads
      .filter( t => t.properties != null)
      .filter((t) => {
        return Object.keys(t.properties).indexOf(tag) > -1 && t.properties[tag]['$value'] == value
      })

    return thread.length > 0 ? thread[0] : false
  }

  /**
   * Simple wrapper for node native http
   * 
   * @param {*} path 
   * @param {*} method 
   * @param {*} body 
   * @returns 
   */
  async request(path, method = 'GET', body = null) {

    body = body ? JSON.stringify(body) : null

    return new Promise((resolve, reject) => {
      let token = Buffer.from("0:" + this.token).toString('base64')

      let options = {
        host: this.url.hostname,
        path: `${this.apiPath}${path}`,
        port: 443,
        method,
        headers: Object.assign({
          "Accept": "application/json;api-version=7.1-preview.1",
          "Authorization": `Basic ${token}`,
          "Content-Type": "application/json"
        }, body ? {
          'Content-Length': body.length
        } : {})
      }

      // Responsehandler 
      let responseHandler = (response) => {
        let data = ""
        response
          .on('data', (d) => {
            data += d.toString()
          })
          .on("end", () => {

            // Everything else than 200, 201 and 202 is unexpected and will be treated as an error
            if ([200, 201, 202].indexOf(response.statusCode) < 0) {
              reject(new Error(`${response.statusCode} - ${response.statusMessage}\n ${data}`))
            }

            // Resolve json-data
            try {
              data = JSON.parse(data)
            }
            catch {
              data = data
            }
            resolve(data);
          })
      }

      let req = http.request(options, responseHandler)

      if (body) {
        req.write(body)
      }

      req.on('error', reject)
      req.end();
    })
  }
}
