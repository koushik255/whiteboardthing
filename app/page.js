"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas"; // Import html2canvas

export default function Home() {
  let backgroundcolor = "border border-gray-300";
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const historyRef = useRef([])
  //ref to gold the history of the canvas strokes to undo


  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // set canvas size
    canvas.width = window.innerWidth * 0.94;
    canvas.height = window.innerHeight * 0.94;

    // set drawing style
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.lineCap = "round";
    backgroundcolor = "border border-gray-300";

   
   
    historyRef.current.push(
      context.getImageData(0,0,canvas.width,canvas.height)
    );

  }, []);

  // function to clear the canvas
  const resetCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const colorYellow = () => {
    const canvas = canvasRef.current;
    //every time ref.current is used it allows us to acually manipulate the DOM element /
    //it retrieves the dom elemenet from th ref
    const context = canvas.getContext("2d");
    context.strokeStyle = "yellow";
  };


  const backToBlack= () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.strokeStyle = "black";

  }


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === "x" || e.key === "X")) {
        colorYellow();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  

  // handle Undo (cntrl z ) problem = no fucking clue how to set
  // last stroke to a variable then to delete that specfici
  //stroke of the screen
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




  return (
    <div className="flex min-h-screen flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Whiteboard</h1>
      <button className="px-3 py-3" onClick= {colorYellow}> 
        Yellow 
      </button>

      <button className="px-3 py-3 text-xl" onClick = {backToBlack}> 
        Normal
      </button>
      <button className="px-3 py-3 bg-blue-500 text-white rounded" onClick={takeScreenshot}>
        Screenshot
      </button>

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
