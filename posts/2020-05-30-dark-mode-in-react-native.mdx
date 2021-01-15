---
title: Dark Mode in React Native
layout: page
css: blog,blog-highlight
---

# Dark Mode in React Native

Half way through 2019, both Android and iOS announced they would be getting dark mode in their next major updates &mdash; and in September of that year, those updates were released. You'll need to be on at least iOS 13, or Android 10 &mdash; although some Android 9 phones seem to support dark mode anyway.

From the design perspective, it is a much more complicated than just making the text white and the background black. To complicate it further, the individual platform guidelines for dark mode differ. For example, iOS will slightly tweak accent colours very slightly in dark mode, where Android will recommend using different accent colours, and using them in different places too. iOS also has a set of elevated colours that are different to the base colours in dark mode, and identical to the base colours in light mode. However, you don't have to follow the guidelines to the letter &mdash; especially if your app is heavily branded. They are worth a read for ideas nevertheless.

- [Apple dark mode guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/dark-mode/)
- [Android dark mode guidelines](https://material.io/design/color/dark-theme.html#states)
- [Not guidelines but in fact a very handy blog post](https://uxdesign.cc/turn-the-lights-off-designing-the-dark-mode-of-wego-ios-app-6c4967e59dd6)

But I'm not here to tell you how to design for dark mode &mdash; I'm here to tell you how to implement it in React Native.

> First, you need to be using at least React Native 0.62.

## useColorScheme()

This is a hook that'll give you the string `"light"` or `"dark"`.

Because it's a hook, it doesn't work inside `StyleSheet.create`, so you'll likely need to define duplicates of styles for light/dark mode, or add the colours inline in the style prop.

```jsx
import { useColorScheme } from "react-native";

const styles = StyleSheet.create({
  titleLight: {
    color: "black",
  },
  titleDark: {
    color: "white",
  },
});

const Example = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Text style={isDark ? styles.titleDark : styles.titleLight}>
      Some text...
    </Text>
  );
};
```

It might be tempting to make abstractions to make this a bit more palatable, but hold back! This situation is going to get better.

## PlatformColor and DynamicColorIOS

Not only has Microsoft been busy at work getting React Native to work on [Windows](https://microsoft.github.io/react-native-windows/) and [macOS](https://github.com/microsoft/react-native-macos), they've also been busy at work making React Native better for Android and iOS. A few months ago they opened an extensive PR to add dynamic colours directly into React Native itself to make dark mode more ergonomic to support.

> Starting in React Native 0.63, you'll be able to define dynamic colours directly in a StyleSheet body

Note &mdash; I don't work for Microsoft or anything, it's just incredible to see the positive impact they're having.

`DynamicColorIOS` is the easiest to explain &mdash; and use. It takes an object with keys `light` and `dark`, and values of the regular colour strings you're already used to.

```jsx
import { DynamicColorIOS } from "react-native";

const styles = StyleSheet.create({
  title: {
    color: DynamicColorIOS({
      light: "black",
      dark: "white",
    }),
  },
});

const Example = () => {
  // Look mum, no hooks!
  return <Text style={styles.title}>Some text...</Text>;
};
```

If you didn't guess from the name, this function only works on iOS. On Android, it'll actually crash &mdash; you'll need to make sure you don't call this function on there.

Next up is `PlatformColor`, which takes a string of a platform colour. On iOS, the platform colours are anything in [this list](https://noahgilmore.com/blog/dark-mode-uicolor-compatibility/) &mdash; scroll down to the tables at the bottom.

On Android, there technically is the ability to reference system colours, but they tend to be a bit of a mess and not too useful. However, **you can define your own platform colours on Android**.

First, copy the example below into `android/app/src/main/res/values/colors.xml`. You can add as many colours as you want, and you don't need to keep the ones I added. All values must be 6 or 8 digit hex values (8 digits for adding opacity).

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
  <color name="background">#FFFFFF</color>
  <color name="color">#212121</color>
</resources>
```

Next, make the copy the file into `android/app/src/main/res/values-night/colors.xml` &mdash; note the folder is now `values-night`. In this file, you keep the same names, but you change the hex values the values to your dark mode theme.

Now when you want to use them, you can use `PlatformColor` with the string `@color/`followed by the name of the colour you defined in your xml. For example, `PlatformColor("@color/background")`.

This will give you the same as `DynamicColorIOS`. You'll need to rebuild the app whenever you change the xml files.

## Ironing out Platform Differences

In most projects I work on, I have a style guide file that has all the brand colours, but for the one-off colours that are only used for a single component, I usually prefer to just put them in the file they're used. It makes it less likely you'll have unused colours lying around as your app progresses.

However, here I would recommend putting every single colour in a single file. This is because this file will need to be in sync with your xml files.

```jsx
import {
  PlatformColor,
  DynamicColorIOS as BaseDynamicColorIOS,
  Platform,
} from "react-native";

// Stops this crashing when called on other platforms
const DynamicColorIOS = Platform.select({
  ios: BaseDynamicColorIOS,
  default: () => null,
});

export const backgroundColor = Platform.select({
  ios: DynamicColorIOS({ light: "white", dark: "black" }),
  android: PlatformColor("@color/background"),
});
export const textColor = Platform.select(etc);
```

Now when you're making changes, you only need to look in this file, and the xml files in the `android` folder.

## Just a Note

When you can, you should always use the new way of colours over the hooks. They're much more performant, and you'll get nice animations on iOS when the theme changes.

However, it looks like on Android, you can't use these colours for border colours. You also don't seem to be able to use them in React Native SVG for the time being too. You'll probably experience a few snags over the next few weeks before they get ironed out.
