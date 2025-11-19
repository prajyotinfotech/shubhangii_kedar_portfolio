import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, Scroll, useScroll, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import originsImg from '../assets/1.png'
import missionImg from '../assets/consert1.png'
import storiesImg from '../assets/govyachyakinaryav.jpg'
import futureImg from '../assets/6a.png'

const SECTION_DEPTH = 7

const milestones = [
  {
    id: 'origins',
    year: '2015',
    title: 'Roots in Maharashtra',
    description:
      'Shubhangii’s voice first bloomed in devotional mandals and folk gatherings, blending classical rigor with warm storytelling.',
    stats: ['First stage at 16', '5+ local festivals', 'Family of listeners'],
    color: '#FF6B9D',
    image: originsImg,
  },
  {
    id: 'mission',
    year: '2019',
    title: 'Marathi Worldwide Mission',
    description:
      'The dream expanded online: cinematic YouTube covers and singles building a 500M+ view community across continents.',
    stats: ['540M+ views', '750K monthly listeners', '65M+ Spotify streams'],
    color: '#44D2C7',
    image: missionImg,
  },
  {
    id: 'stories',
    year: '2022',
    title: 'Story-led Originals',
    description:
      'Hits like “Govyachya Kinaryav” & “Ishkkachi Nauka” crossed 43M streams, fusing folk emotion with modern sound design.',
    stats: ['50+ original releases', 'Mirchi Music Award', '43M+ song streams'],
    color: '#FFB677',
    image: storiesImg,
  },
  {
    id: 'future',
    year: '2024+',
    title: 'Global Chapters Ahead',
    description:
      'The next tour brings immersive stagecraft, visual storytelling, and a Marathi music education initiative for young voices.',
    stats: ['30+ city world tour', '1M+ audience goal', 'Scholarship program'],
    color: '#A98BFF',
    image: futureImg,
  },
]

function CameraRail() {
  const { camera } = useThree()
  const scroll = useScroll()
  useFrame((_, delta) => {
    const offset = scroll.offset
    const targetZ = -offset * SECTION_DEPTH * (milestones.length + 0.5)
    const targetY = 1.1 + Math.sin(offset * Math.PI) * 0.35
    const targetX = Math.sin(offset * Math.PI * 0.4) * 0.6

    camera.position.z += (targetZ - camera.position.z) * delta * 4
    camera.position.y += (targetY - camera.position.y) * delta * 3
    camera.position.x += (targetX - camera.position.x) * delta * 2
    camera.rotation.x += ((-0.08) - camera.rotation.x) * delta * 2
  })
  return null
}

