import type { PublicVehicle } from "../api/types";
import { getDirectionData, tempuRoutes, type Direction } from "../routes";
import { VEHICLE_TYPES, type VehicleType } from "../../shared/vehicles";

/**
 * Demo fleet for the hackathon demo accounts.
 *
 * No real drivers are registered yet, so the demo shows simulated vehicles
 * moving between stops. They are computed in the browser from the clock
 * (every device shows the same positions), are never sent to the server,
 * and are always labelled as demo in the UI.
 *
 * Stop positions below are APPROXIMATE, placed by hand for the demo only.
 * They are not part of the verified route dataset and must not be used as
 * real stop locations. Vehicles move in straight lines between stops.
 */
const APPROXIMATE_STOP_POSITIONS: Record<string, [number, number]> = {
  "অক্সিজেন": [22.3949, 91.8222],
  "আতুরার ডিপো": [22.3818, 91.8262],
  "মুরাদপুর": [22.3668, 91.8318],
  "চকবাজার": [22.3577, 91.8378],
  "গণি বেকারী": [22.3512, 91.8335],
  "কাজীর দেউড়ী": [22.3449, 91.8241],
  "টাইগারপাস": [22.3392, 91.8152],
  "দেওয়ানহাট": [22.3322, 91.8076],
  "চৌমুহনী": [22.3268, 91.8041],
  "বারেক বিল্ডিং মোড়": [22.3182, 91.8037],
  "বায়েজিদ বোস্তামী": [22.3858, 91.8160],
  "ষোলশহর ২নং গেট": [22.3693, 91.8197],
  "জিইসি": [22.3592, 91.8216],
  "ওয়াসা": [22.3512, 91.8172],
  "কালুরঘাট": [22.3985, 91.8792],
  "কাপ্তাই রাস্তার মাথা": [22.3832, 91.8677],
  "কাপাসগোলা": [22.3640, 91.8432],
  "তেলিপট্টি": [22.3566, 91.8444],
  "চন্দনপুরা": [22.3488, 91.8412],
  "সাবএরিয়া": [22.3447, 91.8389],
  "আন্দরকিল্লা": [22.3412, 91.8362],
  "বক্সিরহাট বিট": [22.3396, 91.8382],
  "লালদীঘি": [22.3370, 91.8340],
  "কোতোয়ালী মোড়": [22.3336, 91.8361],
  "পাঁচলাইশ থানা": [22.3641, 91.8291],
  "কাতালগঞ্জ": [22.3602, 91.8268],
  "গুলজার সিনেমা": [22.3558, 91.8301],
  "জামালখান": [22.3461, 91.8338],
  "নজির আহমদ চৌধুরী রোড": [22.3390, 91.8350],
  "নিউমার্কেট": [22.3361, 91.8309],
  "ফিরিঙ্গিবাজার মেরিন ড্রাইভ রোড": [22.3291, 91.8423],
  "চামড়া গুদাম": [22.3329, 91.8531],
  "হযরত শাহ আমানত ব্রিজের পশ্চিম পাড়": [22.3371, 91.8582],
};

/** Seconds a demo vehicle takes between two stops, and its wait at each end. */
export const DEMO_SECONDS_PER_STOP = 24;
const DEMO_TERMINAL_WAIT_SECONDS = 20;

type DemoSpec = {
  routeNumber: string;
  direction: Direction;
  vehicleType: VehicleType;
  /** Phase offset in seconds for the first vehicle on this direction. */
  offset: number;
};

const DEMO_SPECS: DemoSpec[] = [
  { routeNumber: "01", direction: "outbound", vehicleType: "tempu", offset: 0 },
  { routeNumber: "01", direction: "return", vehicleType: "human-hauler", offset: 90 },
  { routeNumber: "02", direction: "outbound", vehicleType: "diesel-tempu", offset: 30 },
  { routeNumber: "02", direction: "return", vehicleType: "tempu", offset: 10 },
  { routeNumber: "04", direction: "outbound", vehicleType: "human-hauler", offset: 60 },
  { routeNumber: "04", direction: "return", vehicleType: "diesel-tempu", offset: 140 },
  { routeNumber: "15", direction: "outbound", vehicleType: "diesel-tempu", offset: 45 },
  { routeNumber: "15", direction: "return", vehicleType: "tempu", offset: 120 },
  { routeNumber: "17", direction: "outbound", vehicleType: "tempu", offset: 20 },
  { routeNumber: "17", direction: "return", vehicleType: "human-hauler", offset: 75 },
];

export type DemoVehicle = PublicVehicle & {
  demo: true;
  /** Index of the stop most recently passed in `segmentStops`. */
  stopIndex: number;
  nextStop: string | null;
};

