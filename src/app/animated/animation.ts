import Animated, { Clock, Value, cond, or, eq, block, spring, startClock, clockRunning } from "react-native-reanimated";
import { State } from "react-native-gesture-handler";


export const withBalloonScaleTiming = (pressState: Animated.Value<State>) => {
    const scaleToValue = cond(
        or(eq(pressState, State.ACTIVE), eq(pressState, State.BEGAN)),
        1.6,
        1,
    )
    const clock = new Clock()
    const state = {
        finished: new Value(0),
        velocity: new Value(0),
        position: new Value(0),
        time: new Value(0),
    }
    const config = {
        damping: 28,
        mass: 0.3,
        stiffness: 188.296,
        overshootClamping: false,
        toValue: scaleToValue,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
    }



    return block([
        cond(clockRunning(clock), 0, startClock(clock)),
        spring(clock, state, config),
        state.position,
    ])
}

export const follow = (value: Animated.Value<number> | number) => {
    const config = {
        damping: 28,
        mass: 0.3,
        stiffness: 188.296,
        overshootClamping: false,
        toValue: value,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
    };

    const clock = new Clock();

    const state = {
        finished: new Value(0),
        velocity: new Value(0),
        position: new Value(0),
        time: new Value(0),
    };
    return block([
        cond(clockRunning(clock), 0, startClock(clock)),
        spring(clock, state, config),
        state.position,
    ]);
}
function defineAnimation(factory: any) {
    'worklet';
    return factory();
}
export const withBouncingV2 = (decayAnimation: any, lowerValue: number, upperValue: number): number => {
    'worklet';
    return defineAnimation(() => {
        'worklet';
        const config: any = {
            deceleration: 0.998,
        };
        if (decayAnimation) {
            Object.keys(decayAnimation).forEach((key) => (config[key] = decayAnimation[key]));
        }

        function decay(animation: any, now: any) {
            const { lastTimestamp, initialVelocity, current, velocity } = animation;

            const deltaTime = Math.min(now - lastTimestamp, 64);
            animation.lastTimestamp = now;

            const kv = Math.pow(config.deceleration, deltaTime);
            const kx = (config.deceleration * (1 - kv)) / (1 - config.deceleration);

            const v0 = velocity / 1000;
            const v = v0 * kv * 1000;
            const x = current + v0 * kx;

            animation.current = x;
            animation.velocity = v;

            if (initialVelocity < 0 && animation.current <= lowerValue) {
                animation.velocity = Math.abs(animation.velocity);
                animation.initialVelocity = animation.velocity
            } else if (
                initialVelocity > 0 &&
                animation.current >= upperValue
            ) {
                animation.velocity = -Math.abs(animation.velocity);
                animation.initialVelocity = animation.velocity
            }

        }

        function start(animation: any, value: number, now: any) {
            animation.current = value;
            animation.lastTimestamp = now;
            animation.initialVelocity = config.velocity;
        }

        return {
            animation: decay,
            start,
            velocity: config.velocity || 0,
            callback: config.callback
        };
    })
}
export const min = (...args: number[]) => {
    'worklet';
    return args.reduce((acc, arg) => Math.min(acc, arg));
}

export const snapPoint = (
    value: number,
    velocity: number,
    points: number[]
) => {
    'worklet';
    const point = value + velocity * 0.2;
    const diffPoint = (p: number) => Math.abs(point - p);
    const deltas = points.map((p) => diffPoint(p));
    const minDelta = min(...deltas);
    return points.reduce(
        (acc, p) => diffPoint(p) === minDelta ? p : acc,
        0
    );
};
