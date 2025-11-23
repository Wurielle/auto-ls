import { Key } from '@nut-tree-fork/nut-js'
import { createTray } from '../tray'
import { app } from 'electron'
import { createWindow } from '../window'
import express from 'express';
import fs from 'fs'
import * as toml from 'smol-toml'
import { EXTERNALS_DIR } from '../const'

type LSFGVKProfile = {
    exe: string,
    multiplier: number,
    flow_scale: number,
    performance_mode: boolean,
    hdr_mode: boolean,
    experimental_present_mode: 'fifo'
}


const handleGameProfile = (context: { name: string, path: string}) => {
    const configDir = `${ process.env.HOME }/.config/MangoHud`
    const defaultConfigPath = `${ configDir }/MangoHud.conf`
    const gameConfigPath = `${ configDir }/${ context.name }.conf`

    const lsfgConfigDir = `${ process.env.HOME }/.config/lsfg-vk`
    const lsfgDefaultConfigPath = `${ lsfgConfigDir }/conf.toml`
    const lsfgGameConfigPath = `${ lsfgConfigDir }/${ context.name }.toml`

    const lsfgConfig = toml.parse(fs.readFileSync(lsfgDefaultConfigPath, 'utf-8'))

    if (!fs.existsSync(gameConfigPath) && fs.existsSync(defaultConfigPath)) {
        fs.copyFileSync(defaultConfigPath, gameConfigPath)
    }

    if (!fs.existsSync(lsfgGameConfigPath)) {
        (lsfgConfig.game as LSFGVKProfile[]) = [
            {
                exe: context.name,
                multiplier: 2,
                flow_scale: 1,
                performance_mode: false,
                hdr_mode: false,
                experimental_present_mode: 'fifo',
            }
        ]
        console.log(lsfgConfig)
        fs.writeFileSync(lsfgGameConfigPath, toml.stringify(lsfgConfig))
    }
}

app.whenReady().then(async () => {
    const { window } = createWindow()
    createTray({ window })
    const http = require('http');

    const app = express();
    const port = 3000;

    // Middleware to parse JSON
    app.use(express.json());

    // POST endpoint for game profiles
    app.post('/game-profile', (req, res) => {
        const { name, path } = req.body;

        console.log('=== Received game profile request ===');
        console.log('Name:', name);
        console.log('Path:', path);
        console.log('=====================================');
        handleGameProfile({ name, path })
        // Send back confirmation
        res.json({ status: 'ok', received: req.body });
    });

    // Start server
    app.listen(port, () => {
        console.log(`Game profile server running on http://localhost:${port}`);
    });


    // const execSync = require('child_process').execSync
    // execSync(`echo 'export PATH="$PATH:${ EXTERNALS_DIR }"' >> ~/.bashrc`)
    // console.log(EXTERNALS_DIR)
    
}).catch(console.error)