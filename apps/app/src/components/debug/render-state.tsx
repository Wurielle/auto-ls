import { useEffect, useId, useState } from 'react'

export const RenderState: React.FC = () => {
    const id = useId()
    const [count, setCount] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prev) => prev + 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [setCount])
    return (
        <div>
            <div>Component rerendered if this value changed: {count}</div>
            <div>Component rerendered for the first time if this value changed: {id}</div>
        </div>
    )
}
