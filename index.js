'use strict'

const clipboardWatcher = require('electron-clipboard-watcher')
const electron = require('electron')
const fs = require('fs')
const notifier = require('node-notifier')
const path = require('path')

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

module.exports = function (opts) {
  const {
    targetDir,
    watchDelay
  } = opts

  let imageSeq = 0

  app.on('ready', () => {
    createTray(app)

    clipboardWatcher({
      watchDelay,
      onImageChange: (image) => {
        imageSeq += 1
        const imageFilename = `image-${imageSeq}.png`
        const imagePath = path.join(targetDir, imageFilename)
        fs.writeFile(imagePath, image.toPng(), (err, res) => {
          if (err) { return console.error(err) }

          clipboard.writeText(`![${imageFilename}](${imageFilename})`)
          notifyImageChange(imagePath)
        })
      }
    })
  })

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
}
