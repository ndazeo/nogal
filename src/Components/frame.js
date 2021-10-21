import React, { useRef, useEffect, useState, useCallback } from 'react'
import useEventListener from '@use-it/event-listener'
import './frame.css'


const Frame = (props) => {
    const canvasRef = useRef(null);
    const [blob, setBlob] = useState(null)
    const [tagsDict, setTagsDict] = useState({})
    const [image, setImage] = useState(null)
    const [frameWindow, setFrameWindow] = useState({left:0,top:0,zoom:1})
    const [pan, setPan] = useState(null)
    const {
        serie, serieTags, tags, frame, api, currentTag,
        onFrameMouseDown, onFrameMouseUp, onFrameMouseMove
    } = props

    useEffect(() => {
        if (tags) setTagsDict(tags.reduce((acc, tag) => ({ [tag._id]: tag, ...acc }), {}))
    }, [tags])

    const zoomXY = useCallback( (x,y, ctx) => {
        return [ 
            (x - frameWindow.left) / frameWindow.zoom * ctx.canvas.width, 
            (y - frameWindow.top) / frameWindow.zoom * ctx.canvas.height 
        ]
    }, [frameWindow])

    const realXY = useCallback(
        (x,y) => [x*frameWindow.zoom+frameWindow.left, y*frameWindow.zoom+frameWindow.top],
        [frameWindow],
    )

    const drawMarker = useCallback((ctx, x, y, color, rad) => {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = color || "green";
        ctx.arc(...zoomXY(x, y, ctx), rad||8, 0, 2 * Math.PI);
        ctx.stroke();
    }, [zoomXY])

    const drawLine = useCallback((ctx, tags, color) => {
        if (tags.length > 1) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = color || "red";
            const points = tags.sort((a, b) => a.i - b.i)
            ctx.moveTo(...zoomXY(points[0].x, points[0].y, ctx));
            for (var t = 0; t < points.length; t++) {
                ctx.lineTo(...zoomXY(points[t].x, points[t].y, ctx));
            }
            ctx.stroke();
        }
        tags.forEach(point => {
            drawMarker(ctx, point.x, point.y, color || "red", 3)
        })
    }, [drawMarker, zoomXY])

    

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
        setFrameWindow({left:0,top:0,zoom:1})
    }, [blob])

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        if (!serieTags || !image) return
        let {left,top,zoom} = frameWindow
        left = left * ctx.canvas.width
        top = top * ctx.canvas.height
        ctx.drawImage(image, -left/zoom, -top/zoom, (ctx.canvas.width)/zoom, (ctx.canvas.height)/zoom)
        const ftags = serieTags.filter(tag => tag.f === frame)
        const availTags = ftags.reduce((acc, tag) => ({ ...acc, [tag.k]: tagsDict[tag.k] }), {})
        Object.entries(availTags).forEach(([key, kind],) => {
            const ktags = ftags.filter(tag => tag.k === key)
            const color = currentTag && key === currentTag._id ? "white" : kind.c
            if (kind.l === 1) {
                drawLine(ctx, ktags, color)
            } else {
                ktags.forEach(tag => drawMarker(ctx, tag.x, tag.y, color))
            }
        })
    }, [image, canvasRef, frame, drawMarker, drawLine, serieTags, tagsDict, currentTag, frameWindow])

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
        setPan(null)
        onFrameMouseUp(...realXY(x, y))
    }, canvasRef.current)

    useEventListener('mousedown', (event) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height
        if(!onFrameMouseDown(...realXY(x, y))) {
            setPan({x,y})
        }
    }, canvasRef.current)

    useEventListener('mousemove', (event) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height
        if(pan) {
            setFrameWindow((f) => {
                let left = f.left - (x - pan.x) * f.zoom
                let top = f.top - (y - pan.y) * f.zoom
                if (left<0) left = 0
                if (top<0) top = 0
                return {...f, left, top}
            })
            setPan({x,y})
        }else{
            onFrameMouseMove(...realXY(x, y))
        }
    }, canvasRef.current)

    useEventListener('wheel', (event) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height
        const dy = event.deltaY/1000
        setFrameWindow(
            (f) => {
                let zoom = f.zoom+dy
                let left = f.left - x * dy
                let top = f.left - y * dy
                if(zoom>=1 || zoom<0) {
                    zoom = 1
                    left = 0
                    top = 0
                }
                return {...f, zoom, left, top}
            }
        )
    }, canvasRef.current)


    return (
        <canvas className="canvas" ref={canvasRef} {...props} width="1000" height="1000" />
    )
}

export default Frame;