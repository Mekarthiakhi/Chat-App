import Particles from "react-tsparticles";

export default function ParticlesBg() {
  return (
    <Particles
      options={{
        background: { color: "transparent" },
        particles: {
          number: { value: 40 },
          size: { value: 2 },
          move: { speed: 0.6 },
          opacity: { value: 0.3 },
        },
      }}
      style={{
        position: "absolute",
        zIndex: 0,
      }}
    />
  );
}