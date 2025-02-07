import { Meta, StoryFn } from '@storybook/react'
import { Position } from './index.ts'

const meta = {
    title: 'Components/Layout/Position',
    component: Position,
} satisfies Meta<typeof Position>

export default meta

const Template: StoryFn<typeof Position> = (args) => (
    <Position {...args} bs={'solid'} bc={'slate.200'} bw={1} p={'8'} display={'inline-flex'}>
        {/* Corners */}
        <Position absolute top left translate={'-50%, -50%'} br={'full'} p={'3'} bs={'solid'} bc={'slate.200'} bw={1} />
        <Position absolute top right translate={'50%, -50%'} br={'full'} p={'3'} bs={'solid'} bc={'slate.200'} bw={1} />
        <Position absolute bottom left translate={'-50%, 50%'} br={'full'} p={'3'} bs={'solid'} bc={'slate.200'} bw={1} />
        <Position absolute bottom right translate={'50%, 50%'} br={'full'} p={'3'} bs={'solid'} bc={'slate.200'} bw={1} />

        {/* Circle */}
        <Position absolute inset br={'full'} p={'3'} bs={'solid'} bc={'slate.200'} bw={1} />

        {/* Bordered Box */}
        <Position absolute top={'50%'} left={'50%'} translate={'-25%, -50%'} p={'5'} bs={'solid'} bc={'slate.200'} bw={1} z={1} rotate={'45deg'} />

        {/* Background Box */}
        <Position absolute top={'50%'} left={'50%'} translate={'-75%, -50%'} p={'5'} bg={'slate.100'} rotate={'45deg'} />
    </Position>
)

export const Default = Template.bind({})
Default.args = {}
