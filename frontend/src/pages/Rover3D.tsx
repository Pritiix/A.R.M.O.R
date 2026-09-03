import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useARMORStore } from '../store/armorStore'
import { Box, Eye, RefreshCw, Sun, ShieldAlert, Cpu } from 'lucide-react'
import { Card, Badge, Button, MetricDisplay } from '../components/ui'

// 3D Rover Mesh Component
function RoverMesh({ wireframe = false }: { wireframe?: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const frontLeftWheel = useRef<THREE.Mesh>(null)
  const frontRightWheel = useRef<THREE.Mesh>(null)
  const rearLeftWheel = useRef<THREE.Mesh>(null)
  const rearRightWheel = useRef<THREE.Mesh>(null)

  const latest = useARMORStore((s) => s.latest)
  const speed = latest?.rover?.speed ?? 0

  // Animate wheels and orientation based on live telemetry
  useFrame((_, delta) => {
    if (speed > 0) {
      const rotSpeed = speed * delta * 5
      if (frontLeftWheel.current) frontLeftWheel.current.rotation.x += rotSpeed
      if (frontRightWheel.current) frontRightWheel.current.rotation.x += rotSpeed
      if (rearLeftWheel.current) rearLeftWheel.current.rotation.x += rotSpeed
      if (rearRightWheel.current) rearRightWheel.current.rotation.x += rotSpeed
    }

    // Apply gentle floating / vibration when moving
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.005) * 0.02
    }
  })

  const chassisMat = new THREE.MeshStandardMaterial({
    color: '#162030',
    metalness: 0.8,
    roughness: 0.3,
    wireframe,
  })

  const wheelMat = new THREE.MeshStandardMaterial({
    color: '#0d131d',
    metalness: 0.2,
    roughness: 0.8,
    wireframe,
  })

  const sensorMat = new THREE.MeshStandardMaterial({
    color: '#1D8CF8',
    emissive: '#1D8CF8',
    emissiveIntensity: 0.5,
    wireframe,
  })

  const headlightMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: '#ffffff',
    emissiveIntensity: 1.0,
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main Chassis Body */}
      <mesh position={[0, 0.4, 0]} material={chassisMat}>
        <boxGeometry args={[1.6, 0.4, 2.4]} />
      </mesh>

      {/* Top Electronics Enclosure */}
      <mesh position={[0, 0.7, -0.2]} material={chassisMat}>
        <boxGeometry args={[1.0, 0.3, 1.2]} />
      </mesh>

      {/* Sensor Mast */}
      <mesh position={[0, 1.1, 0.4]} material={sensorMat}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
      </mesh>

      {/* Camera Module Box */}
      <mesh position={[0, 1.4, 0.4]} material={sensorMat}>
        <boxGeometry args={[0.3, 0.2, 0.2]} />
      </mesh>

      {/* Front Headlights */}
      <mesh position={[-0.6, 0.4, 1.21]} material={headlightMat}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
      </mesh>
      <mesh position={[0.6, 0.4, 1.21]} material={headlightMat}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
      </mesh>

      {/* 4 BO Wheels */}
      {/* Front Left */}
      <mesh ref={frontLeftWheel} position={[-0.95, 0.3, 0.8]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
        <cylinderGeometry args={[0.3, 0.3, 0.3, 24]} />
      </mesh>
      {/* Front Right */}
      <mesh ref={frontRightWheel} position={[0.95, 0.3, 0.8]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
        <cylinderGeometry args={[0.3, 0.3, 0.3, 24]} />
      </mesh>
      {/* Rear Left */}
      <mesh ref={rearLeftWheel} position={[-0.95, 0.3, -0.8]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
        <cylinderGeometry args={[0.3, 0.3, 0.3, 24]} />
      </mesh>
      {/* Rear Right */}
      <mesh ref={rearRightWheel} position={[0.95, 0.3, -0.8]} rotation={[0, 0, Math.PI / 2]} material={wheelMat}>
        <cylinderGeometry args={[0.3, 0.3, 0.3, 24]} />
      </mesh>
    </group>
  )
}

export function Rover3D() {
  const [wireframe, setWireframe] = useState(false)
  const latest = useARMORStore((s) => s.latest)

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-armor-text-primary uppercase tracking-wider">
            Digital Twin 3D Rover Inspection Model
          </h1>
          <p className="text-armor-text-dim text-xs font-mono">
            Three.js / WebGL Real-Time CAD Kinematic Renderer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={wireframe ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setWireframe(!wireframe)}
          >
            {wireframe ? 'SOLID MODE' : 'WIREFRAME CAD'}
          </Button>
          <Badge variant="online" pulse>
            3D SYNC ACTIVE
          </Badge>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="relative h-[500px] w-full rounded-lg overflow-hidden border border-armor-border bg-[#080E15]">
        <Canvas>
          <PerspectiveCamera makeDefault position={[3, 2.5, 4]} fov={50} />
          <OrbitControls enablePan enableZoom autoRotate autoRotateSpeed={0.5} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          <gridHelper args={[20, 20, '#1D8CF8', '#1E2D3D']} position={[0, 0, 0]} />
          <RoverMesh wireframe={wireframe} />
        </Canvas>

        {/* HUD Overlay */}
        <div className="absolute top-3 left-3 p-3 rounded bg-armor-surface/80 border border-armor-border backdrop-blur-md font-mono text-xs space-y-1">
          <div className="text-armor-primary font-bold">ARMOR-01 DIGITAL TWIN</div>
          <div className="text-armor-text-dim">Pitch: 0.0° | Roll: 0.0°</div>
          <div className="text-armor-text-dim">Speed: {latest?.rover?.speed?.toFixed(2) ?? 0} m/s</div>
        </div>

        <div className="absolute bottom-3 right-3 text-armor-text-dim font-mono text-[10px]">
          Use Mouse: Left Click + Drag to Rotate • Scroll to Zoom
        </div>
      </div>

      {/* Component Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="CHASSIS & MOTORS" icon={Box}>
          <p className="text-xs text-armor-text-secondary leading-relaxed font-mono">
            Acrylic/Aluminium dual-deck frame powered by 4x BO DC Motors connected to an L298N dual H-bridge motor driver.
          </p>
        </Card>
        <Card title="SENSOR MAST ARRAY" icon={Cpu}>
          <p className="text-xs text-armor-text-secondary leading-relaxed font-mono">
            Elevated sensor mast holding the MQ-2 smoke/combustible gas sensor, DHT11 temp/humidity module, and LDR light sensor.
          </p>
        </Card>
        <Card title="VISION & COMM" icon={Eye}>
          <p className="text-xs text-armor-text-secondary leading-relaxed font-mono">
            ESP32-CAM standalone camera module broadcasting an MJPEG video stream over local Wi-Fi.
          </p>
        </Card>
      </div>
    </div>
  )
}
