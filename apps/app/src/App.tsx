import { Container, Group, Grid, Stack } from '@/components'
import { Avatar } from '@/components/ui/avatar.tsx'
import { Button, Input, Text, Box, Card } from '@chakra-ui/react'
import logo64 from '@/assets/icons/64x64.png'
import pkg from '~/package.json'
import { Field } from '@/components/ui/field.tsx'
import { InputGroup } from '@/components/ui/input-group.tsx'
import { FileUploadRoot, FileUploadTrigger } from '@/components/ui/file-upload.tsx'
import { Icon } from "@chakra-ui/react"
import { MdTimer } from "react-icons/md"
import { useGetProcessesQuery } from '@/queries.ts'

function App() {
    const {data: processesData} = useGetProcessesQuery()
  return (
      <Container>
      <Box py={"48px"} divideY={"1px"}>
          <Stack py={'6'}>
              <Group justify={'between'}>
                  <Group>
                      <Avatar shape={'rounded'} src={logo64}/>
                      <Text fontWeight={'bold'}>{pkg.productName}</Text>
                  </Group>
                  <Text>{pkg.version}</Text>
              </Group>
          </Stack>
          <Stack py={'6'}>
              <Field invalid label="Lossless Scaling Path">
                  <InputGroup
                      width={"full"}
                      endElement={
                        <FileUploadRoot>
                            <FileUploadTrigger asChild>
                                <Button variant="outline" size="2xs">
                                    Browse
                                </Button>
                            </FileUploadTrigger>
                        </FileUploadRoot>
                      }
                  >
                    <Input placeholder="LosslessScaling.exe" />
                  </InputGroup>
              </Field>
          </Stack>
          <Stack py={'6'}>
              <Grid gap={'6'}>
                  {
                      processesData?.map((path, i) => (
                          <Grid.Col key={i} span={12} mdSpan={6} lgSpan={4} xlSpan={3}>
                              <Card.Root>
                                  <Card.Body gap="2">
                                      <Group justify={'between'}>
                                          <Avatar shape={'rounded'} src={logo64}/>
                                              <Button variant="outline">Edit</Button>
                                      </Group>
                                      <Group justify={'between'}>
                                          <Card.Title>{path.split('\\').pop().replace('.exe', '')}</Card.Title>
                                      </Group>
                                  </Card.Body>
                                  <Card.Footer>
                                      <Group justify={'between'} grow>
                                          <Card.Description>
                                              5 minutes ago
                                          </Card.Description>
                                          <Card.Description>
                                              <Group>
                                                  <Icon>
                                                      <MdTimer />
                                                  </Icon>
                                                  <Text>4000 ms</Text>
                                              </Group>
                                          </Card.Description>
                                      </Group>
                                  </Card.Footer>
                              </Card.Root>
                          </Grid.Col>
                      ))
                  }
              </Grid>
          </Stack>
      </Box>
      </Container>
  )
}

export default App
