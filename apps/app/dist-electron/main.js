"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const path$1 = require("node:path");
const child_process = require("child_process");
const path = require("path");
const micromatch = require("micromatch");
const winControl = require("win-control");
const Store = require("electron-store");
const EXTERNALS_DIR = path.resolve("./resources");
const appFolder = path$1.dirname(process.execPath);
const updateExe = path$1.resolve(appFolder, "..", "Update.exe");
const exeName = path$1.basename(process.execPath);
const processes = {};
const store = new Store();
if (!store.get("processes")) {
  store.set("processes", []);
}
electron.app.setLoginItemSettings({
  openAtLogin: true,
  path: updateExe,
  args: [
    "--processStart",
    `"${exeName}"`,
    "--process-start-args",
    '"--hidden"'
  ]
});
function getProcessPaths() {
  return store.get("processes");
}
electron.app.whenReady().then(() => {
  electron.globalShortcut.register("Alt+CommandOrControl+I", () => {
    var _a;
    const foregroundProcessPid = winControl.Window.getForeground().getPid();
    console.log("Opt in", foregroundProcessPid);
    const processPath = (_a = processes[foregroundProcessPid]) == null ? void 0 : _a.filepath;
    const processesPaths = getProcessPaths();
    if (processPath && processesPaths.indexOf(processPath) !== -1) store.set("processes", [...getProcessPaths(), processPath]);
    scaleByPid(foregroundProcessPid, 0);
  });
  electron.globalShortcut.register("Alt+CommandOrControl+O", () => {
    var _a;
    const foregroundProcessPid = winControl.Window.getForeground().getPid();
    console.log("Opt out", foregroundProcessPid);
    const processPath = (_a = processes[foregroundProcessPid]) == null ? void 0 : _a.filepath;
    if (processPath) store.set("processes", [...getProcessPaths()].filter((processPath2) => processPath2 !== processPath2));
  });
  const win = new electron.BrowserWindow({
    title: "Main window"
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile("dist/index.html");
  }
});
function scaleByPid(pid, wait = 1e4) {
  console.log("scale", pid);
  let timeout;
  let interval;
  interval = setInterval(() => {
    const foregroundWindowPID = winControl.Window.getForeground().getPid();
    if (pid === foregroundWindowPID) {
      clearInterval(interval);
      clearTimeout(timeout);
      let triggerKeybindTimeout;
      async function triggerKeybind() {
        console.log("trigger keybind");
        if (pid === foregroundWindowPID) {
          clearTimeout(triggerKeybindTimeout);
          const { Key, keyboard } = await import("@nut-tree-fork/nut-js");
          const keys = [Key.LeftControl, Key.LeftAlt, Key.S];
          await keyboard.pressKey(...keys);
          await keyboard.releaseKey(...keys);
        } else {
          triggerKeybindTimeout = setTimeout(triggerKeybind, 1e3);
        }
      }
      triggerKeybindTimeout = setTimeout(triggerKeybind, wait);
      setTimeout(
        () => {
          clearTimeout(triggerKeybindTimeout);
        },
        5 * 60 * 1e3
      );
    }
  }, 1e3);
  setTimeout(
    () => {
      clearInterval(interval);
    },
    5 * 60 * 1e3
  );
}
const child = child_process.fork(path$1.join(EXTERNALS_DIR, "process-watcher.js"));
child.on("message", (processInfo) => {
  if (processInfo.type === "process-creation") {
    processes[processInfo.payload.pid] = processInfo.payload;
  } else if (processInfo.type === "process-deletion") {
    delete processes[processInfo.payload.pid];
  }
  const processesPaths = getProcessPaths();
  if (processInfo.type === "process-creation" && micromatch.isMatch(processInfo.payload.filepath, processesPaths, {})) {
    console.log("Scaling", processInfo.payload.process);
    scaleByPid(processInfo.payload.pid);
  }
});
