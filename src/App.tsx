import { useSpring } from "@react-spring/core";
import { Physics, useBox, useSphere } from "@react-three/cannon";
import {
  MeshDistortMaterial,
  PerspectiveCamera,
  RoundedBox,
  softShadows,
  Stars,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Glitch, Vignette } from "@react-three/postprocessing";
import { KEY_LEFT, KEY_RIGHT, KEY_SPACE } from "keycode-js";
import { Ref, useCallback, useEffect, useRef } from "react";
import {
  atom,
  RecoilRoot,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import { Camera, Euler, Event, Group, Mesh, Quaternion, Vector3 } from "three";
import "./App.css";
import { useKeyDown, useKeyPress } from "./useKeyPress";

type PlayerState = {
  orbitOffset: Vector3;
};

const playerState = atom<PlayerState>({
  key: "player",
  default: {
    orbitOffset: new Vector3(),
  },
});

type BallState = {
  angularVelocity: Euler;
  velocity: Vector3;
  position: Vector3;
  ballId: number;
};

const ballState = atom<BallState[]>({
  key: "ball",
  default: [],
  dangerouslyAllowMutability: true,
});

let ballId = 0;
function getBallId() {
  return ++ballId;
}

function Sphere(props: JSX.IntrinsicElements["mesh"]) {
  const [ref] = useSphere(() => ({
    args: 1, // radius
    mass: 1,
    type: "Static",
  }));

  return (
    <mesh {...props} ref={ref} receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshToonMaterial attach="material" color="hotpink" />
    </mesh>
  );
}

function Player(props: JSX.IntrinsicElements["group"]) {
  const leftPressed = useKeyDown(KEY_LEFT);
  const rightPressed = useKeyDown(KEY_RIGHT);
  const padGroup = useRef<Group>(null!);
  const camera = useRef<Camera>(null!);
  const [player, setPlayer] = useRecoilState(playerState);
  const padSize: [number, number, number] = [1, 0.2, 0.1];
  const [ref, api] = useBox(() => ({
    args: padSize,
    mass: 1,
    position: [0, 0, 4],
    rotation: [Math.PI, 0, 0],
    type: "Static",
    onCollide: collide,
  }));

  const setBalls = useSetRecoilState(ballState);

  const { distort } = useSpring({
    to: { distort: 0 },
    from: { distort: 0.4 },
    config: { duration: 1500 },
  });

  const collide = useCallback(
    (e: Event) => {
      distort.reset();
    },
    [distort]
  );

  useKeyPress(KEY_SPACE, () => {
    const direction = ref
      .current!.getWorldDirection(new Vector3())
      .normalize()
      .multiplyScalar(-1);
    const velocity = direction.clone().multiplyScalar(1.5);
    const position = ref
      .current!.getWorldPosition(new Vector3())
      .add(direction);

    const newBall: BallState = {
      angularVelocity: new Euler(),
      velocity,
      position,
      ballId: getBallId(),
    };

    setBalls((balls) => [...balls, newBall].slice(-3));
  });

  useFrame((state, delta) => {
    const orbitVelocity = new Vector3(
      0,
      leftPressed ? -1 : rightPressed ? 1 : 0,
      0
    );
    const orbitOffset = player.orbitOffset
      .clone()
      .addScaledVector(orbitVelocity, delta);

    setPlayer({ orbitOffset });
  });

  useFrame((state, delta) => {
    const quaternion = new Quaternion();
    quaternion.setFromAxisAngle(new Vector3(0, 1, 0), player.orbitOffset.y);

    const euler = new Euler();
    euler.setFromQuaternion(quaternion);

    api.rotation.copy(euler);

    const translationOffset = new Vector3(0, 0, 4);

    // Use quaternion to rotate the relative vector.
    const translation = translationOffset.applyQuaternion(quaternion);

    api.position.copy(translation);
  });

  useEffect(() => {
    const mesh = ref.current!;
    mesh.addEventListener("collide", collide);
    return () => mesh.removeEventListener("collide", collide);
  }, [ref, collide]);

  return (
    <group ref={padGroup} {...props}>
      <RoundedBox
        args={padSize} // Width, Height and Depth of the box
        radius={0.05} // Border-Radius of the box
        smoothness={8} // Optional, number of subdivisions
        ref={ref as Ref<Mesh>} // All THREE.Mesh props are valid
        receiveShadow
      >
        <meshPhongMaterial attach="material" color="#f3f3f3" />
        <MeshDistortMaterial
          color="orange"
          attach="material"
          distort={distort.get()} // Strength, 0 disables the effect (default=1)
          speed={10} // Speed (default=1)
        />
        <PerspectiveCamera
          makeDefault
          ref={camera}
          position={[0, 1, 2]}
          rotation={[-Math.PI / 16, 0, 0]}
        />
      </RoundedBox>
    </group>
  );
}

function Balls(props: JSX.IntrinsicElements["group"]) {
  const balls = useRecoilValue(ballState);

  return (
    <group {...props}>
      {balls.map((ball) => (
        <Ball key={ball.ballId} ball={ball} />
      ))}
    </group>
  );
}

function Ball(props: JSX.IntrinsicElements["mesh"] & { ball: BallState }) {
  const ball = props.ball;
  const ballRadius = 0.2;

  const [ref] = useSphere(() => ({
    args: ballRadius,
    mass: 1,
    position: ball.position.toArray(),
    velocity: ball.velocity.toArray(),
  }));

  return (
    <mesh {...props} ref={ref} scale={ballRadius} castShadow>
      <sphereGeometry args={[1, 16, 16]} />
      <meshToonMaterial attach="material" color="green" />
    </mesh>
  );
}

softShadows({
  frustum: 3.75, // Frustum width (default: 3.75) must be a float
  size: 0.005, // World size (default: 0.005) must be a float
  near: 9.5, // Near plane (default: 9.5) must be a float
  samples: 17, // Samples (default: 17) must be a int
  rings: 11, // Rings (default: 11) must be a int
});

export default function App() {
  return (
    <Canvas style={{ backgroundColor: "#121212" }} shadows>
      <RecoilRoot>
        <Physics
          gravity={[0, 0, 0]}
          defaultContactMaterial={{
            friction: 0,
            restitution: 1,
          }}
        >
          <ambientLight />
          <pointLight
            position={[30, 10, 10]}
            castShadow
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
          />
          <Balls />
          <Sphere position={[0, 0, 0]} />
          <Player position={[0, 0, 0]} />
        </Physics>
      </RecoilRoot>
      <EffectComposer multisampling={0}>
        <Glitch
          active // turn on/off the effect (switches between "mode" prop and GlitchMode.DISABLED)
          ratio={0.85} // Threshold for strong glitches, 0 - no weak glitches, 1 - no strong glitches.
        />
        <Stars
          radius={100} // Radius of the inner sphere (default=100)
          depth={50} // Depth of area where stars should fit (default=50)
          count={5000} // Amount of stars (default=5000)
          factor={4} // Size factor (default=4)
          saturation={0} // Saturation 0-1 (default=0)
          fade // Faded dots (default=false)
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
}
