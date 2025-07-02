import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Environment, 
  Float, 
  Sphere, 
  MeshDistortMaterial, 
  ContactShadows,
  Html,
  Effects,
  RoundedBox
} from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Chip, Card, CardContent, alpha } from '@mui/material';

// Floating particles component for ambient effect
function ParticleSystem({ count = 100 }) {
  const meshRef = useRef();
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#4fc3f7"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Modern 3D Bar with glassmorphism effect
function ModernBar({ position, height, color, label, value, isHighlighted = false }) {
  const meshRef = useRef();
  const textRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Ensure height is always a valid number
  const validHeight = Math.max(Number(height) || 0.5, 0.5);
  const validValue = Number(value) || 0;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  const barColor = hovered ? '#ffffff' : color;
  const glowIntensity = hovered || isHighlighted ? 2 : 1;

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.1}>
        {/* Main bar with glassmorphism */}
        <RoundedBox
          ref={meshRef}
          position={[0, validHeight / 2, 0]}
          args={[1.2, validHeight, 1.2]}
          radius={0.1}
          smoothness={3}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color={barColor}
            transparent
            opacity={0.8}
            roughness={0.1}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={glowIntensity}
            transmission={0.3}
            thickness={0.5}
            ior={1.4}
          />
        </RoundedBox>

        {/* Glow effect */}
        <RoundedBox 
          position={[0, validHeight / 2, 0]} 
          args={[1.4, validHeight + 0.2, 1.4]}
          radius={0.1}
          smoothness={3}
        >
          <meshBasicMaterial
            color={color}
            transparent
            opacity={hovered ? 0.3 : 0.1}
            side={THREE.DoubleSide}
          />
        </RoundedBox>

        {/* Floating label */}
        <Html position={[0, -1.5, 0]} center>
          <div style={{
            background: `${alpha('#000000', 0.7)}`,
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '8px 16px',
            border: `1px solid ${alpha('#ffffff', 0.2)}`,
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            textAlign: 'center',
            minWidth: '80px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div>{label}</div>
            <div style={{ 
              fontSize: '18px', 
              color: color, 
              marginTop: '4px',
              fontWeight: '700'
            }}>
              {validValue}
            </div>
          </div>
        </Html>

        {/* Value display above bar */}
        <Text
          ref={textRef}
          position={[0, validHeight + 1, 0]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {validValue}
        </Text>
      </Float>
    </group>
  );
}

// Animated background mesh
function AnimatedBackground() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -10]} scale={[20, 20, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <MeshDistortMaterial
        color="#0a0a0a"
        transparent
        opacity={0.3}
        distort={0.3}
        speed={2}
        roughness={0.5}
      />
    </mesh>
  );
}

// Stats overlay component
function StatsOverlay({ stats }) {
  const submitted = stats.submitted || 0;
  const inProgress = stats.inProgress || 0;
  const resolved = stats.resolved || 0;
  const totalGrievances = submitted + inProgress + resolved;
  const resolutionRate = totalGrievances > 0 ? (resolved / totalGrievances * 100).toFixed(1) : 0;
  const activeRate = totalGrievances > 0 ? (inProgress / totalGrievances * 100).toFixed(1) : 0;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: alpha('#000000', 0.7),
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${alpha('#ffffff', 0.1)}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        minWidth: '200px',
        zIndex: 10
      }}
    >
      <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>
        📊 Analytics Overview
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
            Total Cases
          </Typography>
          <Chip 
            label={totalGrievances} 
            size="small" 
            sx={{ 
              backgroundColor: alpha('#4fc3f7', 0.2),
              color: '#4fc3f7',
              fontWeight: 600
            }} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
            Resolution Rate
          </Typography>
          <Chip 
            label={`${resolutionRate}%`} 
            size="small" 
            sx={{ 
              backgroundColor: alpha('#4caf50', 0.2),
              color: '#4caf50',
              fontWeight: 600
            }} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
            Active Cases
          </Typography>
          <Chip 
            label={`${activeRate}%`} 
            size="small" 
            sx={{ 
              backgroundColor: alpha('#ff9800', 0.2),
              color: '#ff9800',
              fontWeight: 600
            }} 
          />
        </Box>
      </Box>
    </Box>
  );
}

