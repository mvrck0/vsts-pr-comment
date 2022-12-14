#!/usr/bin/env node
const VstsPrComment = require('./vsts-pr-comment')
const tty = require('node:tty');

console.log('cwd', process.cwd())

let behaviour = process.argv[2] ?? 'update' // Todo: implement delete-and-new, new
let threadStatus = process.argv[3] ?? 'closed' // active, bydesign, closed, fixed, pending, unkown, wontfix
let tagValue = process.argv[4] ?? ''

const main = async () => {
  let vsts = new VstsPrComment()

  console.log(`
    org_url: ${process.env.SYSTEM_COLLECTIONURI}
    project: ${process.env.SYSTEM_TEAMPROJECT}
    repository ${process.env.BUILD_REPOSITORY_NAME}
    pr: ${process.env.SYSTEM_PULLREQUEST_PULLREQUESTID}
  `)

  // Get previous thread if any.
  let existingThread = await vsts.getTaggedThread(tagValue)
  let newThread = {
    status: threadStatus,
    comments: [
      {
        "parentCommentId": 0,
        "content": data,
        "commentType": 1
      }
    ],
    properties: {
      "vsts-pr-comment": tagValue
    }
  }

  // Create a new thread and top-level comment
  if( (behaviour == "update" && !existingThread)){
    vsts.createThread(newThread)
    console.log('Comment added')
  }

  // Update existing threads
  if(behaviour == "update" && existingThread){
    await vsts.updateThread(existingThread.id, {
      status: threadStatus
    })

    console.log('existingThread', existingThread)

    await vsts.updateComment(existingThread.id, {
      id: existingThread.comments[0].id,
      content: data,
      isDeleted: false,
    })
    
    console.log('Comment updated')
  }
}

if (process.stdin.isTTY === true){
  console.log('No data from stdin (?). Make sure to use that pipe bruh. Usage: echo "mycomment" | vsts-pr-comment')
  process.exit(1)
}

let data = ""
process.openStdin()
.on('data', (chunk) => {
  data += chunk
})
.on('end', main)