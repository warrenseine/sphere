import { Physics, useBox, useSphere } from "@react-three/cannon";
import {
  AdaptiveDpr,
  OrbitControls,
  RoundedBox,
  softShadows,
  Stars,
  Stats,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Glitch,
  Outline,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import { List, Map, Set } from "immutable";
import { CODE_G, CODE_R, CODE_SPACE } from "keycode-js";
import {
  MutableRefObject,
  Ref,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Euler,
  Event,
  Matrix4,
  Mesh,
  Object3D,
  Quaternion,
  Vector2,
  Vector3,
} from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import create, { State } from "zustand";
import "./App.css";
import { useKeyDown, useKeyPress, useTouch } from "./useInput";

type Player = {
  orientation: Quaternion;
  color: string;
};

const createPlayer = (): Player => ({
  orientation: new Quaternion(),
  color: getBallColor(Math.floor(Math.random() * ballColors.length)),
});

const ballColors = [
  "rgb(249, 65, 68)",
  "rgb(243, 114, 44)",
  "rgb(248, 150, 30)",
  "rgb(249, 199, 79)",
  "rgb(144, 190, 109)",
  "rgb(67, 170, 139)",
  "rgb(87, 117, 144)",
];

function getBallColor(ballId: number): string {
  return ballColors[ballId % ballColors.length];
}

type Ball = {
  velocity: Vector3;
  position: Vector3;
  color: string;
  ballId: number;
};

const createBallFromPlayer = (ballId: number, player: Player): Ball => {
  const translation = new Vector3(0, 0, 3);
  const direction = new Vector3(0, 0, -1);

  const position = translation.applyQuaternion(player.orientation);
  const velocity = direction
    .applyQuaternion(player.orientation)
    .multiplyScalar(2);

  return {
    ballId,
    position,
    velocity,
    color: player.color,
  };
};

type Brick = {
  orbitOffset: Vector3;
  color: string;
  brickId: number;
  mesh?: Mesh;
};

const createBrick = (brickId: number, orbitOffset: Vector3): Brick => ({
  brickId,
  orbitOffset,
  color: getBallColor(brickId),
});

const getRandomBrickPosition = (): Vector3 => {
  const brickWidth = 0.4;
  const brickGap = 0.2;
  const maxBricks = Math.floor((2 * Math.PI) / (brickWidth + brickGap));
  const positionX = Math.floor(Math.random() * maxBricks);
  const positionY = Math.floor(Math.random() * maxBricks);

  return new Vector3(
    positionX * (brickWidth + brickGap) + brickGap / 2,
    positionY * (brickWidth + brickGap) + brickGap / 2,
    1.5
  );
};

type Object3DRef = MutableRefObject<Object3D | undefined>;
interface AppState extends State {
  player: Player;
  balls: List<Ball>;
  nextBallId: number;
  bricks: Map<number, Brick>;
  nextBrickId: number;
  outlineSelection: Set<Object3DRef>;
  actions: {
    addBall: () => void;
    removeBrick: (brickId: number) => void;
    addBrick: (position: Vector3) => void;
    addRandomBrick: () => void;
    addDefaultBricks: () => void;
    updateBrick: (brickId: number, changes: Partial<Brick>) => void;
    setPlayer: (changes: Partial<Player>) => void;
    addOutlineSelection: (mesh: Object3DRef) => void;
    removeOutlineSelection: (mesh: Object3DRef) => void;
    resetGame: () => void;
  };
}

const useStore = create<AppState>((set, get) => ({
  player: createPlayer(),
  balls: List<Ball>(),
  nextBallId: 0,
  bricks: Map<number, Brick>(),
  nextBrickId: 0,
  outlineSelection: Set<Object3DRef>(),
  actions: {
    addBall: () =>
      set((state) => {
        const ball = createBallFromPlayer(state.nextBallId, state.player);
        return {
          balls: state.balls.push(ball).slice(-3),
          nextBallId: state.nextBallId + 1,
        };
      }),
    removeBrick: (brickId: number) =>
      set((state) => ({ bricks: state.bricks.delete(brickId) })),
    addRandomBrick: () => {
      const {
        actions: { addBrick },
      } = get();
      addBrick(getRandomBrickPosition());
    },
    addBrick: (position: Vector3) =>
      set((state) => {
        const brick = createBrick(state.nextBrickId, position);
        return {
          bricks: state.bricks.set(brick.brickId, brick),
          nextBrickId: state.nextBrickId + 1,
        };
      }),
    addDefaultBricks: () => {
      const {
        actions: { addBrick },
      } = get();
      const points = generateFibonacciSphere();
      points.forEach(addBrick);
    },
    updateBrick: (brickId: number, changes: Partial<Brick>) =>
      set((state) => ({
        bricks: state.bricks.update(brickId, (value) => ({
          ...value,
          ...changes,
        })),
      })),
    setPlayer: (changes: Partial<Player>) =>
      set((state) => ({
        player: {
          ...state.player,
          ...changes,
        },
      })),
    addOutlineSelection: (mesh: Object3DRef) =>
      set((state) => ({ outlineSelection: state.outlineSelection.add(mesh) })),
    removeOutlineSelection: (mesh: Object3DRef) =>
      set((state) => ({
        outlineSelection: state.outlineSelection.remove(mesh),
      })),
    resetGame: () => {
      const {
        actions: { addDefaultBricks },
      } = get();
      set((state) => ({
        balls: state.balls.clear(),
        bricks: state.bricks.clear(),
      }));
      addDefaultBricks();
    },
  },
}));

const addOutlineSelectionSelector = (state: AppState) =>
  state.actions.addOutlineSelection;
const removeOutlineSelectionSelector = (state: AppState) =>
  state.actions.removeOutlineSelection;
const setPlayerSelector = (state: AppState) => state.actions.setPlayer;
const addBallSelector = (state: AppState) => state.actions.addBall;
const updateBrickSelector = (state: AppState) => state.actions.updateBrick;
const resetGameSelector = (state: AppState) => state.actions.resetGame;

function generateFibonacciSphere() {
  const samples = 64;
  const radius = 1.5;

  const points = [];
  const offset = 2 / samples;
  const increment = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < samples; i++) {
    const y = i * offset - 1 + offset / 2;
    const distance = Math.sqrt(1 - Math.pow(y, 2));
    const phi = ((i + 1) % samples) * increment;
    const x = Math.cos(phi) * distance;
    const z = Math.sin(phi) * distance;
    points.push(new Vector3(x * radius, y * radius, z * radius));
  }

  return points;
}

