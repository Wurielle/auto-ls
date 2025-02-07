import { Meta, StoryFn, type StoryObj } from '@storybook/react'
import { Transform } from './index.ts'

const meta = {
    title: 'Components/Layout/Transform',
    component: Transform,
} satisfies Meta<typeof Transform>

export default meta

type Story = StoryObj<typeof meta>

const Template: StoryFn<typeof Transform> = () => (
    <div style={{ display: 'flex', gap: 16 }}>
        <Transform rotate={'180deg'}>🐻</Transform>
        <Transform translate={['-50%', '-50%']}>🐻‍❄️</Transform>
        <Transform scale={1.3}>🐼</Transform>
        <Transform perspective={30}>
            <Transform rotateY={'45deg'} translateZ={15}>
                🦝
            </Transform>
        </Transform>
    </div>
)

export const Default = Template.bind({})
Default.args = {}

export const AsChild: Story = {
    render(args) {
        return (
            <Transform {...args}>
                <button>💐(❁´◡`❁)</button>
            </Transform>
        )
    },
    args: {
        rotate: '45deg',
        transformOrigin: ['-50%', '-50%'],
        asChild: true,
    },
}
