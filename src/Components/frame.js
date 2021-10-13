import React, { useRef, useEffect, useState, useCallback } from 'react'
import useEventListener from '@use-it/event-listener'
import './frame.css'


const Frame = (props) => {
    const canvasRef = useRef(null);
    const [blob, setBlob] = useState(null)
    const [tagsDict, setTagsDict] = useState({})
    const [image, setImage] = useState(null)
    const {
        serie, serieTags, tags, frame, api,
        onFrameMouseDown, onFrameMouseUp, onFrameMouseMove
    } = props

    useEffect(() => {
        if (tags) setTagsDict(tags.reduce((acc, tag) => ({ [tag._id]: tag, ...acc }), {}))
    }, [tags])

    const drawMarker = useCallback((ctx, x, y, color, rad) => {
        x = x * ctx.canvas.width
        y = y * ctx.canvas.height
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = color || "green";
        ctx.arc(x, y, rad||8, 0, 2 * Math.PI);
        ctx.stroke();
    }, [])

    const drawLine = useCallback((ctx, tags, color) => {
        if (tags.length > 1) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = color || "red";
            const [w, h] = [ctx.canvas.width, ctx.canvas.height]
            const points = tags.sort((a, b) => a.i > b.i)
            ctx.moveTo(points[0].x * w, points[0].y * h);
            for (var t = 0; t < points.length; t++) {
                ctx.lineTo(points[t].x * w, points[t].y * h);
            }
            ctx.stroke();
        }
        tags.forEach(point => {
            drawMarker(ctx, point.x, point.y, color || "red", 3)
        })
    }, [drawMarker])

    useEffect(() => {
        if(!blob) {
            setImage(null)
            return
        }
        const img = new Image();
        img.onload = (event) => {
            URL.revokeObjectURL(event.target.src) // 👈 This is important. If you are not using the blob, you should release it if you don't want to reuse it. It's good for memory.
            setImage(event.target)
        }
        img.src = URL.createObjectURL(blob)
    }, [blob])

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        if (!serieTags || !image) return
        ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height)
        const ftags = serieTags.filter(tag => tag.f === frame)
        const availTags = ftags.reduce((acc, tag) => ({ ...acc, [tag.k]: tagsDict[tag.k] }), {})
        Object.entries(availTags).forEach(([key, kind],) => {
            const ktags = ftags.filter(tag => tag.k === key)
            if (kind.l === 1) {
                drawLine(ctx, ktags, kind.c)
            } else {
                ktags.forEach(tag => drawMarker(ctx, tag.x, tag.y, kind.c))
            }
        })
    }, [image, canvasRef, frame, drawMarker, drawLine, serieTags, tagsDict])

    useEffect(() => {
        if (serie) {
            const file = serie.files
                .filter(file => file.f <= frame)
                .reduce((acc, file) => (acc && acc.f > file.f) ? acc : file, null)
            api.getFrame(file.path, frame - file.f).then(setBlob)
        }
    }, [serie, frame, api])

    useEventListener('mouseup', (event) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height
        onFrameMouseUp(x, y)
    }, canvasRef.current)

    useEventListener('mousedown', (event) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height
        onFrameMouseDown(x, y)
    }, canvasRef.current)

    useEventListener('mousemove', (event) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height
        onFrameMouseMove(x, y)
    }, canvasRef.current)

    return (
        <canvas className="canvas" ref={canvasRef} {...props} width="1000" height="1000" />
    )
}

export default Frame;