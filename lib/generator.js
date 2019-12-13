#!/usr/bin/env node

const path = require('path')
const rm = require('rimraf').sync
const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')

const exclude = [
  '.png', '.jpg', '.JPG', '.JPEG'
]

module.exports = function (metadata = {}, source, dest = '.') {
  if (source) {
    return new Promise((resolve, reject) => {
      Metalsmith(process.cwd())
        .metadata(metadata)
        .clean(false)
        .source(source)
        .destination(dest)
        .use((files, metalsmith, done) => {
          const meta = metalsmith.metadata()
          Object.keys(files).forEach(fileName => {
            if (exclude.indexOf(path.extname(fileName)) == -1) {
              const t = files[fileName].contents.toString()
              files[fileName].contents = Buffer.from(Handlebars.compile(t)(meta))
            } else {
              void null
            }
          })
          done()
        }).build(err => {
          if (err) {
            rm(source)
            reject(err)
          } else {
            resolve(source)
          }
        })
    })
  } else {
    return Promise.reject(new Error(`模板地址不存在：${source}`))
  }
}