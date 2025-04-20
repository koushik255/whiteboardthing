"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas"; // Import html2canvas

export default function Home() {
  let backgroundcolor = "border border-gray-300";
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#000000"); // Add state for stroke color
  const historyRef = useRef([])
  const [text,SetText] = useState("")
  //ref to gold the history of the canvas strokes to undo

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // set canvas size
    canvas.width = window.innerWidth * 0.94;
    canvas.height = window.innerHeight * 0.94;

    // set drawing style
    context.strokeStyle = strokeColor;
    context.lineWidth = 2;
    context.lineCap = "round";
    backgroundcolor = "border border-gray-300";

    historyRef.current.push(
      context.getImageData(0,0,canvas.width,canvas.height)
    );

  }, [strokeColor]); // Add strokeColor as dependency

  // function to clear the canvas
  const resetCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  };


  
  const handleColorChange = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const newColor = e.target.value;
    setStrokeColor(newColor);
    context.strokeStyle = newColor;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === "z" || e.key === "Z")) {
        undoLastStroke();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    // Get mouse position relative to canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };



  function drawText() {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.font = "48px serif";
    context.fillStyle = strokeColor; // Use the current color
    const x = canvas.width/2
    const y = canvas.height/2

    context.fillText(text, x-230, y-230);
    context.beginPath();
    context.moveTo(x, 0);
    context.stroke();

    
    historyRef.current.push(
      context.getImageData(0,0,canvas.width,canvas.height)
    )
    
  }
  
  

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    // get mouse position relative to canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    

    //save the current history to the array
    historyRef.current.push(
      context.getImageData(0,0,canvas.width,canvas.height)
    )
  };

    const undoLastStroke= () => {
      const history = historyRef.current;
      if (history.length > 1){
        history.pop()
        const previousState = history[history.length -1]
        // basicaly since you just deleaded the most recent satet
        //you need to get the previous staet and make that the current
        //state
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d")

        context.putImageData(previousState,0,0)
      } else {
        //if there is no histroy to cntl z to just clear
        resetCanvas()
      }
    }


  const takeScreenshot = async () => {
    const canvasElement = canvasRef.current;
    //renders canvas elemenet to new canvas
    const screenshotCanvas = await html2canvas(canvasElement, { })

    const image = screenshotCanvas.toDataURL("image/png");
    window.open(image,"_blank");
  }


  //things to add, i can make the whiteboard the whole page
  // i can make it so that the color changer is a html color thing 
  // 




  return (
    <div className="flex min-h-screen flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Whiteboard</h1>
      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="color-picker" className="text-lg">Stroke Color:</label>
        <input
          type="color"
          id="color-picker"
          value={strokeColor}
          onChange={handleColorChange}
          className="w-12 h-12 rounded cursor-pointer"
        />
      </div>
      <button className="px-3 py-3 bg-blue-500 text-white rounded" onClick={takeScreenshot}>
        Screenshot
      </button>
      <button className="px-3 py-3 bg-blue-500 text-white rounded" onClick={resetCanvas}>
        Clear
      </button>

      <button className="px-3 py-3 bg-blue-500 text-white rounded" onClick={drawText}>
        Draw text
      </button>

      <h1> Ctrl + Z for undo!</h1>

      <input
       type="text" 
       value = {text}
       onChange={e => SetText(e.target.value)}
       placeholder = " write your thing here"
      />



      <canvas
        ref={canvasRef}
        className={backgroundcolor}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
      
    </div>
  );
}
