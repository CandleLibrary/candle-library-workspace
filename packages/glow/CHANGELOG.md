## [v0.5.0] - 2021-12-04 

- [2021-12-02]

    Change animation initialization interface. Key frames are now defined using a `tic` property indicating the location on the timeline at which point the target value of the keyframe is completely applied. Tics are based on Milliseconds.  ```js  glow({ obj: my_object, opacity: [{ tic: 20, val: 0 }, { tic: 200, val: 1 }] })  ```

- [2021-11-25]

    Moved easing objects to `Animation.easing`. Added the same easing property to the transition `in` and `out` registration functions.

