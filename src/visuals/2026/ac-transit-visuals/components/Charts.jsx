"use client";

import { useEffect, useRef } from "react";
import { themeElement } from "../lib/host";

function numberLabel(value) {
  return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toFixed(0);
}

function colors() {
  const style = getComputedStyle(themeElement());
  return {
    ink: style.getPropertyValue("--text-primary").trim(),
    mute: style.getPropertyValue("--text-muted").trim(),
    rule: style.getPropertyValue("--rule").trim(),
    surface: style.getPropertyValue("--surface-1").trim(),
    real: style.getPropertyValue("--series-real").trim(),
    gold: style.getPropertyValue("--gold").trim(),
  };
}

function prepareCanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const context = canvas.getContext("2d");
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  return context;
}

function drawBand(context, count, x, y, low, high, fill) {
  context.beginPath();
  for (let index = 0; index < count; index += 1) {
    const px = x(index);
    if (index === 0) context.moveTo(px, y(high(index)));
    else context.lineTo(px, y(high(index)));
  }
  for (let index = count - 1; index >= 0; index -= 1) {
    context.lineTo(x(index), y(low(index)));
  }
  context.closePath();
  context.fillStyle = fill;
  context.fill();
}

function drawMini(canvas, series, meta) {
  const width = 600;
  const height = 200;
  const context = prepareCanvas(canvas, width, height);
  const { mute, rule, surface, real: realColor, gold } = colors();
  context.fillStyle = surface;
  context.fillRect(0, 0, width, height);
  const left = 46;
  const right = 8;
  const top = 8;
  const bottom = 22;
  const plotHeight = height - top - bottom;
  const plotWidth = width - left - right;
  const count = meta.n_weeks;
  let max = 0;
  for (let index = 0; index < count; index += 1) {
    max = Math.max(max, series.real[index] + series.imp[index]);
  }
  max ||= 1;
  const x = (index) => left + (index / (count - 1)) * plotWidth;
  const y = (value) => top + plotHeight - (value / max) * plotHeight;

  context.strokeStyle = rule;
  context.fillStyle = mute;
  context.font = "10px ui-sans-serif,system-ui";
  context.textAlign = "right";
  context.textBaseline = "middle";
  for (let tick = 0; tick <= 2; tick += 1) {
    const value = (max / 2) * tick;
    const py = y(value);
    context.beginPath();
    context.moveTo(left, py);
    context.lineTo(width - right, py);
    context.stroke();
    context.fillText(numberLabel(value), left - 5, py);
  }
  drawBand(context, count, x, y, () => 0, (index) => series.real[index], realColor);
  drawBand(
    context,
    count,
    x,
    y,
    (index) => series.real[index],
    (index) => series.real[index] + series.imp[index],
    gold,
  );

  context.strokeStyle = mute;
  context.setLineDash([3, 3]);
  context.beginPath();
  context.moveTo(x(meta.baseline_week), top);
  context.lineTo(x(meta.baseline_week), top + plotHeight);
  context.stroke();
  context.setLineDash([]);
  context.fillStyle = mute;
  context.textAlign = "center";
  context.textBaseline = "top";
  for (let index = 0; index < count; index += 1) {
    const date = meta.weeks[index];
    if (date.slice(5, 7) === "01" && date.slice(8, 10) <= "07" && Number(date.slice(0, 4)) % 2 === 1) {
      context.fillText(date.slice(0, 4), x(index), top + plotHeight + 5);
    }
  }
}

