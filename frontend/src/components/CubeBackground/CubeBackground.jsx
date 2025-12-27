import { useEffect, useRef } from "react";
import { vs, fs } from "./cubeData";

const BACKGROUND = "#101010";
const FOREGROUND = "#c05621";
const FPS = 90;

export default function CubeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let angle = 0;
    let animationId;

    const clear = () => {
      ctx.fillStyle = BACKGROUND;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const line = (p1, p2) => {
      ctx.lineWidth = 2;
      ctx.strokeStyle = FOREGROUND;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    };

    const screen = (p) => ({
      x: (p.x + 1) / 2 * canvas.width,
      y: (1 - (p.y + 1) / 2) * canvas.height,
    });

    const project = ({ x, y, z }) => ({
      x: x / z,
      y: y / z,
    });

    const rotate_xz = ({ x, y, z }, a) => {
      const c = Math.cos(a);
      const s = Math.sin(a);
      return { x: x * c - z * s, y, z: x * s + z * c + 1 };
    };

    const frame = () => {
      angle += Math.PI / FPS;
      clear();

      for (const f of fs) {
        for (let i = 0; i < f.length; i++) {
          const a = vs[f[i]];
          const b = vs[f[(i + 1) % f.length]];
          line(
            screen(project(rotate_xz(a, angle))),
            screen(project(rotate_xz(b, angle)))
          );
        }
      }

      animationId = requestAnimationFrame(frame);
    };

    frame();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
      }}
    />
  );
}
