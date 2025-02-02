import { Meta, StoryFn } from '@storybook/react'
import { Divider } from './index.ts'
import { Box } from '@/components/layout/box'

const meta = {
    title: 'Components/Layout/Divider',
    component: Divider,
} satisfies Meta<typeof Divider>

export default meta

const Template: StoryFn<typeof Divider> = (args) => (
    <div>
        <Box p={'5'} bg={'slate.100'}>
            content
        </Box>
        <Divider {...args} />
        <Box p={'5'} bg={'slate.100'}>
            content
        </Box>
        <Divider {...args} />
        <Box p={'5'} bg={'slate.100'}>
            content
        </Box>
    </div>
)

export const Default = Template.bind({})
Default.args = {
    bc: 'slate.200',
}
