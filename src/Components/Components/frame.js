import React, { useRef, useEffect, useState, useCallback } from 'react'
import useEventListener from '@use-it/event-listener'
import './frame.css'
import { getFrame } from '../model/api'
import bspline  from 'b-spline'


const Frame = (props) => {
    const canvasRef = useRef(null);
    const [blob, setBlob] = useState(null)
    const { serie, frame, onFrameClick } = props

    const drawMarker = useCallback((ctx, x, y, color) => {
        x = x * ctx.canvas.width
        y = y * ctx.canvas.height
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = color || "green";
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.stroke();
    }, [])

    const drawSpline =useCallback( (ctx, tags, color) => {
        if(tags.length > 2){
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = color || "red";
            const degree = 2
            const {w,h} =  {'w': ctx.canvas.width, 'h': ctx.canvas.height}
            const points = tags.sort((a,b) =>a.i>b.i).map(tag => [tag.x * w, tag.y * h])
            const knots = [0,0, ...Array(tags.length-1).keys(), tags.length-2,tags.length-2]
            ctx.moveTo(...bspline(0, degree, points,knots));
            for(var t=0; t<1; t+=0.01) {
                ctx.lineTo(...bspline(t, degree, points,knots));
            }
            ctx.stroke();    
        }
        tags.forEach(point => {
            drawMarker(ctx, point.x, point.y, color || "red")
        })
    }, [drawMarker])

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        if (!serie || !blob) return
        const img = new Image();
        img.onload = (event) => {
            URL.revokeObjectURL(event.target.src) // 👈 This is important. If you are not using the blob, you should release it if you don't want to reuse it. It's good for memory.
            ctx.drawImage(event.target, 0, 0, ctx.canvas.width, ctx.canvas.height)
            const tags = serie.tags.filter(tag => tag.f === frame)
            tags.filter(tag => !tag.type.l).forEach(tag => drawMarker(ctx, tag.x, tag.y))
            drawSpline(ctx, tags.filter(tag => tag.type.l))
        }
        img.src = URL.createObjectURL(blob)
    }, [blob, canvasRef, serie, frame, drawMarker, drawSpline])


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
        onFrameClick(x, y)
    }, canvasRef.current)


    return (
        <canvas className="canvas" ref={canvasRef} {...props} width="1000" height="1000" />
    )
}

export default Frame;