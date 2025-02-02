import { Meta, StoryFn, type StoryObj } from '@storybook/react'
import { Scrollview } from './index.ts'
import { Box } from '@/components/layout/box'

const meta = {
    title: 'Components/Layout/Scrollview',
    component: Scrollview,
} satisfies Meta<typeof Scrollview>

export default meta

type Story = StoryObj<typeof meta>

const Template: StoryFn<typeof Scrollview> = (args) => (
    <Scrollview {...args}>
        <Box w={'200vw'} h={'200vh'}>
            content
        </Box>
    </Scrollview>
)

export const OverflowX = Template.bind({})
OverflowX.args = {
    h: 200,
    w: 200,
    x: true,
}

export const OverflowY = Template.bind({})
OverflowY.args = {
    h: 200,
    w: 200,
    y: true,
}

export const OverflowXAndY = Template.bind({})
OverflowXAndY.args = {
    h: 200,
    w: 200,
    x: true,
    y: true,
}

export const AsChild: Story = {
    render(args) {
        return (
            <Scrollview {...args}>
                <div>
                    <Box w={'200vw'} h={'200vh'}>
                        💐(❁´◡`❁)
                    </Box>
                </div>
            </Scrollview>
        )
    },
    args: {
        h: 200,
        w: 200,
        y: true,
    },
}