function drawSelection(canvas, series, meta) {
  const width = 660;
  const height = 392;
  const context = prepareCanvas(canvas, width, height);
  const { ink, mute, rule, surface, real: realColor, gold } = colors();
  context.clearRect(0, 0, width, height);
  context.fillStyle = surface;
  context.fillRect(0, 0, width, height);

  const left = 56;
  const right = 62;
  const top = 22;
  const mainHeight = 168;
  const axisHeight = 20;
  const subHeight = 44;
  const subGap = 26;
  const plotWidth = width - left - right;
  const count = meta.n_weeks;
  let max = 0;
  for (let index = 0; index < count; index += 1) {
    max = Math.max(max, series.real[index] + series.imp[index]);
  }
  max ||= 1;
  const x = (index) => left + (index / (count - 1)) * plotWidth;
  const y = (value) => top + mainHeight - (value / max) * mainHeight;

  context.strokeStyle = rule;
  context.lineWidth = 1;
  context.fillStyle = mute;
  context.font = "11px ui-sans-serif,system-ui";
  context.textAlign = "right";
  context.textBaseline = "middle";
  for (let tick = 0; tick <= 4; tick += 1) {
    const value = (max / 4) * tick;
    const py = y(value);
    context.beginPath();
    context.moveTo(left, py);
    context.lineTo(width - right, py);
    context.stroke();
    context.fillText(numberLabel(value), left - 7, py);
  }
  drawBand(context, count, x, y, () => 0, (index) => series.real[index], realColor);
  drawBand(
    context,
    count,
    x,
    y,
    (index) => series.real[index],
    (index) => series.real[index] + series.imp[index],
    gold,
  );

  context.strokeStyle = mute;
  context.setLineDash([3, 3]);
  context.beginPath();
  context.moveTo(x(meta.baseline_week), top);
  context.lineTo(x(meta.baseline_week), top + mainHeight);
  context.stroke();
  context.setLineDash([]);
  context.textAlign = "left";
  context.fillStyle = mute;
  context.fillText("Feb 2020", x(meta.baseline_week) + 4, top + 8);

  const last = count - 1;
  context.font = "600 11px ui-sans-serif,system-ui";
  context.textBaseline = "middle";
  context.fillStyle = realColor;
  context.fillText("Real", width - right + 6, y(series.real[last] / 2));
  context.fillStyle = gold;
  context.fillText(
    "Imputed",
    width - right + 6,
    Math.max(top + 6, y(series.real[last] + series.imp[last] / 2) - 8),
  );

  context.fillStyle = mute;
  context.font = "11px ui-sans-serif,system-ui";
  context.textAlign = "center";
  context.textBaseline = "top";
  for (let index = 0; index < count; index += 1) {
    const date = meta.weeks[index];
    if (date.slice(5, 7) === "01" && date.slice(8, 10) <= "07") {
      context.fillText(date.slice(0, 4), x(index), top + mainHeight + 5);
    }
  }

  const drawSubplot = (values, color, label, subplotTop) => {
    let subplotMax = 0;
    for (let index = 0; index < count; index += 1) subplotMax = Math.max(subplotMax, values[index]);
    subplotMax ||= 1;
    context.fillStyle = mute;
    context.font = "10px ui-sans-serif,system-ui";
    context.textAlign = "left";
    context.textBaseline = "bottom";
    context.fillText(label, left, subplotTop - 3);
    context.textAlign = "right";
    context.fillText(numberLabel(subplotMax), width - right, subplotTop - 3);
    context.beginPath();
    context.moveTo(left, subplotTop + subHeight);
    for (let index = 0; index < count; index += 1) {
      context.lineTo(x(index), subplotTop + subHeight - (values[index] / subplotMax) * subHeight);
    }
    context.lineTo(width - right, subplotTop + subHeight);
    context.closePath();
    context.fillStyle = color;
    context.globalAlpha = 0.9;
    context.fill();
    context.globalAlpha = 1;
    context.strokeStyle = rule;
    context.beginPath();
    context.moveTo(left, subplotTop + subHeight);
    context.lineTo(width - right, subplotTop + subHeight);
    context.stroke();
  };

  const subplotTop = top + mainHeight + axisHeight + subGap;
  drawSubplot(series.real, realColor, "Real", subplotTop);
  drawSubplot(series.imp, gold, "Imputed", subplotTop + subHeight + subGap);
  context.fillStyle = ink;
  context.font = "600 12px ui-sans-serif,system-ui";
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText("Weekly boardings and drop-offs", left, 2);
}

export function SeriesChart({ series, meta }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current && series) drawMini(canvasRef.current, series, meta);
  }, [series, meta]);
  return <canvas ref={canvasRef} className="chart-canvas" width="600" height="200" />;
}

