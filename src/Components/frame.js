import React, { useRef, useEffect, useState } from 'react'
import useEventListener from '@use-it/event-listener'
import './frame.css'
import { getFrame } from '../model/api'


const Frame = (props) => {
    const canvasRef = useRef(null);
    const [blob, setBlob] = useState(null)
    const { serie, frame, onClick } = props

    const drawMarker = (ctx, x, y) => {
        x = x * ctx.canvas.width
        y = y * ctx.canvas.height
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "green";
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.stroke();
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        if (!serie || !blob) return
        const img = new Image();
        img.onload = (event) => {
            URL.revokeObjectURL(event.target.src) // 👈 This is important. If you are not using the blob, you should release it if you don't want to reuse it. It's good for memory.
            ctx.drawImage(event.target, 0, 0, ctx.canvas.width, ctx.canvas.height)
            const [x, y] = [event.target.width, event.target.height]
            serie.tags.filter(tag => tag.f === frame).forEach(tag => {
                drawMarker(ctx, tag.x / x, tag.y / y)
            })
        }
        img.src = URL.createObjectURL(blob)
    }, [blob, canvasRef, serie, frame])


    useEffect(() => {
        if (serie) {
            const file = serie.files
                .filter(file => file.f <= frame)
                .reduce((acc, file) => (acc && acc.f > file.f) ? acc : file, null)
            getFrame(file.path, frame - file.f).then(setBlob)
        }
    }, [serie, frame])


    useEventListener('click', (event) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height
        onClick(x, y)
    }, canvasRef.current)


    return (
        <canvas className="canvas" ref={canvasRef} {...props} width="1000" height="1000" />
    )
}

export default Frame;