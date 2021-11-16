import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import useEventListener from '@use-it/event-listener'
import Loading from './loading'
import './frame.css'


const Frame = (props) => {
    const loader = useMemo(() => new Worker('Workers/loader.js'), [])
    const canvasRef = useRef(null);
    const [images, setImages] = useState(null)
    const [image, setImage] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)
    const [frameWindow, setFrameWindow] = useState({left:0,top:0,zoom:1})
    const [pan, setPan] = useState(null)
    const {
        serie, serieTags, tagsDict, frame, api, currentTag,
        onFrameMouseDown, onFrameMouseUp, onFrameMouseMove
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
            for (var t = 0; t < points.length; t++) {
                ctx.lineTo(...zoomXY(points[t].x, points[t].y, ctx));
            }
            ctx.stroke();
        }
        tags.forEach(point => {
            drawMarker(ctx, point.x, point.y, color || "red", 3)
        })
    }, [drawMarker, zoomXY])
    
    loader.onmessage = (msg) => {
        const {result, i, serieId} = msg.data;
        const img = new Image();
        img.onload = (event) => {
            URL.revokeObjectURL(event.target.src) // 👈 This is important. If you are not using the blob, you should release it if you don't want to reuse it. It's good for memory.
            setImages(images => {
                if(images && images.serieId === serieId){
                    images.images[i] = img;
                    console.log(`loaded image ${serieId}:${i}`)
                }else{
                    
                    console.log(`ignored image ${serieId}:${i}`)
                }
                return images;
            });
            setImage(image => {
                if(!image || image.serieId !== serieId || image.frame !== i)
                    console.log(`not set image ${serieId}:${i}`)
                else
                    console.log(`set image ${serieId}:${i}`)
                return !image ||
                    image.serieId !== serieId || image.frame !== i ? 
                    image : {serieId, image: img}
                }
            )
        }
        img.src = URL.createObjectURL(new Blob([result]))
    }

    useEffect(() => {
        //loader.terminate();
        if (!serie) return;
        
        let serieId = serie._id;
        setImages({serieId:serieId, images: []});
       
        const requests = serie.files.map(
            file => Array.from({length:file.fs}, (_,i) => 
                ({
                    method: 'getFrame',
                    params: [api.URL, api.token, file.path, i], 
                    ret: {i: file.f+i, serieId: serieId}
                })
            )
        ).reduce((a,b) => a.concat(b), [])
        console.log(`loading ${serieId}`)
        loader.postMessage(requests);

    }, [serie, api, loader])
    
    useEffect(() => {
        if(!images) {
            setImage(console.log("clear image")&&null);
            return
        }
        if(!images.images || !images.images[frame]){
            setImage({serieId:images.serieId, image:console.log("image struct")&&null, frame: frame});
            return
        }
        setImage({serieId:images.serieId, image:images.images[frame], frame: 0});
        setFrameWindow({left:0,top:0,zoom:1})
    }, [images, frame])

    useEffect(() => {
        setImageLoading(image && !image.image);
    }, [image])

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        if (!serieTags || !image || !image.image) return
        let {left,top,zoom} = frameWindow
        left = left * ctx.canvas.width
        top = top * ctx.canvas.height
        ctx.drawImage(image.image, -left/zoom, -top/zoom, (ctx.canvas.width)/zoom, (ctx.canvas.height)/zoom)
        const ftags = serieTags.filter(tag => tag.f === frame && tag.x >= 0)
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
    }, [image, canvasRef, frame, drawMarker, drawLine, serieTags, tagsDict, currentTag, frameWindow])

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
        <span style={{display: "flex", position: "relative","justify-content": "center","align-items": "center"}}>
            <Loading visible={imageLoading} />
            <canvas className={"canvas " + props.className} ref={canvasRef} width="1000" height="1000" />       
        </span>
    )
}

export default Frame;