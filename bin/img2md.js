#!/usr/bin/env electron

// delay between polling the clipboard for changes
const watchDelay = 1000

// target file to append clip entries to
const targetDir = process.argv[2] || process.cwd()

require('../index.js')({
  targetDir
})
