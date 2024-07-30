import { forwardRef, useCallback, useEffect, useRef } from 'react';

export default function HBrush({
  brushClassName,
  brushPosition,
  brushStyle,
  onChange,
  renderHandle,
  scale,
  trackClassName,
  trackStyle
}) {
  const brushRef = useRef(null);
  const brushCache = useRef(null);
  const brushMoveOffset = useRef(0);
  const brushPivot = useRef(0);
  const lHandleRef = useRef(null);
  const rHandleRef = useRef(null);
  const trackRef = useRef(null);

  const handleChange = useCallback(
    (start, width) => {
      onChange?.({
        x0: scale?.invert(start),
        x1: scale?.invert(start + width)
      });
    },
    [onChange, scale]
  );

  const handleBrushPointerMove = useCallback(
    event => {
      event.preventDefault();

      const brush = brushRef.current;
      const brushRect = brush.getBoundingClientRect();
      const trackRect = trackRef.current.getBoundingClientRect();
      let left = event.clientX - trackRect.left - brushMoveOffset.current;

      if (left < 0) {
        left = 0;
      } else if (left + brushRect.width > trackRect.width) {
        left = trackRect.width - brushRect.width;
      }

      if (left !== Number.parseInt(brush.style.left)) {
        brush.style.left = `${Math.round(left)}px`;

        handleChange(left, brushRect.width);
      }
    },
    [handleChange]
  );

  const handleBrushPointerUp = useCallback(
    event => {
      event.preventDefault();

      document.removeEventListener('pointermove', handleBrushPointerMove);
      document.removeEventListener('pointerup', handleBrushPointerUp);
    },
    [handleBrushPointerMove]
  );

  const handleBrushPointerDown = useCallback(
    event => {
      event.preventDefault();
      event.stopPropagation();

      document.addEventListener('pointermove', handleBrushPointerMove);
      document.addEventListener('pointerup', handleBrushPointerUp);

      brushMoveOffset.current =
        event.clientX - brushRef.current.getBoundingClientRect().left;
    },
    [handleBrushPointerMove, handleBrushPointerUp]
  );

  const handleTrackPointerMove = useCallback(
    event => {
      event.preventDefault();

      brushCache.current = null;

      const brush = brushRef.current;
      const pivot = brushPivot.current;
      const trackRect = trackRef.current.getBoundingClientRect();
      const x = Math.round(event.clientX - trackRect.left);
      let width = x - pivot;

      if (width <= 0 && brush.style.left) {
        brush.style.left = null;
        brush.style.right = `${Math.round(trackRect.width - pivot)}px`;
      } else if (width >= 0 && brush.style.right) {
        brush.style.left = `${pivot}px`;
        brush.style.right = null;
      }

      if (x > trackRect.width) {
        width = trackRect.width - pivot;
      } else if (x < 0) {
        width = pivot;
      }

      width = Math.abs(width);

      if (width !== Number.parseInt(brush.style.width)) {
        brush.style.overflow = null;
        brush.style.width = `${width}px`;

        handleChange(brush.offsetLeft, width);
      }
    },
    [handleChange]
  );

  const handleTrackPointerUp = useCallback(
    event => {
      event.preventDefault();

      // Restore the brush position and width if pointer released without moving
      if (brushCache.current) {
        brushRef.current.style.left = brushCache.current.left;
        brushRef.current.style.right = brushCache.current.right;
        brushRef.current.style.width = brushCache.current.width;
        brushRef.current.style.overflow = null;
      }

      document.removeEventListener('pointermove', handleTrackPointerMove);
      document.removeEventListener('pointerup', handleTrackPointerUp);
    },
    [handleTrackPointerMove]
  );

  const handleTrackPointerDown = useCallback(
    event => {
      event.preventDefault();

      document.addEventListener('pointermove', handleTrackPointerMove);
      document.addEventListener('pointerup', handleTrackPointerUp);

      const trackRect = trackRef.current.getBoundingClientRect();

      // Cache the brush position and width to restore later if pointer not moved
      brushCache.current = {
        left: brushRef.current.style.left,
        right: brushRef.current.style.right,
        width: brushRef.current.style.width
      };
      brushMoveOffset.current = 0;
      brushPivot.current = Math.round(event.clientX - trackRect.left);
      brushRef.current.style.left = `${brushPivot.current}px`;
      brushRef.current.style.width = 0;
      brushRef.current.style.overflow = 'hidden';
    },
    [handleTrackPointerMove, handleTrackPointerUp]
  );

  const handleHandlePointerDown = useCallback(
    event => {
      event.preventDefault();
      event.stopPropagation();

      document.addEventListener('pointermove', handleTrackPointerMove);
      document.addEventListener('pointerup', handleTrackPointerUp);
    },
    [handleTrackPointerMove, handleTrackPointerUp]
  );

  const handleLeftHandlePointerDown = useCallback(
    event => {
      handleHandlePointerDown(event);

      const trackRect = trackRef.current.getBoundingClientRect();
      const brushRect = brushRef.current.getBoundingClientRect();

      brushPivot.current = brushRect.right - trackRect.left;
      brushRef.current.style.left = null;
      brushRef.current.style.right = `${trackRect.right - brushRect.right}px`;
      brushMoveOffset.current = event.clientX - brushRect.left;
    },
    [handleHandlePointerDown]
  );

  const handleRightHandlePointerDown = useCallback(
    event => {
      handleHandlePointerDown(event);

      const trackRect = trackRef.current.getBoundingClientRect();
      const brushRect = brushRef.current.getBoundingClientRect();

      brushPivot.current = brushRect.left - trackRect.left;
      brushRef.current.style.right = null;
      brushRef.current.style.left = `${brushRect.left - trackRect.left}px`;
      brushMoveOffset.current = event.clientX - brushRect.right;
    },
    [handleHandlePointerDown]
  );

  useEffect(() => {
    const brush = brushRef.current;
    const lHandle = lHandleRef.current;
    const rHandle = rHandleRef.current;
    const track = trackRef.current;

    brush.addEventListener('pointerdown', handleBrushPointerDown);
    lHandle.addEventListener('pointerdown', handleLeftHandlePointerDown);
    rHandle.addEventListener('pointerdown', handleRightHandlePointerDown);
    track.addEventListener('pointerdown', handleTrackPointerDown);

    return () => {
      brush.removeEventListener('pointerdown', handleBrushPointerDown);
      lHandle.removeEventListener('pointerdown', handleLeftHandlePointerDown);
      rHandle.removeEventListener('pointerdown', handleRightHandlePointerDown);
      track.removeEventListener('pointerdown', handleTrackPointerDown);
    };
  }, [
    handleBrushPointerDown,
    handleBrushPointerMove,
    handleBrushPointerUp,
    handleLeftHandlePointerDown,
    handleRightHandlePointerDown,
    handleTrackPointerDown
  ]);

  useEffect(() => {
    if (!brushPosition) return;

    const brush = brushRef.current;

    brush.style.left = `${brushPosition.start}px`;
    brush.style.width = `${brushPosition.end - brushPosition.start}px`;
  }, [brushPosition]);

  return (
    <div
      className={`cursor-crosshair ${trackClassName ?? ''} touch-pan-y`}
      ref={trackRef}
      style={trackStyle}
    >
      <div
        className={`cursor-move ${brushClassName ?? ''} absolute`}
        ref={brushRef}
        style={brushStyle}
      >
        {renderHandle && (
          <>
            {renderHandle({ ref: lHandleRef, left: true })}
            {renderHandle({ ref: rHandleRef, left: false })}
          </>
        )}
        {!renderHandle && (
          <>
            <BrushHandle left={true} ref={lHandleRef} />
            <BrushHandle left={false} ref={rHandleRef} />
          </>
        )}
      </div>
    </div>
  );
}

const BrushHandle = forwardRef(function BrushHandle(props, ref) {
  const height = 24;
  const width = 14;
  const { left } = props;

  return (
    <div
      className="absolute flex cursor-ew-resize items-center justify-center rounded-md bg-foreground-2 drop-shadow"
      ref={ref}
      style={{
        height: `${height}px`,
        top: `calc(50% - ${height}px / 2)`,
        width: `${width}px`,
        [left ? 'left' : 'right']: `-${width / 2}px`
      }}
    >
      <div className="h-2 w-1 border-x-1 border-background"></div>
    </div>
  );
});
