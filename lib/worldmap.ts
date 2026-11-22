import { PROJ } from "./world-paths";

/**
 * Natural Earth projection (Šavrič et al. polynomial), scaled to the map
 * generated in world-paths.ts. Matches d3's geoNaturalEarth1 for pin placement.
 */
export function projectPoint(lon: number, lat: number): [number, number] {
  const l = (lon * Math.PI) / 180;
  const p = (lat * Math.PI) / 180;
  const p2 = p * p;
  const p4 = p2 * p2;
  const x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
  const y = p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
  return [PROJ.tx + PROJ.scale * x, PROJ.ty - PROJ.scale * y];
}