type DemoPath = {
  id: string;
  spec: DemoSpec;
  /** Phase offset in seconds for this vehicle. */
  offset: number;
  routeName: string;
  stops: string[];
  points: [number, number][];
};

// Bangla letters such as ড় and য় have two Unicode spellings; compare the
// normalized form so hand-typed names match the dataset's.
const positionByStop = new Map(
  Object.entries(APPROXIMATE_STOP_POSITIONS).map(([stop, point]) => [stop.normalize("NFC"), point])
);

function buildPaths(): DemoPath[] {
  const paths: DemoPath[] = [];
  for (const spec of DEMO_SPECS) {
    const route = tempuRoutes.find((item) => item.number === spec.routeNumber);
    if (!route) continue;
    const stops = getDirectionData(route, spec.direction).stops;
    const points = stops.map((stop) => positionByStop.get(stop.normalize("NFC")));
    // Only simulate directions where every stop has a demo position.
    if (points.some((point) => !point)) continue;
    // Two vehicles per direction, half a loop apart, so riders usually
    // see one coming; the second is a different vehicle type.
    const cycle = (stops.length - 1) * DEMO_SECONDS_PER_STOP + DEMO_TERMINAL_WAIT_SECONDS;
    const nextType = VEHICLE_TYPES[(VEHICLE_TYPES.indexOf(spec.vehicleType) + 1) % VEHICLE_TYPES.length];
    const base = `demo-${spec.routeNumber}-${spec.direction}`;
    const shared = { routeName: route.name, stops, points: points as [number, number][] };
    paths.push({ id: `${base}-a`, spec, offset: spec.offset, ...shared });
    paths.push({
      id: `${base}-b`,
      spec: { ...spec, vehicleType: nextType },
      offset: spec.offset + cycle / 2,
      ...shared,
    });
  }
  return paths;
}

const DEMO_PATHS = buildPaths();

/** How many demo vehicles run at once. */
export const DEMO_VEHICLE_COUNT = DEMO_PATHS.length;

/** Route numbers that have a demo vehicle, for tests and UI hints. */
export const DEMO_ROUTE_NUMBERS = [...new Set(DEMO_PATHS.map((path) => path.spec.routeNumber))];

/**
 * Where every demo vehicle is at `nowMs`. Each one drives its route,
 * waits at the terminal, and starts again, so the demo never runs dry.
 */
export function demoVehiclesAt(nowMs: number): DemoVehicle[] {
  const nowIso = new Date(nowMs).toISOString();

  return DEMO_PATHS.map(({ id, spec, offset, routeName, stops, points }) => {
    const legs = stops.length - 1;
    const cycle = legs * DEMO_SECONDS_PER_STOP + DEMO_TERMINAL_WAIT_SECONDS;
    const elapsed = (((nowMs / 1000 + offset) % cycle) + cycle) % cycle;
    const travelled = Math.min(elapsed / DEMO_SECONDS_PER_STOP, legs);
    const stopIndex = Math.min(Math.floor(travelled), legs);
    const fraction = travelled - stopIndex;
    const from = points[stopIndex];
    const to = points[Math.min(stopIndex + 1, legs)];

    return {
      demo: true,
      publicId: id,
      routeNumber: spec.routeNumber,
      routeName,
      direction: spec.direction,
      startStop: stops[0],
      endStop: stops[legs],
      segmentStops: stops,
      vehicleType: spec.vehicleType,
      latitude: from[0] + (to[0] - from[0]) * fraction,
      longitude: from[1] + (to[1] - from[1]) * fraction,
      accuracy: null,
      lastLocationAt: nowIso,
      ageSeconds: 0,
      freshness: "live",
      source: "driver-device-gps",
      stopIndex,
      nextStop: stopIndex < legs ? stops[stopIndex + 1] : null,
    };
  });
}

export type ApproachingDemo = {
  vehicle: DemoVehicle;
  /** Stops between the vehicle and the boarding stop; 0 means it is there. */
  stopsAway: number;
};

/**
 * The nearest demo vehicle on a route and direction that has not yet passed
 * the boarding stop. Used to show "a demo tempu is 2 stops away".
 */
export function approachingDemoVehicle(
  vehicles: DemoVehicle[],
  routeNumber: string,
  direction: Direction,
  boardStop: string
): ApproachingDemo | null {
  let best: ApproachingDemo | null = null;
  for (const vehicle of vehicles) {
    if (vehicle.routeNumber !== routeNumber || vehicle.direction !== direction) continue;
    const boardIndex = vehicle.segmentStops.indexOf(boardStop);
    if (boardIndex < 0 || vehicle.stopIndex > boardIndex) continue;
    const stopsAway = boardIndex - vehicle.stopIndex;
    if (!best || stopsAway < best.stopsAway) best = { vehicle, stopsAway };
  }
  return best;
}
