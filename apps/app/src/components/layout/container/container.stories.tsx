import { Meta, StoryFn, type StoryObj } from '@storybook/react'
import { Container } from './index.ts'
import { Box } from '@/components/layout/box'

const meta = {
    title: 'Components/Layout/Container',
    component: Container,
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof Container>

export default meta

type Story = StoryObj<typeof meta>

const Template: StoryFn<typeof Container> = (args) => (
    <Container {...args}>
        <Box p={'5'} bg={'slate.200'}>
            content
        </Box>
    </Container>
)

export const Default = Template.bind({})
Default.args = {
    bg: 'slate.100',
}

export const Size = Template.bind({})
Size.args = {
    size: 'md',
    bg: 'slate.100',
}

export const AsChild: Story = {
    render(args) {
        return (
            <Container {...args}>
                <div>💐(❁´◡`❁)</div>
            </Container>
        )
    },
    args: {
        bg: 'slate.100',
        asChild: true,
    },
}
