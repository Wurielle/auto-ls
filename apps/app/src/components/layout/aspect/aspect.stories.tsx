import { Meta, StoryFn, type StoryObj } from '@storybook/react'
import { Aspect } from './index.ts'

const meta = {
    title: 'Components/Layout/Aspect',
    component: Aspect,
} satisfies Meta<typeof Aspect>

export default meta

type Story = StoryObj<typeof meta>

const Template: StoryFn<typeof Aspect> = (args) => <div style={{ display: 'flex', gap: 16 }}>
    <div style={{ flex: 1 }}>
        <Aspect { ...args } ratio={ '21:9' }><div>21:9</div></Aspect>
    </div>
    <div style={{ flex: 1 }}>
        <Aspect { ...args } ratio={ '2:1' }><div>2:1</div></Aspect>
    </div>
    <div style={{ flex: 1 }}>
        <Aspect { ...args } ratio={ '16:9' }><div>16:9</div></Aspect>
    </div>
    <div style={{ flex: 1 }}>
        <Aspect { ...args } ratio={ '4:3' }><div>4:3</div></Aspect>
    </div>
    <div style={{ flex: 1 }}>
        <Aspect { ...args } ratio={ 'square' }><div>square</div></Aspect>
    </div>
    <div style={{ flex: 1 }}>
        <Aspect { ...args } ratio={ '9:16' }><div>9:16</div></Aspect>
    </div>
</div>

export const Default = Template.bind({})
Default.args = {
    p: '5',
    bg: 'slate.100',
    maw: 500,
    w: 'full',
}

export const AsChild: Story = {
    render(args) {
        return (
            <Aspect { ...args }>
                <img src="https://source.unsplash.com/random/500x500" alt="random" style={{ objectFit: 'cover' }} />
            </Aspect>
        )
    },
    args: {
        ratio: '16:9',
        maw: 500,
        w: 'full',
        asChild: true,
    },
}
