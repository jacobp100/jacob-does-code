---
title: Polymorphic Variants in ReasonML
layout: page
css: blog,blog-highlight
---

# Polymorphic Variants in ReasonML

Polymorphic variants are one of the more unique features of OCaml (or ReasonML if you prefer). These are actually one of the things that aren't documented ReasonML site, but they can be really useful nonetheless.

At their simplest, they work exactly the same as regular variants. The first difference is that these variants begin with a `` ` `` character. They can also be used without a type definition. Let's find the index of a pair of brackets in a list of characters.

```reasonml
let firstBracketPair = inputChars => {
  let rec iter = (currentState, chars, currentIndex) =>
    switch (currentState, chars) {
    | (`FoundBracket(startIndex), [')', ..._]) =>
      Some((startIndex, currentIndex))
    | (_, ['(', ...tail]) =>
      iter(`FoundBracket(currentIndex), tail, currentIndex + 1)
    | (_, [_, ...tail]) =>
      iter(currentState, tail, currentIndex + 1)
    | (_, []) =>
      None
    };
  iter(`NoBrackets, inputChars, 0);
};
```

In the above example, we could have defined a type just for the iteration state, but with polymorphic variants, we don't have to.

## Diving Deeper

Unlike when defining the types for regular variants, you can build polymorphic variants using other variants. Other than the backtick for each name, the types for polymorphic variants also need square brackets around them.

```reasonml
type primary = [ | `Red | `Green | `Blue];
type colorFunctions = [ | `Rgb(int, int, int) | `Hsl(int, int, int)];
/* Combiles both the variants primary and colorFunctions */
type colors = [ primary | colorFunctions];
```

Now that our types are a bit more complicated, you'll want to actually write the type definitions. You'll be able to compile without them, but when you do get errors &mdash; especially with large types &mdash; the error messages will be multiple pages on your terminal and won't help you at all.

The above example is a common way for articles to demonstrate polymorphic variants. But it's not a great example &mdash; this could be a regular variant type, and it might be better that way. So I'm going to give two examples of cases where polymorphic variants actually helped.

## Units of Measure

When converting between units &mdash; like meters to inches &mdash; it's normally just multiplying by something. However, Celsius and Fahrenheit do their own thing, and need to be handled differently.

For this example, we want to take a unit and a value, and convert it into standard units (_si_ units). I represent this with polymorphic variants, and have one function that handles all the ‘nice' values, and another function that handles the edge cases.

```reasonml
type length = [ | `Meter | `Inch];
type time = [ | `Second | `Minute | `Hour];
type temperatureLinear = [ | `Kelvin];
type temperatureNonLinear = [ | `Celsius];

type unitLinear = [ length | time | temperatureLinear];
type anyUnit = [ unitLinear | temperatureNonLinear];

let siScale = (unit: unitLinear) =>
  switch (unit) {
  | `Meter => 1.
  | `Inch => 0.0254
  | `Second => 1.
  | `Minute => 60.
  | `Hour => 3600.
  | `Kelvin => 1.
  };

let toSi = (value, unit: anyUnit) =>
  switch (unit) {
  | #unitLinear as linearUnit => value *. siScale(linearUnit)
  | `Celsius => value +. 273.15
  };
```

> Note: `#unitLinear` in the means match against all cases in the unitLinear type

With this setup, we can be much more granular about how we handle edge cases.

If we added another linear unit &mdash; like feet &mdash; to this, our compiler would enforce that it's in the `siScale` function. If we added Fahrenheit, it would make sure it was handled in the `toSi` function.

If we used regular variants, we could put all the units in one variant, but then we'd lose the ability to abstract things out like we did, and the type-checker would not be as helpful. Or we'd be able to keep the abstraction, but introducing more variants: we'd need one variant for all the linear units, one variant for temperature units, and one more to wrap it, like `LinearUnit(linearUnit) | TemperatureUnit(temperatureUnit)`. The user would then have to give units in this format. 🤮

## Mixing Scalars and Vectors

Say we have a numeric type that's more complicated than a float. Maybe it's an exact fraction, or a decimal. We can also have vectors built up of that type, and nan types. We want to build a maths library where you can add and subtract anything of these types. Polymorphic variants are also a good fit here!

```reasonml
type scalar = [ | `Fraction(int, int) | `Decimal(float)];
type value = [ scalar | `Vector(list(scalar)) | `NaN];

let addScalar = (a, b) =>
  switch (a, b) {
  | (`Fraction(n1, d1), `Fraction(n2, d2)) =>
    `Fraction((n1 * d2 + n2 * d1, d1 * d2))
  | (`Fraction(n, d), `Decimal(f))
  | (`Decimal(f), `Fraction(n, d)) =>
    `Decimal(f *. float_of_int(n) /. float_of_int(d))
  | (`Decimal(f1), `Decimal(f2)) =>
    `Decimal(f1 *. f2)
  };

let add = (a, b) =>
  switch (a, b) {
  | (#scalar as a, #scalar as b) => addScalar(a, b)
  | (`Vector(a), `Vector(b)) => `Vector(List.map2(addScalar))
  | _ => `NaN
  };
```

In the same manner as the previous examples, we _could_ use regular variants here, but it would be less nice for the same reasons.

## Performance

This power can come at a cost. Normally when you see performance warnings about polymorphic variants, it talks about the performance of switch statements and memory usage. Realistically, these aren't going to affect you.

However, there is something to be aware of if you're compiling to JavaScript **and you have a lot of polymorphic variants in one type**: when running `switch` over a polymorphic type, the code size is a lot larger than you'd expect.

If we take the units example, and add over a hundred units, every switch statement over the units was 2kb of JS minified &mdash; this adds up quickly! I changed this to a regular variant, and each switch statement went down to just over 100–200 bytes.

Again, this will only affect you if your types are huge, and will not affect you at all if your types aren't huge. If in doubt, read what BuckleScript outputs!

## Conclusion

Polymorphic variants are really cool and you should use them more!
