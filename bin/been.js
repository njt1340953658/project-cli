#!/usr/bin/env node

// 命令执行入口
const program = require('commander') // TJ大神开发的工具，能够更好地组织和处理命令行的输入。
const config = require('../package.json')

program
	.version(config.version, '-v, --version')
	.command('init [name]', '初始化脚手架')
	
program.parse(process.argv)