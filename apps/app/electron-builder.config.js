const path = require('path')
const fs = require('fs')
const pkg = require('./package.json')

function getElectronVersion() {
  const electronPath = require.resolve('electron')

  const data = fs.readFileSync(path.join(electronPath, '..', 'package.json'))
  const version = JSON.parse(data.toString())?.version
  return version
}

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  $schema:
    'https://raw.githubusercontent.com/electron-userland/electron-builder/master/packages/app-builder-lib/scheme.json',
  asar: true,
  productName: pkg.productName,
  directories: {
    output: 'dist_electron',
  },
  files: ['dist', 'dist-electron'],
  nsis: {
    oneClick: true,
    perMachine: true,
    allowToChangeInstallationDirectory: false,
    deleteAppDataOnUninstall: false,
  },
  win: {
    appId: 'com.nhs.auto-lossless-scaling',
    requestedExecutionLevel: 'requireAdministrator',
    icon: "public/icons/icon.ico",
  },
  appId: 'com.nhs.auto-lossless-scaling',
  // generateUpdatesFilesForAllChannels: true,
  // eslint-disable-next-line no-template-curly-in-string
  artifactName: '${name}-setup-${version}-${os}.${ext}',
  // publish: ['github'],
  electronVersion: getElectronVersion(),
  extraFiles: ['./resources/**'],
}
