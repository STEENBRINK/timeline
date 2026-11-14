"use client";

import { type DragEvent, type PointerEvent as ReactPointerEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { placeholderTasks } from "./lib/placeholder-data";

const CURRENT_YEAR = new Date().getUTCFullYear();
const timelineItems = placeholderTasks
  .filter((task) => task.startYear <= CURRENT_YEAR)
  .map((task) => ({
    ...task,
    endYear: Math.min(task.endYear ?? CURRENT_YEAR, CURRENT_YEAR),
  }));
const EARLIEST_YEAR = Math.min(...timelineItems.map((task) => task.startYear));
const LATEST_YEAR = Math.max(...timelineItems.map((task) => task.endYear));
const RANGE_YEARS = Math.max(1, LATEST_YEAR - EARLIEST_YEAR);
const MAX_CANVAS_WIDTH = 16_000_000;
const FIT_SCALE = Math.min(4, 2400 / RANGE_YEARS);

function getYearStep(range: number) {
  const rawStep = range / 7;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalizedStep = rawStep / magnitude;
  const niceStep = normalizedStep <= 1 ? 1 : normalizedStep <= 2 ? 2 : normalizedStep <= 5 ? 5 : 10;
  return niceStep * magnitude;
}

function formatYear(year: number) {
  if (year === 0) return "0";
  const absoluteYear = Math.abs(year);
  const era = year < 0 ? "BCE" : "";
  if (absoluteYear >= 1_000_000_000) return `${Number((absoluteYear / 1_000_000_000).toPrecision(2))}B ${era}`;
  if (absoluteYear >= 1_000_000) return `${Number((absoluteYear / 1_000_000).toPrecision(2))}M ${era}`;
  return `${absoluteYear.toLocaleString("en-US", { useGrouping: true })} ${era}`;
}

const GROUP_ORDER_STORAGE_KEY = "history-timeline-group-order";

const colorClasses = {
  indigo: "bg-bar-indigo-bg text-bar-indigo-fg",
  orange: "bg-bar-orange-bg text-bar-orange-fg",
  emerald: "bg-bar-emerald-bg text-bar-emerald-fg",
  lime: "bg-bar-lime-bg text-bar-lime-fg",
  red: "bg-bar-red-bg text-bar-red-fg",
};

function getYearTicks(startYear: number, endYear: number) {
  const range = Math.max(1, endYear - startYear);
  const yearStep = getYearStep(range);
  const firstRegularTick = Math.ceil(startYear / yearStep) * yearStep;
  const regularYearTicks = Array.from(
    { length: Math.max(0, Math.floor((endYear - firstRegularTick) / yearStep) + 1) },
    (_, index) => firstRegularTick + index * yearStep,
  ).filter((year) => year > startYear && year < endYear);
  return [startYear, ...regularYearTicks, endYear];
}

function clampScale(value: number, range: number, minimumScale = FIT_SCALE / 64) {
  const fitScale = Math.min(4, 2400 / range);
  const maxScale = MAX_CANVAS_WIDTH / range;
  return Number.isFinite(value) ? Math.min(maxScale, Math.max(Math.min(minimumScale, maxScale), value)) : fitScale;
}

function fitFullRangeToWidth(width: number) {
  return clampScale(Math.min(4, Math.max(1, width) / RANGE_YEARS), RANGE_YEARS);
}

function snapPointerToEdge(pointerX: number, viewportWidth: number) {
  const edgeZone = viewportWidth * 0.1;
  if (pointerX <= edgeZone) return 0;
  if (pointerX >= viewportWidth - edgeZone) return viewportWidth;
  return pointerX;
}

function setProgrammaticScrollLeft(
  viewport: HTMLDivElement,
  scrollLeftRef: { current: number | null },
  scrollLeft: number,
) {
  const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  const nextScrollLeft = Math.max(0, Math.min(maxScroll, scrollLeft));
  scrollLeftRef.current = nextScrollLeft;
  viewport.scrollLeft = nextScrollLeft;
}

export default function Home() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLElement>(null);
  const programmaticScrollLeftRef = useRef<number | null>(null);
  const pendingZoomAnchorRef = useRef<{ year: number; pointerX: number } | null>(null);
  const [pixelsPerYear, setPixelsPerYear] = useState(FIT_SCALE);
  const [focusedRange, setFocusedRange] = useState<{ startYear: number; endYear: number } | null>(null);
  const [visibleRange, setVisibleRange] = useState({ startYear: EARLIEST_YEAR, endYear: LATEST_YEAR });
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [groupOrder, setGroupOrder] = useState<string[]>([]);
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null);
  const tasks = timelineItems;
  const groupedTasks = Array.from(
    tasks.reduce((groups, task) => {
      const items = groups.get(task.group) ?? [];
      items.push(task);
      groups.set(task.group, items);
      return groups;
    }, new Map<string, (typeof tasks)[number][]>()).entries(),
    ([name, items]) => {
      const lanes: (typeof tasks)[number][][] = [];
      const orderedItems = [...items].sort((first, second) => first.startYear - second.startYear);

      for (const task of orderedItems) {
        const lane = lanes.find((itemsInLane) => itemsInLane[itemsInLane.length - 1].endYear <= task.startYear);
        if (lane) lane.push(task);
        else lanes.push([task]);
      }

      return { name, items, lanes };
    },
  );
  const orderedGroups = [...groupedTasks].sort((first, second) => {
    const firstIndex = groupOrder.indexOf(first.name);
    const secondIndex = groupOrder.indexOf(second.name);
    if (firstIndex === -1) return secondIndex === -1 ? 0 : 1;
    if (secondIndex === -1) return -1;
    return firstIndex - secondIndex;
  });
  const viewStartYear = focusedRange?.startYear ?? EARLIEST_YEAR;
  const viewEndYear = Math.min(focusedRange?.endYear ?? LATEST_YEAR, CURRENT_YEAR);
  const viewRange = Math.max(1, viewEndYear - viewStartYear);
  const minimumScale = focusedRange ? FIT_SCALE / 64 : fitFullRangeToWidth(viewportRef.current?.clientWidth || 2400);
  const yearTicks = getYearTicks(viewStartYear, viewEndYear);
  const visibleGroups = orderedGroups.map((group) => ({
    ...group,
    lanes: group.lanes
      .map((lane) => lane.filter((task) => task.startYear <= viewEndYear && task.endYear >= viewStartYear)),
  }));
  const scale = clampScale(pixelsPerYear, viewRange, minimumScale);
  const hoverOffset = hoverYear === null ? null : (hoverYear - viewStartYear) * scale;
  const yearLabels = yearTicks.reduce<{ year: number; label: string; alignRight: boolean }[]>((labels, year, index) => {
    const previousYear = yearTicks[index - 1];
    if (previousYear !== undefined && (year - previousYear) * scale < 72) return labels;

    const nextYear = yearTicks[index + 1];
    const combineWithNext = nextYear !== undefined && (nextYear - year) * scale < 72;
    labels.push({
      year,
      label: combineWithNext ? `${formatYear(year)} / ${formatYear(nextYear)}` : formatYear(year),
      alignRight: combineWithNext || index === yearTicks.length - 1,
    });
    return labels;
  }, []);
  const calendarTicks = yearTicks.filter((year, index) => index === 0 || (year - yearTicks[index - 1]) * scale >= 1);
  const canvasWidth = viewRange * scale;

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const pendingAnchor = pendingZoomAnchorRef.current;
    if (pendingAnchor) {
      pendingZoomAnchorRef.current = null;
      setProgrammaticScrollLeft(
        viewport,
        programmaticScrollLeftRef,
        (pendingAnchor.year - viewStartYear) * scale - pendingAnchor.pointerX,
      );
      return;
    }

  }, [scale, viewEndYear, viewStartYear]);

  useEffect(() => {
    try {
      const savedOrder = window.localStorage.getItem(GROUP_ORDER_STORAGE_KEY);
      if (!savedOrder) return;
      const parsedOrder: unknown = JSON.parse(savedOrder);
      if (Array.isArray(parsedOrder)) {
        setGroupOrder(parsedOrder.filter((name): name is string => typeof name === "string"));
      }
    } catch {
      setGroupOrder([]);
    }
  }, []);

  const saveGroupOrder = (nextOrder: string[]) => {
    setGroupOrder(nextOrder);
    try {
      window.localStorage.setItem(GROUP_ORDER_STORAGE_KEY, JSON.stringify(nextOrder));
    } catch {
      return;
    }
  };

  const moveGroup = (groupName: string, direction: -1 | 1) => {
    const nextOrder = orderedGroups.map((group) => group.name);
    const currentIndex = nextOrder.indexOf(groupName);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= nextOrder.length) return;
    const [group] = nextOrder.splice(currentIndex, 1);
    nextOrder.splice(targetIndex, 0, group);
    saveGroupOrder(nextOrder);
  };

  const dropGroup = (event: DragEvent<HTMLElement>, targetName: string) => {
    event.preventDefault();
    const sourceName = event.dataTransfer.getData("text/plain") || draggedGroup;
    if (!sourceName) return;

    const nextOrder = orderedGroups.map((group) => group.name);
    const sourceIndex = nextOrder.indexOf(sourceName);
    const targetIndex = nextOrder.indexOf(targetName);
    if (sourceIndex < 0 || targetIndex < 0 || sourceName === targetName) return;

    const targetBounds = event.currentTarget.getBoundingClientRect();
    const insertAfter = event.clientY > targetBounds.top + targetBounds.height / 2;
    const [group] = nextOrder.splice(sourceIndex, 1);
    const insertionIndex = targetIndex + (insertAfter ? 1 : 0) - (sourceIndex < targetIndex ? 1 : 0);
    nextOrder.splice(insertionIndex, 0, group);
    saveGroupOrder(nextOrder);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => {
      const savedTheme = window.localStorage.getItem("timeline-theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        document.documentElement.dataset.theme = savedTheme;
        setIsDarkMode(savedTheme === "dark");
        return;
      }

      document.documentElement.removeAttribute("data-theme");
      setIsDarkMode(mediaQuery.matches);
    };

    syncTheme();
    mediaQuery.addEventListener("change", syncTheme);
    return () => mediaQuery.removeEventListener("change", syncTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(nextTheme === "dark");
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("timeline-theme", nextTheme);
  };

  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(document.fullscreenElement === chartRef.current);
    };

    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    const chart = chartRef.current;
    if (!chart) return;

    if (document.fullscreenElement === chart) {
      await document.exitFullscreen();
    } else {
      await chart.requestFullscreen();
    }
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const currentScale = clampScale(pixelsPerYear, viewRange, minimumScale);
      const deltaY = Number.isFinite(event.deltaY) ? event.deltaY : 0;
      const deltaX = Number.isFinite(event.deltaX) ? event.deltaX : 0;
      const bounds = viewport.getBoundingClientRect();
      const pointerX = Math.max(0, Math.min(viewport.clientWidth, event.clientX - bounds.left));
      const edgePointerX = snapPointerToEdge(pointerX, viewport.clientWidth);

      if (event.ctrlKey || event.metaKey) {
        const contentX = pointerX + viewport.scrollLeft;
        const zoomFactor = Math.exp(-deltaY * 0.002);
        const requestedScale = zoomFactor === Infinity ? Number.MAX_VALUE : currentScale * zoomFactor;
        const nextScale = clampScale(requestedScale, viewRange, minimumScale);
        const anchorYear = viewStartYear + contentX / currentScale;

        if (focusedRange) {
          if (nextScale > currentScale) {
            pendingZoomAnchorRef.current = { year: anchorYear, pointerX };
            setPixelsPerYear(nextScale);
            return;
          }

          const nextRange = viewRange * (currentScale / nextScale);
          if (nextRange >= RANGE_YEARS) {
            pendingZoomAnchorRef.current = { year: anchorYear, pointerX };
            setFocusedRange(null);
            setPixelsPerYear(fitFullRangeToWidth(viewport.clientWidth));
            return;
          }

          let nextStart = anchorYear - contentX / nextScale;
          let nextEnd = nextStart + nextRange;
          if (nextStart < EARLIEST_YEAR) {
            nextEnd += EARLIEST_YEAR - nextStart;
            nextStart = EARLIEST_YEAR;
          }
          if (nextEnd > LATEST_YEAR) {
            nextStart -= nextEnd - LATEST_YEAR;
            nextEnd = LATEST_YEAR;
          }
          nextStart = Math.max(EARLIEST_YEAR, nextStart);
          nextEnd = Math.min(LATEST_YEAR, nextEnd);

          pendingZoomAnchorRef.current = { year: anchorYear, pointerX };
          setFocusedRange({ startYear: nextStart, endYear: nextEnd });
          setPixelsPerYear(nextScale);
          return;
        }

        if (requestedScale > MAX_CANVAS_WIDTH / viewRange) {
          const targetRange = Math.min(RANGE_YEARS, Math.max(1, viewport.clientWidth / requestedScale));
          const pointerRatio = pointerX / Math.max(1, viewport.clientWidth);
          let nextStart = anchorYear - targetRange * pointerRatio;
          let nextEnd = nextStart + targetRange;
          if (nextStart < EARLIEST_YEAR) {
            nextEnd += EARLIEST_YEAR - nextStart;
            nextStart = EARLIEST_YEAR;
          }
          if (nextEnd > LATEST_YEAR) {
            nextStart -= nextEnd - LATEST_YEAR;
            nextEnd = LATEST_YEAR;
          }

          pendingZoomAnchorRef.current = { year: anchorYear, pointerX };
          setFocusedRange({ startYear: nextStart, endYear: nextEnd });
          setPixelsPerYear(clampScale(requestedScale, nextEnd - nextStart));
          return;
        }

        pendingZoomAnchorRef.current = { year: anchorYear, pointerX };
        setPixelsPerYear(nextScale);
        return;
      }

      const scrollDelta = deltaY || deltaX;
      if (focusedRange && scrollDelta < 0 && edgePointerX === 0 && focusedRange.startYear > EARLIEST_YEAR) {
        const extension = Math.min(focusedRange.startYear - EARLIEST_YEAR, Math.abs(scrollDelta) / currentScale);
        const nextStart = focusedRange.startYear - extension;
        pendingZoomAnchorRef.current = { year: nextStart, pointerX: 0 };
        setFocusedRange({ startYear: nextStart, endYear: focusedRange.endYear });
        return;
      }

      if (focusedRange && scrollDelta > 0 && edgePointerX === viewport.clientWidth && focusedRange.endYear < LATEST_YEAR) {
        const extension = Math.min(LATEST_YEAR - focusedRange.endYear, scrollDelta / currentScale);
        const nextEnd = focusedRange.endYear + extension;
        pendingZoomAnchorRef.current = { year: nextEnd, pointerX: viewport.clientWidth };
        setFocusedRange({ startYear: focusedRange.startYear, endYear: nextEnd });
        return;
      }

      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      viewport.scrollLeft = Math.max(0, Math.min(maxScroll, viewport.scrollLeft + scrollDelta));
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [pixelsPerYear, viewRange, minimumScale]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setFocusedRange(null);
    setPixelsPerYear(fitFullRangeToWidth(viewport.clientWidth));
    setProgrammaticScrollLeft(viewport, programmaticScrollLeftRef, 0);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let frame = 0;
    const updateVisibleRange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const currentScale = clampScale(pixelsPerYear, viewRange, minimumScale);
        const leftYear = viewStartYear + viewport.scrollLeft / currentScale;
        const rightYear = viewStartYear + Math.min(viewRange, (viewport.scrollLeft + viewport.clientWidth) / currentScale);
        setVisibleRange({
          startYear: Math.floor(Math.max(viewStartYear, Math.min(viewEndYear, leftYear))),
          endYear: Math.ceil(Math.max(viewStartYear, Math.min(viewEndYear, rightYear))),
        });
      });
    };

    updateVisibleRange();
    viewport.addEventListener("scroll", updateVisibleRange, { passive: true });
    const resizeObserver = new ResizeObserver(updateVisibleRange);
    resizeObserver.observe(viewport);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("scroll", updateVisibleRange);
      resizeObserver.disconnect();
    };
  }, [pixelsPerYear, minimumScale, viewEndYear, viewRange, viewStartYear]);

  const zoomBy = (factor: number) => {
    const viewport = viewportRef.current;
    const center = viewport ? viewport.scrollLeft + viewport.clientWidth / 2 : 0;
    const currentScale = clampScale(pixelsPerYear, viewRange, minimumScale);
    const nextScale = clampScale(currentScale * (Number.isFinite(factor) ? factor : 1), viewRange, minimumScale);
    setPixelsPerYear(nextScale);
    requestAnimationFrame(() => {
      if (viewport) setProgrammaticScrollLeft(viewport, programmaticScrollLeftRef, center * (nextScale / currentScale) - viewport.clientWidth / 2);
    });
  };

  const resetView = () => {
    const viewport = viewportRef.current;
    setFocusedRange(null);
    if (!viewport) {
      setPixelsPerYear(FIT_SCALE);
      return;
    }

    setPixelsPerYear(fitFullRangeToWidth(viewport.clientWidth));
    requestAnimationFrame(() => setProgrammaticScrollLeft(viewport, programmaticScrollLeftRef, 0));
  };

  const focusItem = (startYear: number, endYear: number) => {
    const viewport = viewportRef.current;
    const range = Math.max(1, endYear - startYear);
    const targetWidth = Math.max(1, (viewport?.clientWidth ?? 1200) - 48);
    setFocusedRange({ startYear, endYear });
    setPixelsPerYear(clampScale(targetWidth / range, range));
    if (viewport) requestAnimationFrame(() => { setProgrammaticScrollLeft(viewport, programmaticScrollLeftRef, 0); });
  };

  const updateHoverYear = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = event.currentTarget;
    const bounds = viewport.getBoundingClientRect();
    const pointerX = Math.max(0, Math.min(viewport.clientWidth, event.clientX - bounds.left));
    const year = viewStartYear + (viewport.scrollLeft + pointerX) / scale;
    setHoverYear(Math.max(viewStartYear, Math.min(viewEndYear, Math.round(year))));
  };

  return (
    <main className="h-dvh min-h-0 w-full bg-background font-sans text-[13px] text-foreground">

      <section className="flex h-full min-h-0 w-full flex-col overflow-hidden border-0 bg-surface shadow-none [&:fullscreen]:h-dvh [&:fullscreen]:w-screen [&::backdrop]:bg-surface" ref={chartRef} aria-label="History timeline">
        <div className="flex h-[55px] shrink-0 items-center justify-between border-b border-line px-[18px] max-[460px]:px-2">
          <div className="flex min-w-0 items-center gap-[9px] text-[9px] font-bold tracking-[1px] text-ink max-[460px]:text-[8px]">
            <span className="whitespace-nowrap max-[520px]:hidden">HISTORY <span className="text-faint">/</span></span>
            <span className="whitespace-nowrap tracking-normal" aria-live="polite">{formatYear(visibleRange.startYear)} <span className="px-1 text-faint">→</span> {formatYear(visibleRange.endYear)}</span>
          </div>
          <div className="flex items-center gap-[14px] max-[460px]:gap-2">
            <button className="grid h-[29px] place-items-center border border-border bg-surface px-[11px] text-[10px] text-ink hover:border-muted-soft hover:bg-button-hover focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#8eaa91] max-[460px]:px-2 max-[460px]:text-[9px]" type="button" onClick={resetView}>Reset</button>
            <button className="flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-[10px] text-muted focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#8eaa91]" role="switch" aria-checked={isDarkMode} aria-label="Dark mode" onClick={toggleTheme}>
              <span className="max-[460px]:hidden">Dark mode</span>
              <span className={`flex h-4 w-7 items-center rounded-full border border-border p-[2px] transition-colors duration-150 ${isDarkMode ? "bg-forest" : "bg-line"}`}>
                <span className={`h-[10px] w-[10px] rounded-full bg-surface shadow-[0_1px_2px_rgb(0_0_0_/_20%)] transition-transform duration-150 ${isDarkMode ? "translate-x-3" : "translate-x-0"}`} />
              </span>
            </button>
            <button className="border border-border bg-surface px-[11px] py-[7px] text-[10px] text-ink hover:border-muted-soft hover:bg-button-hover focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#8eaa91] max-[460px]:px-2 max-[460px]:text-[9px]" type="button" onClick={toggleFullscreen} aria-pressed={isFullscreen}>
              {isFullscreen ? "Exit fullscreen" : "Go fullscreen"}
            </button>
          </div>
        </div>
        <div className="h-full min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto [direction:rtl]">
          <div className="grid min-h-full min-w-full grid-cols-[252px_minmax(0,1fr)] [direction:ltr] max-[760px]:grid-cols-[190px_minmax(0,1fr)] max-[460px]:grid-cols-[158px_minmax(0,1fr)]">
            <div className="relative z-[2] flex flex-col bg-surface">
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-[18px] text-[8px] font-bold tracking-[.9px] text-muted-soft max-[760px]:px-3 max-[460px]:text-[7px]"><span>GROUP</span></div>
              {visibleGroups.map((group) => (
                <div
                  className={`border-b border-line-soft bg-surface${draggedGroup === group.name ? " opacity-45" : ""}`}
                  key={group.name}
                  style={{ height: group.lanes.length * 58 }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => dropGroup(event, group.name)}
                >
                  <button
                    className="flex h-full w-full cursor-grab items-center gap-[10px] border-0 bg-transparent px-[18px] text-left text-text-strong active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#8eaa91] max-[760px]:px-3 max-[460px]:gap-[7px] max-[460px]:px-2"
                    type="button"
                    draggable
                    aria-label={`Reorder ${group.name}; use the up and down arrow keys to move it`}
                    aria-keyshortcuts="ArrowUp ArrowDown"
                    title="Drag to reorder, or use the up and down arrow keys"
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", group.name);
                      setDraggedGroup(group.name);
                    }}
                    onDragEnd={() => setDraggedGroup(null)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        moveGroup(group.name, -1);
                      } else if (event.key === "ArrowDown") {
                        event.preventDefault();
                        moveGroup(group.name, 1);
                      }
                    }}
                  >
                    <span className="h-[18px] w-2 shrink-0 [background-image:radial-gradient(circle,var(--muted-soft)_1px,transparent_1.5px)] [background-position:0_1px] [background-size:4px_5px]" aria-hidden="true" />
                    <span className="flex-1 text-[11px] font-semibold">{group.name}</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-none [direction:ltr] [scrollbar-color:var(--muted-soft)_var(--surface-soft)] [scrollbar-width:thin]" ref={viewportRef} aria-label="Scrollable timeline canvas" onPointerMove={updateHoverYear} onPointerLeave={() => setHoverYear(null)}>
              <div className="relative flex min-w-full flex-col" style={{ width: canvasWidth }}>
                <div className="relative h-12 w-full shrink-0 border-b border-line bg-surface-soft">
                  {yearLabels.map((tick) => <span className={`absolute top-0 flex h-full items-center whitespace-nowrap text-[9px] font-semibold text-muted-soft ${tick.alignRight ? "-translate-x-full pr-[10px]" : "pl-[10px]"}`} key={tick.year} style={{ left: (tick.year - viewStartYear) * scale }}>{tick.label}</span>)}
                </div>
                <div className="relative flex shrink-0 flex-col overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 flex" aria-hidden="true">
                    {calendarTicks.map((year, index) => <div className="h-full shrink-0 border-l border-grid first:border-l-0" key={year} style={{ width: ((calendarTicks[index + 1] ?? LATEST_YEAR) - year) * scale }} />)}
                  </div>
                  {hoverOffset !== null && hoverYear !== null && <div className="pointer-events-none absolute inset-y-0 z-[4] w-px bg-[#c66d4e]" style={{ left: hoverOffset }}><span className={`absolute top-[7px] flex whitespace-nowrap bg-today-bg px-[6px] py-1 text-[8px] font-bold tracking-[.45px] text-today-fg ${hoverOffset < 80 ? "left-[6px]" : "right-[6px]"}`}>{formatYear(hoverYear)}</span></div>}
                  {visibleGroups.map((group) => (
                    <div
                      className={`flex flex-col${draggedGroup === group.name ? " opacity-45" : ""}`}
                      key={group.name}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => dropGroup(event, group.name)}
                    >
                      {group.lanes.map((lane, laneIndex) => (
                        <div
                          className="relative z-[1] h-[58px] shrink-0 border-b border-line-soft"
                          key={`${group.name}-${laneIndex}`}
                        >
                          {lane.map((item) => {
                            const visibleStart = Math.max(item.startYear, viewStartYear);
                            const visibleEnd = Math.min(item.endYear, viewEndYear, CURRENT_YEAR);
                            const intervalWidth = Math.max(0, (visibleEnd - visibleStart) * scale);
                            const left = Math.min(
                              canvasWidth,
                              Math.max(0, (visibleStart - viewStartYear) * scale)
                            );
                            const width = Math.min(
                              intervalWidth,
                              Math.max(0, canvasWidth - left)
                            );

                            if (width < 1) return null;

                            const dateRangeLabel =
                              `${formatYear(item.startYear)} - ${formatYear(item.endYear)}`;

                            const measureText = (text: string, font: string) => {
                              const canvas = document.createElement("canvas");
                              const context = canvas.getContext("2d");

                              if (!context) return text.length * 5;

                              context.font = font;
                              return context.measureText(text).width;
                            };

                            const isMobile = window.matchMedia("(max-width: 760px)").matches;

                            const font = isMobile
                              ? '600 8px "Geist", "Geist Fallback"'
                              : '600 9px "Geist", "Geist Fallback"';

                            const horizontalPadding = isMobile ? 14 : 18;

                            const nameWidth = measureText(item.name, font);
                            const fullLabelWidth = measureText(
                              `${item.name} ${dateRangeLabel}`,
                              font
                            );

                            const showName = width >= nameWidth + horizontalPadding;
                            const showDateRange = width >= fullLabelWidth + horizontalPadding;

                            return (
                              <button
                                className="absolute top-1/2 flex h-6 -translate-y-1/2 cursor-zoom-in items-center gap-[7px] overflow-hidden rounded-[3px] border-0 p-0 px-[9px] text-left text-[9px] font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#8eaa91] max-[760px]:px-[7px] max-[760px]:text-[8px]"
                                key={`${item.name}-${item.startYear}`}
                                style={{
                                  left,
                                  width,
                                  backgroundColor: `var(--bar-${item.color}-bg)`,
                                  color: `var(--bar-${item.color}-fg)`,
                                }}
                                title={`${item.name}: ${item.startYear} to ${item.endYear}`}
                                aria-label={`Focus timeline on ${item.name}, ${formatYear(item.startYear)} to ${formatYear(item.endYear)}`}
                                onClick={() => focusItem(item.startYear, item.endYear)}
                              >{showName ? item.name : null}
                                {showDateRange ? ` ${dateRangeLabel}` : null}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="flex h-[34px] shrink-0 items-center justify-between border-t border-line px-[17px] text-[8px] font-semibold tracking-[.8px] text-muted-soft"><span>FROM · {formatYear(viewStartYear)}</span><span>TO · {formatYear(viewEndYear)}</span></footer>
      </section>
    </main>
  );
}
