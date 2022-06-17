import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import useEventListener from '@use-it/event-listener'
import Loading from '../../Components/loading'
import './frame.css'


const Frame = (props) => {
    const loader = useMemo(() => new Worker('Workers/loader.js'), [])
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)
    const [frameWindow, setFrameWindow] = useState({left:0,top:0,zoom:1})
    const [pan, setPan] = useState(null)
    const {
        selectedImage, elementTags, tagsDict, api, currentTag,
        onFrameMouseDown, onFrameMouseUp, onFrameMouseMove, onFrameMouseLeave
    } = props

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
            let s = points[0].s;
            for (var t = 0; t < points.length; t++) {
                if (points[t].s !== s) {
                    ctx.moveTo(...zoomXY(points[t].x, points[t].y, ctx));
                    s = points[t].s;
                }
                else
                    ctx.lineTo(...zoomXY(points[t].x, points[t].y, ctx));
            }
            ctx.stroke();
        }
        tags.forEach(point => {
            drawMarker(ctx, point.x, point.y, color || "red", 3)
        })
    }, [drawMarker, zoomXY])
    
    loader.onmessage = (msg) => {
        const {result, id} = msg.data;
        const img = new Image();
        img.onload = (event) => {
            URL.revokeObjectURL(event.target.src) // 👈 This is important. If you are not using the blob, you should release it if you don't want to reuse it. It's good for memory.
            
            setImage(image => {
                return !image || image.id !== id ? 
                    image : {id, image: img}
                }
            )
            setFrameWindow({left:0,top:0,zoom:1})
        }
        img.src = URL.createObjectURL(new Blob([result]))
    }


    useEffect(() => {
        //loader.terminate();
        if (!selectedImage) return;
        let id = selectedImage._id;
        setImage({id})
       
        const requests = [{
            method: 'getFrame',
            params: [api.URL, api.db, api.token, selectedImage.path, 0], 
            ret: {id}
        }]
        loader.postMessage(requests);

    }, [selectedImage, api, loader])
 

    useEffect(() => {
        setImageLoading(image && !image.image);
    }, [image])

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        if (!elementTags || !image || !image.image) return
        let {left,top,zoom} = frameWindow
        left = left * ctx.canvas.width
        top = top * ctx.canvas.height
        ctx.drawImage(image.image, -left/zoom, -top/zoom, (ctx.canvas.width)/zoom, (ctx.canvas.height)/zoom)
        const ftags = elementTags.filter(tag => tag.x >= 0)
        const availTags = ftags.reduce((acc, tag) => ({ ...acc, [tag.k]: tagsDict[tag.k] }), {})
        Object.entries(availTags).forEach(([key, kind],) => {
            if(kind.hidden) return;
            const ktags = ftags.filter(tag => tag.k === key)
            const color = currentTag && key === currentTag._id ? "white" : kind.c
            if (kind.l === 1) {
                drawLine(ctx, ktags, color)
            } else {
                ktags.forEach(tag => drawMarker(ctx, tag.x, tag.y, color))
            }
        })
    }, [image, canvasRef, drawMarker, drawLine, elementTags, tagsDict, currentTag, frameWindow])

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

    useEventListener('mouseleave', (event) => {
        onFrameMouseLeave()
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
        <span style={{display: "flex", position: "relative",justifyContent: "center",alignItems: "center"}}>
            <Loading visible={imageLoading} />
            <canvas className={"canvas " + props.className} ref={canvasRef} width="1000" height="1000" />       
        </span>
    )
}

export default Frame;