import { Grid } from '@/components'
import { useGetProcessesQuery } from '@/queries.ts'
import { useMemo } from 'react'
import orderBy from 'lodash/orderBy'
import ProcessCard from '@/components/cards/process-card.tsx'
import DefaultShell from '@/components/shells/default-shell.tsx'

export default function HomePage() {
    const { data: processesData = [] } = useGetProcessesQuery()
    const orderedProcesses = useMemo(() => orderBy(processesData, 'lastScaledAt', 'desc'), [processesData])
    return (
        <DefaultShell>
            <Grid gap={ '6' }>
                {
                    orderedProcesses.map((process, i) => (
                        <Grid.Col key={ `${ i }-${ process.path }` } span={ 12 } mdSpan={ 6 } lgSpan={ 4 }
                                  xlSpan={ 3 }>
                            <ProcessCard process={ process }/>
                        </Grid.Col>
                    ))
                }
            </Grid>
        </DefaultShell>
    )
}