function lookAt(eye: Vector3, target: Vector3): [Euler, Vector3] {
  const up = new Vector3(0, 1, 0);
  const lookAt = new Matrix4().lookAt(eye, target, up);
  const rotation = new Euler().setFromRotationMatrix(lookAt);

  return [rotation, eye];
}

function PlayerGroup() {
  const controls = useRef<OrbitControlsImpl>(null!);
  const camera = useThree(({ camera }) => camera);
  const setPlayer = useStore(setPlayerSelector);
  const addBall = useStore(addBallSelector);
  const padSize: [number, number, number] = [2, 2, 0.1];
  const translation = new Vector3(0, 0, 5);

  const [ref, api] = useBox(() => ({
    args: padSize,
    mass: 1,
    position: translation.toArray(),
    rotation: [Math.PI, 0, 0],
    type: "Static",
    onCollide: collide,
  }));

  const collide = useCallback((e: Event) => {}, []);

  useKeyPress(CODE_SPACE, addBall);

  useTouch({ onUp: addBall });

  useFrame((state, delta) => {
    const orientation = camera.getWorldQuaternion(new Quaternion());
    const rotation = new Euler().setFromQuaternion(orientation);
    const position = camera.getWorldPosition(new Vector3());

    api.rotation.copy(rotation);
    api.position.copy(position);

    setPlayer({ orientation });
  });

  useEffect(() => {
    const mesh = ref.current!;
    mesh.addEventListener("collide", collide);
    return () => mesh.removeEventListener("collide", collide);
  }, [ref, collide]);

  return (
    <group>
      <OrbitControls
        ref={controls}
        minZoom={6}
        maxZoom={6}
        enablePan={false}
        enableZoom={false}
        enableRotate={true}
        enableDamping={true}
        camera={camera}
      />
    </group>
  );
}

function BallGroup(props: JSX.IntrinsicElements["group"]) {
  const balls = useStore((state) => state.balls);
  const ambientIntensity = balls.size > 0 ? 0 : 0.6;
  const pointIntensity = balls.size > 0 ? 0.6 / balls.size : 0;

  return (
    <group {...props}>
      <ambientLight intensity={ambientIntensity} />
      {balls.map((ball) => (
        <BallMesh
          key={ball.ballId}
          ball={ball}
          lightIntensity={pointIntensity}
        />
      ))}
    </group>
  );
}

function BallMesh({
  ball,
  lightIntensity,
}: {
  ball: Ball;
  lightIntensity: number;
}) {
  const addOutlineSelection = useStore(addOutlineSelectionSelector);
  const removeOutlineSelection = useStore(removeOutlineSelectionSelector);
  const ballRadius = 0.2;

  const [ref] = useSphere(() => ({
    args: ballRadius,
    mass: 1,
    position: ball.position.toArray(),
    velocity: ball.velocity.toArray(),
  }));

  useEffect(() => {
    addOutlineSelection(ref);
    return () => removeOutlineSelection(ref);
  }, [ref, addOutlineSelection, removeOutlineSelection]);

  return (
    <mesh ref={ref} scale={ballRadius} castShadow>
      <sphereGeometry args={[1, 16, 16]} />
      <meshToonMaterial attach="material" color={ball.color} />
      <pointLight
        intensity={lightIntensity}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
      />
    </mesh>
  );
}

