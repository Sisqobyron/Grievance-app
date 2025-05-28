import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, useHelper } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Bar({ position, height, color, label, value }) {
  const meshRef = React.useRef();
  useHelper(meshRef, THREE.BoxHelper, 'white');

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        onPointerOver={(e) => {
          document.body.style.cursor = 'pointer';
          e.object.material.color.setHex(0xff9900);
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = 'default';
          e.object.material.color.set(color);
        }}
      >
        <boxGeometry args={[1, height, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, -1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
    </group>
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
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        style={{ background: '#1a1a1a' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls />

        {/* Status Bars */}
        <Bar
          position={[-4, 0, 0]}
          height={stats.submitted + 1}
          color="#4CAF50"
          label="Submitted"
          value={stats.submitted}
        />
        <Bar
          position={[0, 0, 0]}
          height={stats.inProgress + 1}
          color="#2196F3"
          label="In Progress"
          value={stats.inProgress}
        />
        <Bar
          position={[4, 0, 0]}
          height={stats.resolved + 1}
          color="#9C27B0"
          label="Resolved"
          value={stats.resolved}
        />

        {/* Department distribution */}
        {Object.entries(stats.byDepartment || {}).map(([dept, count], index) => (
          <Bar
            key={dept}
            position={[index * 2 - 4, 0, -4]}
            height={count + 1}
            color="#FF5722"
            label={dept}
            value={count}
          />
        ))}

        {/* Grid Helper */}
        <gridHelper args={[20, 20, '#303030', '#303030']} />
      </Canvas>
    </div>
  );
}
