import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Shape({
  position = [0, 0, 0],
  spin = { x: 0.22, y: 0.3 },
  floatAmp = 0.3,
  color = '#ea580c',
  emissive = '#ea580c',
  emissiveIntensity = 0.16,
  wireframe = false,
  opacity = 0.85,
  scale = 1,
  children,
}) {
  const ref = useRef()
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    ref.current.rotation.x += delta * spin.x
    ref.current.rotation.y += delta * spin.y
    ref.current.position.y = position[1] + Math.sin(t * 0.7 + position[0]) * floatAmp
    ref.current.position.x = position[0] + Math.sin(t * 0.5 + position[2]) * floatAmp * 0.6
  })
  return (
    <mesh ref={ref} position={position} scale={scale}>
      {children}
      <meshStandardMaterial
        color={color}
        wireframe={wireframe}
        transparent
        opacity={opacity}
        roughness={0.35}
        metalness={0.25}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  )
}

function WebGLScene() {
  const group = useRef()
  useFrame((state) => {
    const { x, y } = state.pointer
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.22, 0.045)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.16, 0.045)
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, x * y * 0.05, 0.03)
  })

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.15} color="#ffffff" />
      <pointLight position={[-5, 2, 3]} intensity={1.6} color="#ea580c" />
      <pointLight position={[5, -1, 2]} intensity={1.6} color="#8b5cf6" />
      <pointLight position={[0, 4, -2]} intensity={1.2} color="#06b6d4" />

      <group ref={group}>
        {/* Wireframe icosahedron — left */}
        <Shape position={[-4.4, 1.3, -1.8]} color="#f97316" wireframe opacity={0.95} scale={1.7} spin={{ x: 0.18, y: 0.26 }}>
          <icosahedronGeometry args={[1, 0]} />
        </Shape>
        {/* Torus — right */}
        <Shape position={[4.3, 1.7, -1.4]} color="#8b5cf6" spin={{ x: 0.35, y: 0.5 }} floatAmp={0.4}>
          <torusGeometry args={[0.85, 0.26, 16, 48]} />
        </Shape>
        {/* Glowing sphere — right low */}
        <Shape position={[5.2, -1.5, -1]} color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} opacity={0.95} scale={0.8}>
          <sphereGeometry args={[1, 32, 32]} />
        </Shape>
        {/* Octahedron wireframe — left low */}
        <Shape position={[-3.5, -1.8, -1]} color="#fb923c" wireframe opacity={0.8} scale={1.15} spin={{ x: 0.3, y: 0.22 }}>
          <octahedronGeometry args={[1, 0]} />
        </Shape>
        {/* Small inner torus — center-right */}
        <Shape position={[1.6, -0.4, -2.6]} color="#22d3ee" spin={{ x: 0.5, y: 0.3 }} floatAmp={0.22} scale={0.55} opacity={0.75}>
          <torusGeometry args={[1, 0.32, 14, 36]} />
        </Shape>
        {/* Dodecahedron far right */}
        <Shape position={[6.4, 3, -3]} color="#a78bfa" wireframe opacity={0.7} scale={0.9} floatAmp={0.5}>
          <dodecahedronGeometry args={[1, 0]} />
        </Shape>
      </group>
    </>
  )
}

export default function HeroCanvas({ className = '' }) {
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl =
        typeof window.WebGLRenderingContext !== 'undefined' &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      setSupported(!!gl)
    } catch {
      setSupported(false)
    }
  }, [])

  if (!supported) return null

  return (
    <div className={`absolute inset-0 z-0 ${className}`} aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <WebGLScene />
      </Canvas>
    </div>
  )
}