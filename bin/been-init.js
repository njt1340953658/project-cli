#!/usr/bin/env node

const path = require('path') // path模块,路径衔接
const fs = require('fs') // 载入fs模块，readFile读取文件
const program = require('commander') // commander负责读取命令
const glob = require('glob') // npm i glob -D 全局命令
const chalk = require('chalk') // 改变命令行输出样式
const logSymbols = require('log-symbols') // log命令打印
const download = require('../lib/download.js') // download-git-repo负责下载对应模板项目的git仓库
const inquirer = require('../lib/inquirer.js') // inquirer负责问询，以及多模板的设置下载
const generator = require('../lib/generator.js')

program.usage('<project-name>').parse(process.argv)

let projectName = program.args[0]
let next = undefined

if (!projectName) {
  program.help()
  return false
}

const list = glob.sync('*')
let rootName = path.basename(process.cwd())

if (list.length) {
  let length = list.filter(name => {
    const fileName = path.resolve(process.cwd(), path.join('.', name))
    const isDir = fs.statSync(fileName).isDirectory()
    return name.indexOf(projectName) !== -1 && isDir
  }).length
  if (Boolean(length)) {
    console.log(`项目${projectName}已经存在`)
  } else {
    next = Promise.resolve(projectName)
  }
} else if (rootName === projectName) {
  next = inquirer.isEmpty().then(answers => {
    return Promise.resolve(answers.rootName ? '.' : projectName)
  })
} else {
  next = Promise.resolve(projectName)
}

next && go()

// 模板下载
function down () {
  return next.then(async projectRoot => {
    if (projectRoot == '.') {
      void null
    } else {
      fs.mkdirSync(projectRoot)
    }
    let answers = await inquirer.template()
    return download(answers.template, projectRoot).then(target => ({
      projectRoot,
      downloadTemp: target
    }))
  })
}

// 模板替换内容
function inqGen (context) {
  return inquirer.init().then(answers => {
    return {
      ...context,
      metadata: {
        ...answers
      }
    }
  }).catch(err => {
    return Promise.reject(err)
  })
}

function go() {
  down().then(context => {
    return inqGen(context)
  }).then(context => {
    let {
      metadata,
      projectRoot,
      downloadTemp
    } = context
    return generator(metadata, projectRoot, downloadTemp)
  }).then(context => {
    console.log('......')
    console.log(logSymbols.success, chalk.green('创建成功:'))
    console.log(chalk.blue(`进入项目目录：cd ${context}`))
    console.log(chalk.blue(`安装依赖: yarn setup`))
    console.log(chalk.blue(`启动项目: yarn dev`))
  }).catch(err => {
    console.error(logSymbols.error, chalk.red(`创建失败：${err}`))
  })
}