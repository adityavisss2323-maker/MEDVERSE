import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { useSOC } from "../../context/SOCContext";

export function SecurityReplayPlayer() {
  const { forensicList = [] } = useSOC();

  /* =========================================
     REAL BACKEND FORENSIC EVENTS
     ========================================= */

  const replayEvents = Array.isArray(forensicList)
    ? forensicList
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  /* =========================================
     RESET WHEN FORENSIC DATA CHANGES
     ========================================= */

  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [replayEvents.length]);

  /* =========================================
     KEEP INDEX VALID
     ========================================= */

  useEffect(() => {
    if (replayEvents.length === 0) {
      setCurrentIndex(0);
      setIsPlaying(false);
      return;
    }

    if (currentIndex >= replayEvents.length) {
      setCurrentIndex(replayEvents.length - 1);
    }
  }, [currentIndex, replayEvents.length]);

  /* =========================================
     STOP WHEN LAST EVENT IS REACHED
     ========================================= */

  useEffect(() => {
    if (
      replayEvents.length > 0 &&
      currentIndex >= replayEvents.length - 1
    ) {
      setIsPlaying(false);
    }
  }, [currentIndex, replayEvents.length]);

  /* =========================================
     REPLAY TIMER
     ========================================= */

  useEffect(() => {
    if (
      !isPlaying ||
      replayEvents.length <= 1 ||
      currentIndex >= replayEvents.length - 1
    ) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= replayEvents.length - 1) {
          return prev;
        }

        return prev + 1;
      });
    }, 2000 / speed);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    speed,
    currentIndex,
    replayEvents.length
  ]);

  /* =========================================
     NO FORENSIC DATA
     ========================================= */

  if (replayEvents.length === 0) {
    return (
      <div className="dashboard-card security-replay-card">

        <div className="card-header">

          <div className="card-title-wrap">

            <Clock
              size={20}
              className="teal-icon"
            />

            <div>

              <h3>
                Security Replay Mode
              </h3>

              <p className="card-subtitle">
                Replay incident progression as it unfolded
              </p>

            </div>

          </div>

        </div>

        <div className="replay-body">

          <p>
            No forensic events available for replay.
          </p>

        </div>

      </div>
    );
  }

  /* =========================================
     CURRENT EVENT
     ========================================= */

  const currentEvent =
    replayEvents[currentIndex] ||
    replayEvents[0];

  return (
    <div className="dashboard-card security-replay-card">

      {/* =========================================
          HEADER
          ========================================= */}

      <div className="card-header">

        <div className="card-title-wrap">

          <Clock
            size={20}
            className="teal-icon"
          />

          <div>

            <h3>
              Security Replay Mode
            </h3>

            <p className="card-subtitle">
              Replay incident progression as it unfolded
            </p>

          </div>

        </div>

      </div>

      <div className="replay-body">

        {/* =========================================
            CURRENT EVENT
            ========================================= */}

        <div className="replay-time-display">

          <span className="current-timestamp">
            {currentEvent.timestamp || "Unknown Time"}
          </span>

          <span className="replay-event-title">

            {currentEvent.title ||
              currentEvent.eventType ||
              "Forensic Event"}

            {currentEvent.assetName
              ? ` (${currentEvent.assetName})`
              : ""}

          </span>

        </div>

        {/* =========================================
            TIMELINE SLIDER
            ========================================= */}

        <div className="replay-slider-wrapper">

          <input
            type="range"
            min={0}
            max={Math.max(
              replayEvents.length - 1,
              0
            )}
            value={currentIndex}
            onChange={(e) => {
              setCurrentIndex(
                Number(e.target.value)
              );

              setIsPlaying(false);
            }}
            className="replay-range-input"
          />

          {/* TIMELINE TICKS */}

          <div className="replay-ticks">

            {replayEvents.map((evt, idx) => (

              <span
                key={
                  evt.id ||
                  `replay-event-${idx}`
                }
                className={`tick ${
                  idx === currentIndex
                    ? "active"
                    : ""
                }`}
                onClick={() => {

                  setCurrentIndex(idx);

                  setIsPlaying(false);

                }}
              >
                {evt.timestamp || "--:--:--"}
              </span>

            ))}

          </div>

        </div>

        {/* =========================================
            CONTROLS
            ========================================= */}

        <div className="replay-controls-row">

          {/* RESTART */}

          <button
            className="secondary-button"
            onClick={() => {

              setCurrentIndex(0);

              setIsPlaying(false);

            }}
          >

            <RotateCcw size={16} />

            <span>
              Restart
            </span>

          </button>

          {/* PLAY / PAUSE */}

          <button
            className="primary-button play-btn"
            onClick={() => {

              if (
                currentIndex >=
                replayEvents.length - 1
              ) {

                setCurrentIndex(0);

                setIsPlaying(true);

              } else {

                setIsPlaying(
                  (prev) => !prev
                );

              }

            }}
          >

            {isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}

            <span>
              {isPlaying
                ? "Pause Replay"
                : "Play Replay"}
            </span>

          </button>

          {/* SPEED */}

          <div className="speed-buttons">

            <span className="speed-label">
              Speed:
            </span>

            {[0.5, 1, 2].map((s) => (

              <button
                key={s}
                className={`speed-chip ${
                  speed === s
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSpeed(s)
                }
              >
                {s}x
              </button>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}