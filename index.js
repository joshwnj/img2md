'use strict'

const clipboardWatcher = require('electron-clipboard-watcher')
const electron = require('electron')
const fs = require('fs')
const notifier = require('node-notifier')
const path = require('path')
const leftpad = require('left-pad')

const app = electron.app
const clipboard = electron.clipboard
const Tray = electron.Tray
const Menu = electron.Menu

function createTray (app) {
  const tray = new Tray(path.join(__dirname, 'assets', 'logo.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ])
  tray.setContextMenu(contextMenu)
  return tray
}

function notifyImageChange (imagePath) {
  notifier.notify({
    title: 'ImgClip',
    message: path.basename(imagePath),
    icon: imagePath
  }, (err) => {
    if (err) {
      console.error('Notification failed', err)
    }
  })
}

function findMaxImageNum (dir, cb) {
  let max = 0
  const re = /image-(\d+)\./

  fs.readdir(dir, (err, files) => {
    if (err) { return cb(err) }

    files.forEach((f) => {
      const matches = f.match(re)
      if (!matches) { return }

      const num = parseInt(matches[1], 10)
      if (num > max) { max = num }
    })

    console.log('starting from %d', max)
    return cb(null, max)
  })
}

module.exports = function (opts) {
  const {
    targetDir,
    watchDelay
  } = opts

  findMaxImageNum(targetDir, (err, lastSeq) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    app.on('ready', () => {
      createTray(app)
      startWatcher(lastSeq)
    })
  })

  function startWatcher (initialSeq, watchDelay) {
    let imageSeq = initialSeq || 0

    clipboardWatcher({
      watchDelay,
      onImageChange: (image) => {
        imageSeq += 1
        const imageFilename = `image-${leftpad(imageSeq, 3, '0')}.png`
        const imagePath = path.join(targetDir, imageFilename)
        fs.writeFile(imagePath, image.toPng(), (err, res) => {
          if (err) { return console.error(err) }

          clipboard.writeText(`![${imageFilename}](${imageFilename})`)
          notifyImageChange(imagePath)
        })
      }
    })
  }
}
