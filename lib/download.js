#!/usr/bin/env node

const download = require('download-git-repo') // download-git-repo负责下载对应模板项目的git仓库
const ora = require('ora') // 一个优雅地命令行交互spinner
const path = require('path')

const URL = {
  'vue-tempate': 'github:njt1340953658/vue-template#master',
  'vue3-vite': 'https://github.com/njt1340953658/v3-admin-vite#master',
  'react-templete': 'github:njt1340953658/react-template#master'
}

module.exports = function (tenplate, target) {
  console.log(tenplate)
  target = path.join(target || 'template')
  return new Promise((resolve, reject) => {
    const url = URL[tenplate]
    const spinner = ora(`正在下载,源地址:${url}`)
    spinner.start()
    download(url,
      target, {
        clone: true
      }, (err) => {
        console.log(err)
        if (err) {
          spinner.fail()
          reject(err)
        } else {
          spinner.succeed()
          resolve(target)
        }
      })
  })
}