function BrickGroup() {
  const bricks = useStore((state) => state.bricks);

  return (
    <group>
      {bricks.valueSeq().map((brick: Brick) => (
        <BrickMesh key={brick.brickId} brick={brick} />
      ))}
    </group>
  );
}

function BrickMesh({ brick }: { brick: Brick }) {
  const playerColor = useStore((state) => state.player.color);
  const updateBrick = useStore(updateBrickSelector);
  const addOutlineSelection = useStore(addOutlineSelectionSelector);
  const removeOutlineSelection = useStore(removeOutlineSelectionSelector);
  const [rotation, position] = useMemo(
    () => lookAt(brick.orbitOffset, new Vector3()),
    [brick]
  );
  const brickSize: [number, number, number] = [0.4, 0.4, 0.1];
  const [ref] = useBox(
    () => ({
      args: brickSize,
      mass: 1,
      position: position.toArray(),
      rotation: rotation.toArray(),
      type: "Static",
      onCollide: collide,
    }),
    undefined,
    [rotation, position]
  );

  const collide = useCallback(
    (e: Event) => {
      updateBrick(brick.brickId, { color: playerColor });
    },
    [updateBrick, brick, playerColor]
  );

  useEffect(() => {
    addOutlineSelection(ref);
    return () => removeOutlineSelection(ref);
  }, [ref, addOutlineSelection, removeOutlineSelection]);

  return (
    <RoundedBox
      args={brickSize} // Width, Height and Depth of the box
      radius={0.05} // Border-Radius of the box
      ref={ref as Ref<Mesh>} // All THREE.Mesh props are valid
      receiveShadow
    >
      <meshToonMaterial attach="material" color={brick.color} />
    </RoundedBox>
  );
}

function Effects() {
  const outlineSelection = useStore((state) => state.outlineSelection);
  const outlineSelectionArray = useMemo(
    () =>
      outlineSelection
        .toArray()
        .filter(
          (v: Object3DRef): v is MutableRefObject<Object3D> =>
            v.current !== undefined
        ),
    [outlineSelection]
  );
  const gPressed = useKeyDown(CODE_G);

  return (
    <Suspense fallback={null}>
      <EffectComposer multisampling={0} autoClear={false}>
        {gPressed ? (
          <Glitch
            active={true} // turn on/off the effect (switches between "mode" prop and GlitchMode.DISABLED)
            ratio={0.85} // Threshold for strong glitches, 0 - no weak glitches, 1 - no strong glitches.
            delay={new Vector2(0, 0)}
          />
        ) : (
          <SMAA />
        )}
        <Outline
          selection={outlineSelectionArray}
          edgeStrength={10} // the edge strength
          pulseSpeed={0.0} // a pulse speed. A value of zero disables the pulse effect
          visibleEdgeColor={0xffffff} // the color of visible edges
          hiddenEdgeColor={0x22090a} // the color of hidden edges
          blur={false} // whether the outline should be blurred
          xRay={false} // indicates whether X-Ray outlines are enabled
          width={2048}
          height={2048}
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
        {/* <SMAA /> */}
      </EffectComposer>
    </Suspense>
  );
}

function ViewportResize() {
  const { gl, viewport } = useThree();
  const targetSize = new Vector2(1920, 1920 / viewport.aspect);

  useFrame(() => {
    const size = gl.getDrawingBufferSize(new Vector2());
    if (!size.equals(targetSize)) {
      gl.setDrawingBufferSize(targetSize.x, targetSize.y, 1);
    }
  });

  return null;
}

softShadows({
  frustum: 3.75, // Frustum width (default: 3.75) must be a float
  size: 0.005, // World size (default: 0.005) must be a float
  near: 9.5, // Near plane (default: 9.5) must be a float
  samples: 17, // Samples (default: 17) must be a int
  rings: 11, // Rings (default: 11) must be a int
});

export default function App() {
  const resetGame = useStore(resetGameSelector);

  useEffect(resetGame, [resetGame]);
  useKeyPress(CODE_R, resetGame);

  return (
    <Canvas style={{ backgroundColor: "#121212" }} shadows>
      <ViewportResize />
      <Stats
        showPanel={0} // Start-up panel (default=0)
        className="stats" // Optional className to add to the stats container dom element
      />
      <AdaptiveDpr pixelated />
      <Physics
        gravity={[0, 0, 0]}
        defaultContactMaterial={{
          friction: 0,
          restitution: 1.1,
        }}
      >
        <BallGroup />
        <BrickGroup />
        <PlayerGroup />
      </Physics>
      <Effects />
    </Canvas>
  );
}
