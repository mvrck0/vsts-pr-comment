#!/usr/bin/env node
const VstsPrComment = require('./vsts-pr-comment')
const tty = require('node:tty');

console.log('cwd', process.cwd())

let behaviour = process.argv[2] ?? 'update' // Todo: implement delete-and-new, new
let threadStatus = process.argv[3] ?? 'closed' // active, bydesign, closed, fixed, pending, unkown, wontfix
let tagValue = process.argv[4] ?? ''

const main = async () => {
  let vsts = new VstsPrComment()

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
  }

  // Update existing threads
  if(behaviour == "update" && existingThread){
    await vsts.updateThread(existingThread.id, {
      status: threadStatus
    })
    console.log(existingThread.comments.map( c => ({ id: c.id, date: c.publishedDate })))

    console.log(await vsts.updateComment(existingThread.id, {
      id: 1,
      content: data
    }))
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







// let vsts = new VstsPrComment()

// let threads = await vsts.getThreads()

// let thread = threads.pop()
// console.log(thread)

// let newThread = vsts.makeThread()
// newThread.comments[0].content = "!Test Content!.."
// // /315


// let taggedThread = await vsts.getTaggedThread('bar','foo')

// console.log('taggedThread', taggedThread)

// // let nt = await vsts.request('git/repositories/allegro-configuration/pullRequests/52/threads', 'POST', newThread)
// // console.log(nt)
