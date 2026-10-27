"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

const minScale = 1;
const maxScale = 4;
const scaleStep = 0.5;
const doubleTapMs = 300;

type Transform = {
  scale: number;
  x: number;
  y: number;
};

type Point = {
  x: number;
  y: number;
};

type Pinch = {
  startDistance: number;
  startScale: number;
  startX: number;
  startY: number;
  startMidX: number;
  startMidY: number;
};

type Tap = {
  time: number;
  x: number;
  y: number;
  moved: boolean;
};

type Props = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export function OrgChartViewer({ src, width, height, alt }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const pinch = useRef<Pinch | null>(null);
  const tap = useRef<Tap | null>(null);
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null);
  const transformRef = useRef<Transform>({ scale: 1, x: 0, y: 0 });
  const [transform, setTransform] = useState<Transform>({
    scale: 1,
    x: 0,
    y: 0,
  });
  const titleId = useId();

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function apply(next: Transform) {
    transformRef.current = next;
    setTransform(next);
  }

  function clampOffset(x: number, y: number, scale: number) {
    const viewport = viewportRef.current;

    if (!viewport) {
      return { x, y };
    }

    const maxX = ((scale - 1) * viewport.clientWidth) / 2;
    const maxY = ((scale - 1) * viewport.clientHeight) / 2;

    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }

  function scaleTo(nextScale: number, anchorX = 0, anchorY = 0) {
    const current = transformRef.current;
    const scale = Math.min(maxScale, Math.max(minScale, nextScale));
    const ratio = scale / current.scale;
    const offset = clampOffset(
      anchorX - (anchorX - current.x) * ratio,
      anchorY - (anchorY - current.y) * ratio,
      scale,
    );

    apply({ scale, ...offset });
  }

  function reset() {
    apply({ scale: 1, x: 0, y: 0 });
    pointers.current.clear();
    pinch.current = null;
    tap.current = null;
    lastTap.current = null;
  }

  function openViewer() {
    reset();
    document.body.style.overflow = "hidden";
    dialogRef.current?.showModal();
  }

  function closeViewer() {
    dialogRef.current?.close();
  }

  function handleClose() {
    document.body.style.overflow = "";
    reset();
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointers.current.size === 1) {
      tap.current = {
        time: Date.now(),
        x: event.clientX,
        y: event.clientY,
        moved: false,
      };
    }

    if (pointers.current.size === 2) {
      const [first, second] = Array.from(pointers.current.values());
      const rect = viewport.getBoundingClientRect();
      const current = transformRef.current;
      const startDistance = Math.hypot(
        first.x - second.x,
        first.y - second.y,
      );

      tap.current = null;

      if (startDistance === 0) {
        return;
      }

      pinch.current = {
        startDistance,
        startScale: current.scale,
        startX: current.x,
        startY: current.y,
        startMidX:
          (first.x + second.x) / 2 - rect.left - rect.width / 2,
        startMidY:
          (first.y + second.y) / 2 - rect.top - rect.height / 2,
      };
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);

    if (!previous) {
      return;
    }

    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (tap.current) {
      const distance = Math.hypot(
        event.clientX - tap.current.x,
        event.clientY - tap.current.y,
      );

      if (distance > 10) {
        tap.current.moved = true;
      }
    }

    const points = Array.from(pointers.current.values());

    if (points.length >= 2) {
      const gesture = pinch.current;

      if (!gesture) {
        return;
      }

      const [first, second] = points;
      const viewport = viewportRef.current;

      if (!viewport) {
        return;
      }

      const rect = viewport.getBoundingClientRect();
      const distance = Math.hypot(
        first.x - second.x,
        first.y - second.y,
      );
      const scale = Math.min(
        maxScale,
        Math.max(
          minScale,
          gesture.startScale * (distance / gesture.startDistance),
        ),
      );
      const ratio = scale / gesture.startScale;
      const midX =
        (first.x + second.x) / 2 - rect.left - rect.width / 2;
      const midY =
        (first.y + second.y) / 2 - rect.top - rect.height / 2;
      const offset = clampOffset(
        midX - (gesture.startMidX - gesture.startX) * ratio,
        midY - (gesture.startMidY - gesture.startY) * ratio,
        scale,
      );

      apply({ scale, ...offset });
      return;
    }

    if (points.length === 1 && transformRef.current.scale > minScale) {
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;

      if (dx !== 0 || dy !== 0) {
        const current = transformRef.current;
        const offset = clampOffset(
          current.x + dx,
          current.y + dy,
          current.scale,
        );

        apply({ scale: current.scale, ...offset });
      }
    }
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);

    if (pointers.current.size < 2) {
      pinch.current = null;
    }

    if (pointers.current.size === 0 && tap.current) {
      const currentTap = tap.current;
      tap.current = null;
      const now = Date.now();
      const isTap = !currentTap.moved && now - currentTap.time < 300;

      if (!isTap) {
        return;
      }

      const previous = lastTap.current;

      if (
        previous &&
        now - previous.time < doubleTapMs &&
        Math.hypot(
          currentTap.x - previous.x,
          currentTap.y - previous.y,
        ) < 30
      ) {
        const viewport = viewportRef.current;

        if (viewport) {
          const rect = viewport.getBoundingClientRect();
          const anchorX =
            currentTap.x - rect.left - rect.width / 2;
          const anchorY =
            currentTap.y - rect.top - rect.height / 2;

          scaleTo(
            transformRef.current.scale > 1.2 ? 1 : 2.5,
            anchorX,
            anchorY,
          );
        }

        lastTap.current = null;
      } else {
        lastTap.current = {
          time: now,
          x: currentTap.x,
          y: currentTap.y,
        };
      }
    }
  }

  function handlePointerCancel(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    pinch.current = null;
    tap.current = null;
  }

  return (
    <>
      <button
        type="button"
        onClick={openViewer}
        aria-haspopup="dialog"
        aria-label="Besarkan carta organisasi"
        className="block w-full cursor-zoom-in border border-garis bg-putih p-2 focus-visible:outline-emas-tua sm:p-4"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          unoptimized
          sizes="(min-width: 1120px) 1088px, 100vw"
          className="h-auto w-full"
        />
      </button>
      <p className="mt-3 text-sm text-tinta/70">
        Ketik carta untuk besarkan.
      </p>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={handleClose}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-hijau-malam p-0 text-putih backdrop:bg-tinta/80"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-putih/20 px-3 py-2">
            <h2
              id={titleId}
              className="truncate font-heading text-xl text-putih"
            >
              Carta organisasi
            </h2>
            <button
              type="button"
              onClick={closeViewer}
              className="min-h-11 border border-putih/40 px-4 text-base font-semibold text-putih focus-visible:outline-emas-cerah"
            >
              Tutup
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 border-b border-putih/20 px-3 py-2">
            <button
              type="button"
              onClick={() =>
                scaleTo(transformRef.current.scale - scaleStep)
              }
              aria-label="Zum keluar"
              className="min-h-11 min-w-11 border border-putih/40 text-xl font-semibold leading-none text-putih focus-visible:outline-emas-cerah"
            >
              −
            </button>
            <span className="min-w-14 text-center text-sm text-putih/80 tnum">
              {Math.round(transform.scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() =>
                scaleTo(transformRef.current.scale + scaleStep)
              }
              aria-label="Zum masuk"
              className="min-h-11 min-w-11 border border-putih/40 text-xl font-semibold leading-none text-putih focus-visible:outline-emas-cerah"
            >
              +
            </button>
            <button
              type="button"
              onClick={reset}
              className="min-h-11 border border-putih/40 px-3 text-base font-semibold text-putih focus-visible:outline-emas-cerah"
            >
              Set semula
            </button>
          </div>

          <div
            ref={viewportRef}
            className="relative flex-1 touch-none select-none overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            <div
              className="flex h-full w-full items-center justify-center will-change-transform"
              style={{
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
                transformOrigin: "center center",
              }}
            >
              <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                unoptimized
                draggable={false}
                className="max-h-full max-w-full select-none object-contain"
              />
            </div>
          </div>

          <p className="border-t border-putih/20 px-3 py-2 text-center text-sm text-putih/80">
            Cubit atau gunakan butang zum. Ketik dua kali untuk besarkan.
          </p>
        </div>
      </dialog>
    </>
  );
}
