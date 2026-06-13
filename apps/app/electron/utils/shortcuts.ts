import { Key } from '@nut-tree-fork/nut-js'

export function nutKeyToElectronAccelerator(keys: number[]): string {
    const keyMap: Record<number, string> = {
        [Key.LeftControl]: 'CommandOrControl',
        [Key.RightControl]: 'CommandOrControl',
        [Key.LeftAlt]: 'Alt',
        [Key.RightAlt]: 'Alt',
        [Key.LeftShift]: 'Shift',
        [Key.RightShift]: 'Shift',
        [Key.LeftWin]: 'Super',
        [Key.RightWin]: 'Super',
        [Key.A]: 'A', [Key.B]: 'B', [Key.C]: 'C', [Key.D]: 'D', [Key.E]: 'E',
        [Key.F]: 'F', [Key.G]: 'G', [Key.H]: 'H', [Key.I]: 'I', [Key.J]: 'J',
        [Key.K]: 'K', [Key.L]: 'L', [Key.M]: 'M', [Key.N]: 'N', [Key.O]: 'O',
        [Key.P]: 'P', [Key.Q]: 'Q', [Key.R]: 'R', [Key.S]: 'S', [Key.T]: 'T',
        [Key.U]: 'U', [Key.V]: 'V', [Key.W]: 'W', [Key.X]: 'X', [Key.Y]: 'Y',
        [Key.Z]: 'Z',
        [Key.Num0]: '0', [Key.Num1]: '1', [Key.Num2]: '2', [Key.Num3]: '3',
        [Key.Num4]: '4', [Key.Num5]: '5', [Key.Num6]: '6', [Key.Num7]: '7',
        [Key.Num8]: '8', [Key.Num9]: '9',
    }

    return keys
        .map(k => keyMap[k])
        .filter(Boolean)
        .join('+')
}
