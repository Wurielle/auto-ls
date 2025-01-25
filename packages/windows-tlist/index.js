'use strict'
var exec = require('child_process').exec
var path = require('path')

/**
 * @typedef Memory
 * @property {number} current - The current memory in KB.
 * @property {number} peak - The peak memory in KB.
 */

/**
 * @typedef Thread
 * @property {number} id - The ID of the process.
 * @property {string} startAddress - The hex address of the thread.
 * @property {string} lastError - Hex string identifying the last error.
 * @property {string} state - The current state of the thread, in lowercase. waiting, running, etc.
 */

/**
 * @typedef Module
 * @property {string} version - The version of the module.
 * @property {string} _attributes - List of attributes (Unclear what these mean from tlist documentation). Don't rely on this property. The format will change once I figure out what it means.
 * @property {string} address - The hex address of the module.
 */

/**
 * @typedef ProcessInfo
 * @property {Array<Module>} modules - List of modules (DLLs) loaded by the process.
 * @property {Array<Thread>} threads - List of execution threads running in the process.
 * @property {string} workingDirectory - The current directory the process is running in.
 * @property {string} command - The full command line used to execute the process, including any arguments.
 * @property {Memory} virtualMemory - The current and peak virtual memory usage by the process in KB.
 * @property {Memory} workingMemory - The current and peak working set memory usage by the process in KB.
 * @property {number} threadCount - The number of threads contained by the process. This should match the length of the threads array. Retained for completeness.
 */

/**
 * @param {number} pid - The process ID to report on. If empty, will report on tlist itself.
 * @return {Promise<ProcessInfo>} Information on the process.
 */
function getProcessInfo(pid) {
    if (!pid) {
        pid = 'tlist.exe'
    }
    else {
        pid = parseInt(pid, 10)
    }

    return new Promise(promiseBody)

    function promiseBody(resolve, reject) {
        exec('"' + path.join(__dirname, 'tlist.exe') + '" "' + pid + '"', afterExec)

        function afterExec(err, stdout, stderr) {
            var opt = 'gim',
                rex = {
                    modules: new RegExp('^\\s*([0-9\\.]+?)\\s+(\\w+?)\\s+([0-9a-fx]+?)\\s+(.*?)\\s*$', opt),
                    threads: new RegExp('^\\s*(.*?)\\s+Win32StartAddr\\s*:\\s*(.*?)\\s+LastErr\\s*:\\s*(.*?)\\s+State\\s*:\\s*(.*?)\\s*$', opt),
                    workingDirectory: new RegExp('^\\s*CWD\\s*:\\s*(.*?)\\s*$', opt),
                    command: new RegExp('^\\s*CmdLine\\s*:\\s*(.*?)\\s*$', opt),
                    virtualMemory: new RegExp('^\\s*VirtualSize\\s*:\\s*([0-9]+)\\s*KB\\s+PeakVirtualSize\\s*:\\s*([0-9]+)\\s*KB\\s*$', opt),
                    workingMemory: new RegExp('^\\s*WorkingSetSize\\s*:\\s*([0-9]+)\\s*KB\\s+PeakWorkingSetSize\\s*:\\s*([0-9]+)\\s*KB\\s*$', opt),
                    threadCount: new RegExp('^\\s*NumberOfThreads\\s*:\\s*([0-9]+)\\s*$', opt),
                },
                match,
                res = {
                    modules: [],
                    threads: [],
                    workingDirectory: '',
                    command: '',
                    virtualMemory: {
                        current: 0,
                        peak: 0,
                    },
                    workingMemory: {
                        current: 0,
                        peak: 0,
                    },
                    threadCount: 0,
                }

            if (err) {
                reject(err)
                return
            }

            // Modules
            while (match = rex.modules.exec(stdout)) {
                res.modules.push({
                    version: match && match[1] || '',
                    _attributes: match && match[2] || '',
                    address: match && match[3] || '0x0',
                    path: match && match[4] || '',
                })
            }

            // Thread status
            while (match = rex.threads.exec(stdout)) {
                res.threads.push({
                    id: parseInt(match && match[1] || '0', 10),
                    startAddress: match && match[2] || '0x0',
                    lastError: match && match[3] || '0x0',
                    state: (match && match[4] || 'unknown').toLowerCase(),
                })
            }

            // CWD
            match = rex.workingDirectory.exec(stdout)
            res.workingDirectory = match && match[1] || res.workingDirectory

            // Cmd Line
            match = rex.command.exec(stdout)
            res.command = match && match[1] || ''

            // Virtual Memory
            match = rex.virtualMemory.exec(stdout)
            res.virtualMemory = {
                current: parseInt(match && match[1] || '0', 10),
                peak: parseInt(match && match[2] || '0', 10),
            }

            // Working Memory
            match = rex.workingMemory.exec(stdout)
            res.workingMemory = {
                current: parseInt(match && match[1] || '0', 10),
                peak: parseInt(match && match[2] || '0', 10),
            }

            // Thread Count
            match = rex.threadCount.exec(stdout)
            res.threadCount = parseInt(match && match[1] || '0', 10)

            resolve(res)
        }
    }
}

module.exports = {

    /**
   * @param {number} pid - The process ID to report on. If empty, will report on tlist itself.
   * @return {Promise<ProcessInfo>} Information on the process.
   */
    getProcessInfo: getProcessInfo,
}
