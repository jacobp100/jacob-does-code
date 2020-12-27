---
title: React Native Bottom Sheets
layout: page
inline-css: blog
external-css: blog-highlight
---

<style>
video {
  display: block;
  max-width: 100%;
  margin: 32px auto;
}
</style>

# React Native Bottom Sheets

[TechniCalc](/technicalc) is an advanced scientific and engineering calculator. The UI uses TypeScript and React Native, and the ([open](https://github.com/jacobp100/technicalc-calculator) [source](https://github.com/jacobp100/technicalc-editor)) core is done in ReasonML.

The app has always had a bottom sheet menu navigation system, which lets you always see the equation while navigating through the menus. But until the most recent update, each menu could only be dismissed by pressing the title or the back button &mdash; which can be quite a reach on larger phones.

Now in the latest update, you'll be able to dismiss them by swiping down &mdash; much like the bottom sheet in Apple Maps.

<Video controls="controls" width="300" src="/assets/posts/technicalc-bottom-sheet.mp4" type="video/mp4"></Video>

There are libraries that do this to some extent already. For example, [react-native-modalize](https://github.com/jeremybarbet/react-native-modalize). However, as my menus behave like a card stack, and you can see the previous menus behind the current menu, I need something custom.

For this, I'll be using [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) and the built-in [`Animated`](https://reactnative.dev/docs/animations) library in React Native. If you're unfamiliar with either, it's worth having a quick read of the docs just to get a brief understanding of how they work.

## UX

First up is to look at how these dismiss gestures actually work. The bottom sheet on Apple Maps is the gold standard here &mdash; if only because it's by Apple. This actually has a reveal gesture too, but we will ignore that.

Their bottom sheet is comprised of a text input that does not form part of the scrolling input, and scrolling input. Playing around with this, I found:

The non-scrolling input can always initiate a drag to dismiss gesture.

The scrolling content will initiate a dismiss gesture only when scrolling down past the top of the scroll view &mdash; and it will stop scrolling while the dismiss gesture is active. It's also possible to cancel the dismiss gesture by scrolling back up. You can also freely switch between the dismiss gesture and scrolling gestures by scrolling up and down repeatedly.

You don't have to be at the top of the scroll view to initiate the gesture &mdash; you can be scrolled 100px up, and as long as you scroll more than 100px down, you'll initiate the gesture all the same.

A nuance to the scrolling is that you can not perform a dismiss gesture when momentum scrolling. If you've scrolled far down and then keep swiping up until you reach the top, you'll get a bounce effect rather than initiating the gesture. This makes sense from a UX perspective, as dismissing in this case would not be intentional. After you let the scroll animations settle, you'll once again be able to perform dismiss gestures.

Once the gesture is finished, the decision on whether close or reopen bottom sheet depends on if the gesture ended with any momentum. If there is momentum, it will move in the direction of the momentum. If there's no momentum, it will move to the final position that's closest to where it currently it was when the gesture ended.

## Bottom Sheet

Rather than putting layout logic (headers, footers etc.) in the bottom sheet component, we'll split it up into a core bottom sheet component, and few views that will add gesture interactions. You'll then be able to construct your own layouts with these views, and pass them to the bottom sheet component as children.

The end goal is to have an API that looks like the following.

```jsx
const Example = () => (
  <BottomSheet onDismissed={() => console.log("Dismissed")}>
    <BottomSheetDismissView>
      <Text>Title (drag down to close)</Text>
    </BottomSheetDismissView>
    <BottomSheetDismissScrollView>
      <Text>Content (scroll down past the top to close)</Text>
    </BottomSheetDismissScrollView>
  </BottomSheet>
);
```

For demonstration purposes, we'll use a really basic bottom sheet overlay that can be moved via an animation.

We'll drive everything by a single `Animated.Value`. Because some of the the gesture views we'll be making will also operate on this value, we'll expose it via React's context.

```jsx
const InteractiveGestureContext = React.createContext();
const bottomSheetHeight = 100;

const BottomSheet = ({ onDismissed, children }) => {
  const [interactiveGesture] = React.useState(() => new Animated.Value(0));

  // Clamp interactive gesture between 0 and bottomSheetHeight
  const translateY = interactiveGesture.interpolate({
    inputRange: [0, bottomSheetHeight],
    outputRange: [0, bottomSheetHeight],
    extrapolate: "clamp",
  });

  const bottomSheetStyle = {
    position: "absolute",
    width: "100%",
    height: bottomSheetHeight,
    bottom: 0,
    backgroundColor: "white",
    transform: [{ translateY }],
  };

  const contextValue = {
    interactiveGesture,
    // This will later be called from child components
    onDismissed,
  };

  return (
    <InteractiveGestureContext.Provider value={contextValue}>
      <Animated.View style={bottomSheetStyle}>{children}</Animated.View>
    </InteractiveGestureContext.Provider>
  );
};
```

## Dismissing Non-Scrolling Content

As mentioned in the introduction, we'll use [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) for the gestures. We need to use this rather than the one build into React Native, because it has ways to run gestures in parallel with the scroll view gestures.

For dismissing non-scrolling content, we can use `<PanGestureHandler>`, and have this gesture feed directly into `interactiveGesture` via `Animated.event`.

Note that to use `Animated.event`, you'll need to wrap any children in an `<Animated.View>`.

```jsx
const BottomSheetDismissGestureView = ({ children }) => {
  const { interactiveGesture, onDismissed } = React.useContext(
    InteractiveGestureContext
  );

  return (
    <PanGestureHandler
      onGestureEvent={Animated.event(
        [{ nativeEvent: { translationY: interactiveGesture } }],
        { useNativeDriver: true }
      )}
    >
      <Animated.View>{children}</Animated.View>
    </PanGestureHandler>
  );
};
```

This works while the user is actively dragging the content, but once they stop, we either need to re-open or close the bottom sheet. For this, we need to look for `State.END` events in `onHandlerStateChange`.

```jsx
// Implementation for <PanGestureHandler onHandlerStateChange={...} />
const onHandlerStateChange = (e) => {
  const { state, velocityY, translationY } = e.nativeEvent;

  if (state !== State.END) {
    return; // Ignore all unfinished gesture events
  }

  // This seemed to work well when trying
  const momentumThreshold = 100;
  const hasMomentum = Math.abs(velocityY) > momentumThreshold;

  const shouldClose = hasMomentum
    ? velocityY > 0
    : translationY > bottomSheetHeight / 2;

  // Perform open/close animation
  // You'll need more logic to actually remove the bottom sheet if you close
  Animated.timing(interactiveGesture, {
    toValue: shouldClose ? bottomSheetHeight : 0,
    duration: 300,
    useNativeDriver: true,
  }).start(() => {
    if (shouldClose) {
      onDismissed();
    }
  });
};
```

And that's it for dismissing non-scrolling content &mdash; it's actually very small once pieced together!

## Dismissing Scrolling Content

> This method has flaws in it relating to iOS's ability to drag scrollbars. The issues can only be fixed in native code, which you can find in my new package, [react-native-scroll-pan-gesture](https://github.com/jacobp100/react-native-scroll-pan-gesture).
>
> Nonetheless, I've left this section in-tact.

In the UX section, I mentioned how it was possible to switch between scrolling gestures and interactive dismissal gestures.

In the code, however, these gestures are never turned on or off. They run at the same time, for the same duration. Neither gesture is ever disabled &mdash; we only hide the effects of the gesture that is not the 'current' gesture.

Like last time, we'll use a pan gesture handler. Also like last time, we'll use the exact same `onGestureEvent` and `onHandlerStateChange` implementations.

Having simultaneous gesture handlers is documented in react-native-gesture-handler, but having one of those gestures be from a scroll view is not. Looking at react-native-modalize, this can be achieved with the following.

```jsx
const BottomSheetDismissScrollView = (scrollViewProps) => {
  const panGesture = React.useRef(null);
  const nativeViewGesture = React.useRef(null);

  return (
    <PanGestureHandler
      ref={panGesture}
      simultaneousHandlers={nativeViewGesture}
      onGestureEvent={sameOnGestureEventAsLastTime}
      onHandlerStateChange={sameOnHandlerStateChangeAsLastTime}
    >
      <Animated.View style={styles.container}>
        <NativeViewGestureHandler
          ref={nativeViewGesture}
          simultaneousHandlers={panGesture}
        >
          <ScrollView {...scrollViewProps} />
        </NativeViewGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

These gestures will now run at exactly the same time. We now need to disable the effects from each gesture when they aren't the 'current' gesture.

For the pan gesture handler, we can start with setting `activeOffsetY`. This will allow the gesture to run, but it won't start firing gesture events until we've moved our finger by at least this distance. Because we want this gesture to start once we scroll past the top of the scroll view, this value needs to be equal the scroll y position when the finger was placed on the screen.

To get the scroll y position, we could use the `onScroll` event. However, we don't want this value to update and change `activeOffsetY` as we scroll. We can instead use `onScrollEndDrag` and `onMomentumScrollEnd`.

```jsx
const BottomSheetDismissScrollView = (scrollViewProps) => {
  // ...
  const [scrollY, setScrollY] = React.useState(0);

  return (
    <PanGestureHandler
      ref={panGesture}
      simultaneousHandlers={nativeViewGesture}
      // We can still use these handlers unchanged, because the event's
      // translateY will be the distance between the position from when
      // activeOffsetY was met and the current gesture position
      onGestureEvent={sameOnGestureEventAsLastTime}
      onHandlerStateChange={sameOnHandlerStateChangeAsLastTime}
      activeOffsetY={scrollY}
    >
      <Animated.View /* ... */>
        <NativeViewGestureHandler /* ... */>
          <ScrollView
            {...scrollViewProps}
            onScrollEndDrag={(e) => {
              // Technically we could could be a momentum scroll
              // But this detail will become irrelevant later
              setScrollY(e.nativeEvent.targetContentOffset.y);
            }}
            onMomentumScrollEnd={(e) => {
              setScrollY(e.nativeEvent.contentOffset.y);
            }}
          />
        </NativeViewGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};
```

Next up, we need to stop scrolling when the dismiss gesture is the 'current' gesture. We can determine whether the gesture is active by modifying the existing implementations of `onGestureEvent` and `onHandlerStateChange`.

```jsx
const BottomSheetDismissScrollView = (scrollViewProps) => {
  // ...
  const [
    dismissGestureIsInProgress,
    setDismissGestureIsInProgress,
  ] = React.useState(false);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: interactiveGesture } }],
    {
      useNativeDriver: true,
      listener: (e) => {
        const { translateY } = e.nativeEvent;
        setDismissGestureIsInProgress(translateY > 0);
      },
    }
  );

  const onHandlerStateChange = (e) => {
    if (e.nativeEvent.state !== State.ACTIVE) {
      setInteractiveGestureActive(false);
    }

    // ... re-use rest of previous implementation
  };

  // ...
};
```

We can stop the scrolling gestures being visible by using `bounces`, which will stop the rubber banding effect on iOS when scrolling past the top of the scroll view.

Because the `dismissGestureIsInProgress` has to go through the bridge, there is a slight delay between the dismiss gesture starting and scroll view's scrolling stopping. This can lead to a small amount of content jumping, so we also need to scroll to the top once the dismiss gesture becomes active. For this case, it's easier to set the `contentOffset` prop rather than calling the `.scrollTo` method.

```jsx
const BottomSheetDismissScrollView = (scrollViewProps) => {
  // ...

  return (
    // ...
    <ScrollView
      // ...
      bounces={!dismissGestureIsInProgress}
      contentOffset={dismissGestureIsInProgress ? { x: 0, y: 0 } : undefined}
    />
    // ...
  );
};
```

Lastly, we need to disable the dismiss gesture when momentum scrolling is in progress. Luckily, we already have most of the callbacks to determine if this is the case.

```jsx
const BottomSheetDismissScrollView = (scrollViewProps) => {
  // ...
  const [isMomentumScrolling, setIsMomentumScrolling] = React.useState(false);

  const onMomentumScrollBegin = (e) => {
    setIsMomentumScrolling(true);
  };

  const onMomentumScrollEnd = (e) => {
    setScrollY(e.nativeEvent.contentOffset.y);
    setIsMomentumScrolling(false);
  };

  return (
    <PanGestureHandler
      /* ... */
      disabled={isMomentumScrolling}
    >
      {/* ... */}
    </PanGestureHandler>
  );
};
```

And that's the scrollable content done too. There is a good amount going on here, which is somewhat to be expected. Even implementing this purely in native code would require a lot of code too.

## Conclusion

There's still a few things missing (opening animations, changing the size of the bottom sheet, etc.). This is also completely untested on Android. However, this should at least serve as a foundation on how to build these kind of components.

Some of the benefits you'll find to this over react-native-modalize is that there is no prescription on how to layout your bottom sheet &mdash; you layout a page as you would any other, and opt in to the gestures on a per element basis. A subtle improvement too is that react-native-modalize disables the rubber banding effect on the bottom of the scroll view once the dismiss gesture has been started &mdash; whereas this method does not. This makes it feel much more like a native app.
