import { Physics, useSphere } from "@react-three/cannon";
import { PerspectiveCamera, useCubeTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Camera, Euler, Group, Mesh, Vector3 } from "three";
import { KEY_LEFT, KEY_RIGHT, KEY_SPACE } from "keycode-js";
import { useEffect, useRef, useState } from "react";
import {
  atom,
  RecoilRoot,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState
} from "recoil";
import "./App.css";
import { useKeyDown, useKeyPress } from "./useKeyPress";

type RigidBody = {
  angularVelocity: Euler;
  velocity: Vector3;
  position: Vector3;
};

const playerState = atom<RigidBody>({
  key: "player",
  default: {
    angularVelocity: new Euler(),
    velocity: new Vector3(),
    position: new Vector3(),
  },
});

type BallState = RigidBody & {
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

function Pad(props: JSX.IntrinsicElements["mesh"]) {
  const mesh = useRef<Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const setBalls = useSetRecoilState(ballState);

  useKeyPress(KEY_SPACE, () => {
    const velocity = mesh.current.getWorldDirection(new Vector3());
    const position = mesh.current.getWorldPosition(new Vector3());

    const newBall: BallState = {
      angularVelocity: new Euler(),
      velocity,
      position,
      ballId: getBallId(),
    };

    setBalls((balls) => [...balls, newBall].slice(-3));
  });

  useFrame((state, delta) => {
    if (mesh.current) mesh.current.rotation.x += 0.01;
  });

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 0.2, 0.1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

function Sphere(props: JSX.IntrinsicElements["mesh"]) {
  const mesh = useRef<Mesh>(null!);

  // useFrame((state, delta) => (mesh.current.rotation.x += 0.01));

  return (
    <mesh {...props} ref={mesh}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

const playerPadOffsetPosition = new Vector3(0, -0.5, 4);

function Player(props: JSX.IntrinsicElements["group"]) {
  const leftPressed = useKeyDown(KEY_LEFT);
  const rightPressed = useKeyDown(KEY_RIGHT);
  const padGroup = useRef<Group>(null!);
  const camera = useRef<Camera>(null!);
  const [player, setPlayer] = useRecoilState(playerState);

  useFrame(() => {
    const angularVelocity = new Euler(
      0,
      leftPressed ? 1 : rightPressed ? -1 : 0,
      0
    );
    setPlayer({ ...player, angularVelocity });
  });

  useFrame((state, delta) => {
    padGroup.current.rotation.y += delta * player.angularVelocity.y;
  });

  return (
    <group ref={padGroup} {...props}>
      <Pad position={playerPadOffsetPosition} />
      <PerspectiveCamera makeDefault ref={camera} position={[0, 0, 6]}>
        <mesh />
      </PerspectiveCamera>
    </group>
  );
}

function SkyBox() {
  const { scene } = useThree();
  const cubeMapTexture = useCubeTexture(Array(6).fill("skybox.jpg"), {
    path: "./",
  });

  useEffect(() => {
    const previous = scene.background;
    scene.background = cubeMapTexture;
    return () => {
      scene.background = previous;
    };
  }, [cubeMapTexture, scene]);

  return null;
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

  const [ref] = useSphere(() => ({
    args: 0.2, // radius
    mass: 1,
    position: ball.position.toArray(),
    velocity: ball.velocity.toArray(),
  }));

  return (
    <mesh {...props} ref={ref} scale={0.2}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
}

export default function App() {
  return (
    <Canvas>
      <RecoilRoot>
        <Physics gravity={[0, 0, 0]}>
          <ambientLight />
          <pointLight position={[30, 10, 10]} />
          <SkyBox />
          <Balls />
          <Sphere position={[0, 0, 0]} />
          <Player position={[0, 0, 0]} />
        </Physics>
      </RecoilRoot>
    </Canvas>
  );
}
