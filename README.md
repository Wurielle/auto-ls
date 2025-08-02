
<div align="center">
  <h1>Auto Lossless Scaling</h1>
  <p>Automatically scale using Lossless Scaling</p>
  <img width="786" height="593" alt="image" src="https://github.com/user-attachments/assets/16b95661-52c4-4ce3-85d1-8992ea454751" />
</div>

## Why does it exist?
> "Lossless Scaling already has a similar feature" is what a non-lazy person would say. Unfortunately, that person is not me.\
> — Me

Creating a profile and searching for a game's exe can sometimes be a pain and is not my favorite part of using LS, especially if you have a HTPC setup that uses a controller as primary input. This means you either manually create a profile for every game you want to scale or you must have a keyboard available in order to scale after launching a game.

On top of that, the scaling shortcut does not work on some games unless Lossless Scaling is running as admin. This means you have to accept Window's UAC everytime you launch Lossless Scaling which is quite annoying for a lot of reasons (UAC timeout, must also have a keyboard ready, etc).

Auto Lossless Scaling slightly improves the scaling experience by solving these issues and controlling the scaling on its own whenever your game is launching. You'll no longer have to worry about any of that.

## How does it work?
Auto LS is installed with Admin rights which enables it to launch other apps as admin without UAC (here LS and RivaTuner). It starts automatically when you log into your PC and makes sure LS and RivaTuner are always running as admin by the time you launch a game. This is particularly convenient for HTPCs that boot straight into Steam's Big Picture for instance.

Auto LS provides 2 new shortcuts:
- `Ctrl` + `Alt` + `I` for adding auto-scaling to the active window process (opt in)
- `Ctrl` + `Alt` + `O` for removing auto-scaling to the active window process (opt out)

Whenever a process is opted in, Auto LS will watch the creation of this process in the future, start LS and start scaling when the process is created. 

By opting in, a new profile is created in LS and, optionally, a new profile in RivaTuner (which is based on your default RivaTuner Profile). This allows you to only fiddle with the framerate limit and your framegen multiplier once. Every time you launch a game that has been opted in, Auto LS will launch LS and RivaTuner and scale the game without you having to do anything.

## How to use

* Launch Auto LS
* Launch a game
* Enable auto scaling with `Ctrl` + `Alt` + `I`
* Open LS and update your config once based on your game's performance
  * **Note:** When scaling, Auto LS will overwrite the "Default" profile inside LS with the one named after your process. You will have to set default settings under the new "Auto Lossless Scaling" profile.
    <img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/53f0b381-4af4-4a88-9bc4-37028226dea4" />
* (Optional) Open RivaTuner and update the base framerate limit for your game in order to not exceed your monitor's refresh rate
* Close your game and restart it
* LS will automatically scale after the game has been focused and some time has passed (10 seconds by default)
* Enjoy!

## Download

You can check the latest release [here](https://github.com/Wurielle/auto-lossless-scaling/releases).

## Caveats

* You can only start opting in if the process has been launched AFTER Auto LS
* Auto LS must be running in order to auto scale
* Only works in Windows

## Known issues

* RivaTuner can fail to restart after a profile has been created
  * Workaround: re-opt in a second time