function hourLabel(hour) {
  if (hour === 0) return "12a";
  if (hour < 12) return `${hour}a`;
  if (hour === 12) return "12p";
  return `${hour - 12}p`;
}

function drawHourly(canvas, now, base, windows) {
  const width = 600;
  const height = 200;
  const context = prepareCanvas(canvas, width, height);
  const { mute, rule, surface, real: realColor } = colors();
  context.fillStyle = surface;
  context.fillRect(0, 0, width, height);
  const left = 34;
  const right = 8;
  const top = 10;
  const bottom = 20;
  const plotHeight = height - top - bottom;
  const plotWidth = width - left - right;
  const mid = top + plotHeight / 2;
  let max = 0;
  for (let hour = 0; hour < 24; hour += 1) {
    max = Math.max(max, now.bd[hour], now.al[hour], base ? base.bd[hour] : 0, base ? base.al[hour] : 0);
  }
  max ||= 1;
  const slot = plotWidth / 24;
  const cx = (hour) => left + (hour + 0.5) * slot;
  const y = (value) => mid - (value / max) * (plotHeight / 2) * 0.92;

  context.fillStyle = "rgba(42, 120, 214, 0.07)";
  for (const [lo, hi] of [windows.am, windows.pm]) {
    context.fillRect(cx(lo) - slot / 2, top, slot * (hi - lo), plotHeight);
  }

  context.strokeStyle = rule;
  context.beginPath();
  context.moveTo(left, mid);
  context.lineTo(width - right, mid);
  context.stroke();

  const half = slot * 0.31;
  const bars = (values, sign, color) => {
    context.fillStyle = color;
    for (let hour = 0; hour < 24; hour += 1) {
      if (!(values[hour] > 0)) continue;
      const h = (values[hour] / max) * (plotHeight / 2) * 0.92;
      context.fillRect(cx(hour) - half, sign > 0 ? mid - h : mid, half * 2, h);
    }
  };
  bars(now.bd, 1, realColor);
  bars(now.al, -1, "rgba(42, 120, 214, 0.45)");

  if (base) {
    context.strokeStyle = mute;
    context.lineWidth = 1;
    for (const [values, sign] of [[base.bd, 1], [base.al, -1]]) {
      context.beginPath();
      for (let hour = 0; hour < 24; hour += 1) {
        const py = mid + sign * (values[hour] / max) * (plotHeight / 2) * 0.92;
        if (hour === 0) context.moveTo(cx(hour), py);
        else context.lineTo(cx(hour), py);
      }
      context.stroke();
    }
  }

  context.strokeStyle = mute;
  context.fillStyle = mute;
  context.font = "10px ui-sans-serif,system-ui";
  context.textAlign = "center";
  context.textBaseline = "top";
  for (const hour of [0, 6, 9, 12, 15, 19, 23]) {
    context.fillText(hourLabel(hour), cx(hour), top + plotHeight + 4);
  }
  context.fillStyle = "rgba(42, 120, 214, 0.85)";
  context.fillText("AM", cx((windows.am[0] + windows.am[1]) / 2), top + 2);
  context.fillText("PM", cx((windows.pm[0] + windows.pm[1]) / 2), top + 2);
  context.textAlign = "right";
  context.fillStyle = mute;
  context.fillText(`${Math.round(max)}`, left - 4, top + 2);
  context.beginPath();
  context.moveTo(left, top + 6);
  context.lineTo(left, top + plotHeight);
  context.moveTo(left, top + 6);
  context.lineTo(width - right, top + 6);
  context.stroke();
}

export function HourlyChart({ now, base, windows }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current && now) drawHourly(canvasRef.current, now, base, windows);
  }, [now, base, windows]);
  return <canvas ref={canvasRef} className="chart-canvas" width="600" height="200" />;
}

export function SelectionChart({ series, meta, canvasRef }) {
  const internalRef = useRef(null);
  const ref = canvasRef || internalRef;
  useEffect(() => {
    if (ref.current && series) drawSelection(ref.current, series, meta);
  }, [ref, series, meta]);
  return <canvas ref={ref} className="chart-canvas selection-canvas" width="660" height="392" />;
}
