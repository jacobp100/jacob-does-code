---
title: React Native Card Stack
layout: page
css: blog
---

<style>
video {
  display: block;
  max-width: 100%;
  margin: 32px auto;
}
</style>

# React Native Card Stack

In my [last post](/posts/2020-10-09-react-native-bottom-sheets), I talked about interactive gestures for bottom sheets.

The code in that post was taken from the [TechniCalc](/technicalc) app. Another thing TechniCalc does is it stacks these bottom sheets on top of each other. In this post, I will discuss how to achieve this.

<video controls width="300">
  <source src="/assets/posts/technicalc-bottom-sheet.mp4" type="video/mp4">
</video>

## Animating New Cards in

We'll start with a basic component that takes multiple children, and displays each of them as a card.

```jsx
const Example = ({ children }) => {
  // You technically don't have to `toArray` this point - but we need it later
  const childrenArray = React.Children.toArray(children);

  return (
    <View style={styles.container}>
      {childrenArray.map((child, index) => {
        return (
          <Animated.View key={index} style={styles.card}>
            {child}
          </Animated.View>
        );
      })}
    </View>
  );
};

const modalHeight = 300;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: modalHeight,
    bottom: 0,
    backgroundColor: "white",
  },
});
```

The last child will display on top. There's no animation at this point, so new and removed children appear and disappear instantly.

In TechniCalc, new children slide up from the bottom. The children behind that slightly shrink, move up, and reduce their opacity.

To animate this, it's easiest to have a single animation that all cards are based off. If we make this animation follow animate to number of children (whenever it changes), each card can compare its index to the number of children to compute its style.

```jsx
const Example = ({ children }) => {
  const childrenArray = React.Children.toArray(children);
  const currentIndex = childrenArray.length - 1;

  // Animated value starting with currentIndex
  const [currentIndexValue] = React.useState(
    () => new Animated.Value(currentIndex)
  );

  // And updates to currentIndex whenever it changes
  React.useEffect(() => {
    Animated.timing(currentIndexValue, {
      toValue: currentIndex,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentIndexValue, currentIndex]);

  // ...
};
```

We can use the `currentIndexValue.interpolate` to move the card down when the current index is less than the index, and not move the card when it is greater or equal to the index.

Remember when a new child is first mounted, `currentIndexValue` will less than the index, then will animate up to the index, causing the new child to animate from the bottom to the normal position.

```jsx
const createCardStyle = (numChildrenValue, index) => {
  const translateY = numChildrenValue.interpolate({
    inputRange: [index - 1, index],
    outputRange: [height, 0],
    extrapolate: "clamp",
  });

  return [styles.card, { transform: [{ translateY }] }];
};

const Example = ({ children }) => {
  // ...

  const renderChild = (child, index) => {
    return (
      <Animated.View
        key={index}
        style={createCardStyle(numChildrenValue, index)}
      >
        {child}
      </Animated.View>
    );
  };

  return <View style={styles.container}>{childrenArray.map(renderChild)}</View>;
};
```

This code can be extended too for cards that are hidden by other cards by adding to the `inputRange` and `outputRange`. Since this is a matter of design (and it's usually quite maths-y), I'll leave this out.

## Animating Cards Out

The above code _almost_ works when removing children too. They would animate downwards if they weren't removed before you see the animation.

We need to delay removing the child (or children) from the React tree until the animation has completed.

We can do this with React state by storing a reference to the children at every render. Then if the children we stored from the last render is longer than the children we just got, we can take copy the removed children. We can then display them along side the existing children. Then once the animation has completed, we discard our copy of the removed children.

Here, I've called the removed-but-still-visible children _phantom children_.

Note you'll need to do all `setState` calls here in the render function &mdash; and **not** in `useEffect` or `useLayoutEffect` &mdash; otherwise there'll be a few frames where the phantom children disappear then reappear!

```jsx
const Example = ({ children }) => {
  // ...

  const [phantomChildState, setPhantomChildState] = React.useState({
    lastChildren: children,
    phantomChildren: null,
  });

  const lastChildrenArray = React.Children.toArray(phantomChildState);
  if (lastChildrenArray.length > childrenArray.length) {
    // Save phantom children to keep them on screen longer
    setPhantomChildState({
      lastChildren: children,
      phantomChildren: lastChildrenArray.slice(childrenArray.length),
    });
  } else if (phantomChildState.lastChildren !== children) {
    // Be careful to not cause infinite loops here!
    setPhantomChildState({
      lastChildren: children,
      phantomChildren: null,
    });
  }

  React.useEffect(() => {
    Animated.timing(currentIndexValue, {
      toValue: currentIndex,
      duration: 500,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        // Remove the phantom children after the animation completes
        setPhantomChildState((state) => ({
          lastChildren: state.lastChildren,
          phantomChildren: null,
        }));
      }
    });
  }, [currentIndexValue, currentIndex]);

  const renderedChildren =
    phantomChildState.phantomChildren != null
      ? [...childrenArray, ...phantomChildState.phantomChildren]
      : childrenArray;

  return (
    <View style={styles.container}>{renderedChildren.map(renderChild)}</View>
  );
};
```

## Animating Changing the Top Card

There is one more case &mdash; where the top card changes from one child to another. There's multiple things you could do to animate this, but the easiest is to use a `LayoutAnimation`.

We can add a `topChildChanged` property to `phantomChildState`. Technically this is mutually exclusive with `phantomChildren`, and you may wish to refactor this to make that clearer.

```jsx
const Example = ({ children }) => {
  // ...

  const [phantomChildState, setPhantomChildState] = React.useState({
    lastChildren: children,
    phantomChildren: null,
    topChildChanged: false,
  });

  const lastChildrenArray = React.Children.toArray(phantomChildState);
  if (lastChildrenArray.length > childrenArray.length) {
    setPhantomChildState({
      lastChildren: children,
      phantomChildren: lastChildrenArray.slice(childrenArray.length),
      topChildChanged: false,
    });
  } else if (
    lastChildrenArray.length === childrenArray.length &&
    lastChildrenArray[numChildren - 1] !== childrenArray[numChildren - 1]
  ) {
    setPhantomChildState({
      lastChildren: children,
      phantomChildren: null,
      topChildChanged: true,
    });
  } else if (phantomChildState.lastChildren !== children) {
    setPhantomChildState({
      lastChildren: children,
      phantomChildren: null,
      topChildChanged: false,
    });
  }

  React.useLayoutEffect(() => {
    if (phantomChildState.topChildChanged) {
      const fade = LayoutAnimation.create(500, "easeInEaseOut", "opacity");
      LayoutAnimation.configureNext(fade);
    }
  }, [phantomChildState.topChildChanged]);

  // ...
};
```

## Final Code

I didn't detail how you can combine this card stack with the interactive gestures &mdash; but hopefully if you made it this far, you'll have a few ideas!

You can find all the code from this and the last blog post over on &mdash; and what is actually implemented in TechniCalc &mdash; over on [GitHub Gists](https://gist.github.com/jacobp100/d7b219d225fafe0b2a0d7c3859eadb69).