function StoryCards() {
  const pages = milestones.length + 0.5
  return (
    <Scroll html>
      <div
        style={{
          position: 'relative',
          width: '100vw',
          height: `${pages * 120}vh`,
          pointerEvents: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {milestones.map((data, index) => (
          <section
            key={data.id}
            style={{
              position: 'absolute',
              top: `${(index + 0.5) * 115}vh`,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(82vw, 560px)',
              padding: '1.8rem',
              borderRadius: '24px',
              background: 'rgba(5,6,12,0.9)',
              border: `1px solid ${data.color}44`,
              boxShadow: `0 20px 60px ${data.color}1f`,
              color: '#fff',
              textAlign: 'center',
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                gap: '0.65rem',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.35rem 1rem',
                borderRadius: '999px',
                border: `1px solid ${data.color}55`,
                color: data.color,
                letterSpacing: '0.32em',
                fontSize: '0.65rem',
                marginBottom: '1rem'
              }}
            >
              {data.year}
            </div>
            <div
              style={{
                width: '100%',
                height: '190px',
                borderRadius: '16px',
                marginBottom: '1.2rem',
                backgroundImage: `url(${data.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: `1px solid ${data.color}22`
              }}
            />
            <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '1.4rem', letterSpacing: '-0.01em' }}>{data.title}</h3>
            <p style={{ margin: '0 auto 1.1rem', maxWidth: '480px', lineHeight: 1.6, opacity: 0.9, fontSize: '0.95rem' }}>
              {data.description}
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                fontSize: '0.85rem',
                opacity: 0.9
              }}
            >
              {data.stats.map((stat) => (
                <span key={stat}>{stat}</span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Scroll>
  )
}

function AuroraCanopy() {
  const meshRef = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null)
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const hue = 0.58 + Math.sin(clock.elapsedTime * 0.12) * 0.05
    const sat = 0.6
    const light = 0.25
    meshRef.current.material.color.setHSL(hue, sat, light)
  })
  return (
    <mesh ref={meshRef} position={[0, 3, -milestones.length * SECTION_DEPTH]} rotation={[0, 0, 0]}>
      <planeGeometry args={[18, 10]} />
      <meshBasicMaterial transparent opacity={0.35} color={'#13233c'} />
    </mesh>
  )
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, -SECTION_DEPTH * milestones.length / 2]}>
      <planeGeometry args={[20, SECTION_DEPTH * (milestones.length + 2)]} />
      <meshStandardMaterial color={'#06070d'} roughness={0.9} metalness={0.1} />
    </mesh>
  )
}

// function MilestonePortal({ data, index }: { data: typeof milestones[number]; index: number }) {
//   const groupRef = useRef<THREE.Group>(null)
//   const frameMat = useRef<THREE.MeshStandardMaterial>(null)
//   const scroll = useScroll()
//   const texture = useTexture(data.image)

//   useFrame(() => {
//     if (!groupRef.current || !frameMat.current) return
//     const progress = scroll.offset * (milestones.length + 0.3) - (index + 0.5)
//     const influence = THREE.MathUtils.clamp(1 - Math.abs(progress) * 1.4, 0, 1)
//     const eased = THREE.MathUtils.smootherstep(influence, 0, 1)

//     groupRef.current.visible = eased > 0.02
//     groupRef.current.position.z = -index * SECTION_DEPTH - 4
//     groupRef.current.scale.setScalar(0.85 + eased * 0.2)
//     groupRef.current.rotation.y = (index % 2 === 0 ? -0.15 : 0.15) * (1 - eased)
//     frameMat.current.emissiveIntensity = 0.1 + eased * 0.35
//   })

//   return (
//     <group ref={groupRef} position={[0, 0.9, -index * SECTION_DEPTH - 4]}>
//       <Float speed={0.6} floatIntensity={0.3} rotationIntensity={0.2}>
//         <RoundedBox args={[4, 2.4, 0.18]} radius={0.35} smoothness={4}>
//           <meshStandardMaterial
//             ref={frameMat}
//             color={data.color}
//             emissive={data.color}
//             emissiveIntensity={0.15}
//             metalness={0.4}
//             roughness={0.35}
//             transparent
//             opacity={0.8}
//           />
//         </RoundedBox>
//       </Float>
//       <mesh position={[0, 0, 0.12]}>
//         <planeGeometry args={[3.6, 1.9]} />
//         <meshBasicMaterial map={texture} toneMapped={false} />
//       </mesh>
//     </group>
//   )
// }

function StarField() {
  const count = 600
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = Math.random() * 15
      arr[i * 3 + 2] = -Math.random() * 80
    }
    return arr
  }, [])

  const pointsRef = useRef<THREE.Points>(null)
  useFrame(({ clock }) => {
    if (pointsRef.current) pointsRef.current.rotation.y = clock.elapsedTime * 0.02
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={'#9fb3ff'} transparent opacity={0.65} />
    </points>
  )
}

function ScrollLabels() {
  return (
    <Scroll html>
      <div
        style={{
          position: 'relative',
          width: '100vw',
          height: `${(milestones.length + 0.5) * 100}vh`,
          pointerEvents: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {milestones.map((milestone, index) => (
          <div
            key={milestone.id}
            style={{
              position: 'absolute',
              top: `${(index + 0.5) * 100}vh`,
              left: '10%',
              transform: 'translateY(-50%)',
              color: '#ffffffaa',
              letterSpacing: '0.4em',
              fontSize: '0.65rem',
            }}
          >
            CHAPTER {index + 1}
          </div>
        ))}
      </div>
    </Scroll>
  )
}

function ProgressIndicator() {
  const scroll = useScroll()
  const thumbRef = useRef<HTMLDivElement>(null)
  useFrame(() => {
    if (!thumbRef.current) return
    thumbRef.current.style.transform = `translateY(${scroll.offset * 100}%)`
  })
  return (
    <Scroll html>
      <div
        style={{
          position: 'fixed',
          left: '32px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2px',
          height: '60vh',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '999px',
          pointerEvents: 'none',
        }}
      >
        <div
          ref={thumbRef}
          style={{
            position: 'absolute',
            left: '-6px',
            width: '14px',
            height: '14px',
            borderRadius: '999px',
            background: '#FF6B9D',
            boxShadow: '0 0 12px rgba(255,107,157,0.65)',
          }}
        />
      </div>
    </Scroll>
  )
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={11.35} />
      <directionalLight position={[4, 5, 3]} intensity={22.8} />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} />
    </>
  )
}

export default function JourneyAurora() {
  const pages = milestones.length + 8.5
  return (
    <section id="journey3d" style={{ width: '105%', height: `${pages * 100}vh`, position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%' }}>
        <Canvas camera={{ position: [0, 1.4, 4], fov: 55 }} gl={{ antialias: true }}>
          <color attach="background" args={[0x05060a]} />
          <fog attach="fog" args={[0x05060a, 4, 45]} />
          <Suspense fallback={null}>
            <ScrollControls pages={pages} damping={0.15}>
              <CameraRail />
              <Lighting />
              <GroundPlane />
              <AuroraCanopy />
              <StarField />
              <Sparkles count={180} scale={[10, 4, SECTION_DEPTH * milestones.length]} size={3} speed={0.2} />
              {/* {milestones.map((milestone, index) => (
                <MilestonePortal key={milestone.id} data={milestone} index={index} />
              ))} */}
              <ScrollLabels />
              <ProgressIndicator />
              <StoryCards />
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>
    </section>
  )
}
