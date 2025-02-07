import { Meta, StoryFn, type StoryObj } from '@storybook/react'
import { Box } from './index.ts'

const meta = {
    title: 'Components/Layout/Box',
    component: Box,
} satisfies Meta<typeof Box>

export default meta

type Story = StoryObj<typeof meta>

const Template: StoryFn<typeof Box> = (args) => (
    <Box {...args}>
        <div>content</div>
    </Box>
)

export const Default = Template.bind({})
Default.args = {
    p: '5',
    bg: 'slate.100',
}

export const AsChild: Story = {
    render(args) {
        return (
            <Box {...args}>
                <div>💐(❁´◡`❁)</div>
            </Box>
        )
    },
    args: {
        p: '5',
        bg: 'slate.100',
        asChild: true,
    },
}
