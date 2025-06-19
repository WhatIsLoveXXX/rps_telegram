import { MAX_BET, MIN_BET } from "@/pages/MainPage/consts";
import React from "react";
import { Range, getTrackBackground } from "react-range";

interface StakeRangeProps {
  values: number[];
  onChange: (values: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const StakeRange: React.FC<StakeRangeProps> = ({
  values,
  onChange,
  min = MIN_BET,
  max = MAX_BET,
  step = 1,
}) => {
  return (
    <div className="flex gap-3 items-center">
      <label className="mb-2 block text-lg font-medium text-white">Bet</label>
      <Range
        values={values}
        step={step}
        min={min}
        max={max}
        onChange={onChange}
        renderTrack={({ props, children }) => (
          <div
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={{ height: "24px", display: "flex", width: "100%" }}
          >
            <div
              ref={props.ref}
              style={{
                height: "6px",
                width: "100%",
                borderRadius: "8px",
                background: getTrackBackground({
                  values,
                  colors: ["#373839", "#1B73DD", "#373839"],
                  min,
                  max,
                }),
                alignSelf: "center",
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props, index }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: "16px",
              width: "16px",
              borderRadius: "50%",
              border: "2px solid #161616",
              backgroundColor: "#3b82f6",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-18px",
                color: "white",
                fontSize: "10px",
              }}
            >
              {values[index]}
            </div>
          </div>
        )}
      />
    </div>
  );
};