export default function GrievanceViz() {
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    inProgress: 0,
    resolved: 0,
    byDepartment: {}
  });
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${btoa(JSON.stringify(user))}`
          }
        };
        
        const response = await axios.get('http://localhost:5000/api/grievances/stats', config);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching grievance stats:', error);
        // Fallback demo data for testing
        setStats({
          total: 25,
          submitted: 8,
          inProgress: 12,
          resolved: 5,
          byDepartment: {
            'Academic': 8,
            'Admin': 5,
            'Finance': 7,
            'IT': 5
          }
        });
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div style={{ 
      width: '100%', 
      height: '500px', 
      position: 'relative',
      borderRadius: '16px',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #0d1421 100%)'
    }}>
      <Canvas
        camera={{ position: [0, 8, 15], fov: 60 }}
        style={{ background: 'transparent' }}
        shadows
      >
        {/* Lighting setup */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} color="#4fc3f7" intensity={0.5} />
        <spotLight
          position={[5, 15, 5]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
          color="#ffffff"
        />

        {/* Environment and atmosphere */}
        <Environment preset="night" />
        <AnimatedBackground />
        <ParticleSystem count={150} />

        {/* Orbit controls with smooth damping */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={10}
          maxDistance={25}
          dampingFactor={0.05}
        />

        {/* Main status bars */}
        <group position={[0, 0, 0]}>
          <ModernBar
            position={[-5, 0, 0]}
            height={Math.max((stats.submitted || 0) * 0.5, 0.5)}
            color="#4caf50"
            label="Submitted"
            value={stats.submitted || 0}
            isHighlighted={(stats.submitted || 0) > (stats.inProgress || 0)}
          />
          <ModernBar
            position={[0, 0, 0]}
            height={Math.max((stats.inProgress || 0) * 0.5, 0.5)}
            color="#ff9800"
            label="In Progress"
            value={stats.inProgress || 0}
            isHighlighted={(stats.inProgress || 0) === Math.max((stats.submitted || 0), (stats.inProgress || 0), (stats.resolved || 0))}
          />
          <ModernBar
            position={[5, 0, 0]}
            height={Math.max((stats.resolved || 0) * 0.5, 0.5)}
            color="#9c27b0"
            label="Resolved"
            value={stats.resolved || 0}
            isHighlighted={(stats.resolved || 0) > (stats.submitted || 0)}
          />
        </group>

        {/* Department distribution with circular arrangement */}
        <group position={[0, 0, -6]}>
          {Object.entries(stats.byDepartment || {}).map(([dept, count], index) => {
            const angle = (index / Object.keys(stats.byDepartment || {}).length) * Math.PI * 2;
            const radius = 4;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const validCount = Number(count) || 0;
            
            return (
              <ModernBar
                key={dept}
                position={[x, 0, z]}
                height={Math.max(validCount * 0.3, 0.3)}
                color="#00bcd4"
                label={dept}
                value={validCount}
              />
            );
          })}
        </group>

        {/* Floating decorative elements */}
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
          <Sphere position={[-8, 5, -5]} scale={0.3}>
            <MeshDistortMaterial
              color="#4fc3f7"
              transparent
              opacity={0.3}
              distort={0.2}
              speed={2}
            />
          </Sphere>
        </Float>

        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
          <Sphere position={[8, 4, -3]} scale={0.4}>
            <MeshDistortMaterial
              color="#9c27b0"
              transparent
              opacity={0.2}
              distort={0.3}
              speed={1.5}
            />
          </Sphere>
        </Float>

        {/* Contact shadows for realism */}
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={10}
        />

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom 
            intensity={0.3} 
            luminanceThreshold={0.3} 
            luminanceSmoothing={0.9}
            height={300}
          />
          <ToneMapping />
        </EffectComposer>
      </Canvas>

      {/* Stats overlay */}
      <StatsOverlay stats={stats} />

      {/* Bottom info panel */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          background: alpha('#000000', 0.6),
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          padding: '16px',
          border: `1px solid ${alpha('#ffffff', 0.1)}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Typography variant="body2" sx={{ color: '#b0b0b0', textAlign: 'center' }}>
          🎮 Interactive 3D Analytics • Drag to rotate • Scroll to zoom • Hover for details
        </Typography>
      </Box>
    </div>
  );
}
