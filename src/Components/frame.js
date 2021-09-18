import React, { useRef, useEffect } from 'react'
import './frame.css'
import {getFrame} from '../model/api'

const file = 'data%2Fcln006%2FSeries%20006%20%5BXA%20-%20CAR%20INT%20DER%5D%2F1.3.6.1.4.1.5962.99.1.2860635706.1294370719.1450264647226.7334.0.dcm'


const Frame = (props) => {
    const canvasRef = useRef(null);
    
    const drawMarker = (ctx, x,y) => {

    }

    const renderBlob = (ctx, blob) => {
        const img = new Image()
        img.onload = (event) => {
            URL.revokeObjectURL(event.target.src) // 👈 This is important. If you are not using the blob, you should release it if you don't want to reuse it. It's good for memory.
            ctx.drawImage(event.target, 0, 0, ctx.canvas.width, ctx.canvas.height)
        }
        img.src = URL.createObjectURL(blob)
    }

    const draw = async(ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        const blob = await getFrame(file, 0)
        renderBlob(ctx,blob)
      }

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        draw(context)
      }, [])

    return (
        <canvas className="canvas" ref={canvasRef} {...props}/>
    )
}

export default Frame;