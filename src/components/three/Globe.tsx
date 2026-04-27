"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DETECTION_LOCATIONS } from "@/lib/constants";

// Convert lat/lon to 3D sphere coordinates
function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Risk level to color mapping — meaningful color coding
const riskColors: Record<string, THREE.Color> = {
  critical: new THREE.Color("#ff3b5c"),
  high: new THREE.Color("#ff8c42"),
  medium: new THREE.Color("#fbbf24"),
  low: new THREE.Color("#34d399"),
};

function DetectionPoint({ lat, lon, risk, count }: { lat: number; lon: number; risk: string; count: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => latLonToVec3(lat, lon, 1.02), [lat, lon]);
  const color = riskColors[risk] || riskColors.low;
  // Scale point size by detection count (meaningful sizing)
  const scale = 0.02 + (count / 400) * 0.03;

  useFrame((state) => {
    if (ref.current) {
      // Pulse effect — critical pulses faster
      const speed = risk === "critical" ? 3 : risk === "high" ? 2 : 1;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * speed) * 0.3;
      ref.current.scale.setScalar(scale * pulse);
    }
  });

  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

function DetectionArc({ from, to, risk }: { from: THREE.Vector3; to: THREE.Vector3; risk: string }) {
  const lineRef = useRef<THREE.Line>(null);
  const color = riskColors[risk] || riskColors.low;

  const lineObj = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(1.5);
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const points = curve.getPoints(40);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 });
    return new THREE.Line(geometry, material);
  }, [from, to, color]);

  return <primitive ref={lineRef} object={lineObj} />;
}

function GlobeWireframe() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={ref}>
      {/* Main sphere wireframe */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#00b4ff" wireframe transparent opacity={0.08} />
      </mesh>
      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[0.98, 24, 24]} />
        <meshBasicMaterial color="#0c0c14" transparent opacity={0.9} />
      </mesh>
      {/* Atmosphere ring */}
      <mesh>
        <sphereGeometry args={[1.06, 32, 32]} />
        <meshBasicMaterial color="#00b4ff" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
      {/* Latitude lines */}
      {[-60, -30, 0, 30, 60].map((lat) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const r = Math.sin(phi);
        const y = Math.cos(phi);
        return (
          <mesh key={lat} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r - 0.001, r + 0.001, 64]} />
            <meshBasicMaterial color="#00b4ff" transparent opacity={0.06} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* Detection points — color-coded by risk */}
      {DETECTION_LOCATIONS.map((loc, i) => (
        <DetectionPoint key={i} lat={loc.lat} lon={loc.lon} risk={loc.risk} count={loc.count} />
      ))}
      {/* Detection arcs — connecting high-risk locations */}
      {DETECTION_LOCATIONS.filter(l => l.risk === "critical" || l.risk === "high").map((loc, i, arr) => {
        if (i === arr.length - 1) return null;
        const from = latLonToVec3(loc.lat, loc.lon, 1.02);
        const to = latLonToVec3(arr[i + 1].lat, arr[i + 1].lon, 1.02);
        return <DetectionArc key={i} from={from} to={to} risk={loc.risk} />;
      })}
    </group>
  );
}

export default function Globe() {
  return (
    <group>
      <GlobeWireframe />
    </group>
  );
}
