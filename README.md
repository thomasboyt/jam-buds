# rhiannon

This repo is an experiment in using Kotlin to build a new backend for [Jam Buds](https://github.com/thomasboyt/jam-buds).

If you're reading this with no context, you may want to scroll down to the "Why" section below before reading about what I'm building.

## Outline

My plan for this experiment is to reimplement the parts of Jam Buds I feel the worst about first, to see if I like them more in Kotlin. So far, this means feed querying:

* [x] Query the public feed
* [ ] Query a specific user's feed
* [ ] Query a specific user's posts

As part of this, I want to rewrite the unit tests. I will come up with specific scenarios in a separate list, but here's a rough outline of the plan:

* [x] Create new test database with schema copied from Jam Buds
* [x] Create SQL database seeds with easy-to-use data (maybe do factories as a stretch goal, just to see what that looks like)
* [x] Tests for pagination
* [ ] Tests for pulling the correct mixtapes & songs

I also want to figure out, uh, how the hell to deploy this thing. This will entail:

* [x] Building a self-contained app for distribution in Docker
* [x] Creating a docker image
* [x] Running the docker image locally to confirm it works
* [ ] Deploying the image to my docker box against the production Jam Buds DB to see if it works well and how the performance is
* [ ] Hook up Sentry for monitoring (can test locally)

### Questions I have

* [ ] What's a good way of creating test data inside an app that isn't using an ORM? Should I create factories, or rely on SQL scripts/seeds?

## Architecture

This project is a Kotlin app that uses Jetbrains's [Ktor](https://ktor.io/) framework. The Ktor documentation fails to describe how to build anything with any kind of actual scale, so I more or less copied the current project structure from various sources.

One notable difference with those sources: While usually I associate JVM apps with having folders nested about seven levels deep with a bunch of bullshit (and how excited I was to be able to have a path that started with `src/club/jambuds`), apparently in pure-Kotlin projects you're able to have everything in the top level, which is actually really neat. This may all break at some point in the future, considering I don't really know how classpath works when you bundle an app for deployment, but I hope it's okay!

I've imported the Jam Buds schema and I've created an isolated database for tests using [Flyway](https://flywaydb.org/). It took me forever to get up and running (turns out there are very specific file naming rules for migrations, who knew?). It runs before every test, clearing the DB - theoretically I've figured out a way to wrap tests in transactions to not require this recreation, but I need to figure out how to run the migrations once before starting the tests before disabling that. 

_(todo...)_

## Why?

### My problems with TypeScript

Jam Buds's backend is currently a TypeScript app, using Express and Knex as its web framework and query builder. Neither of these libraries were written with TypeScript in mind, and are rather challenging to type in a meaningful way. They also don't provide a good binding of _runtime type validation_ to _static typing_ - that is, it is not easy to define a concrete data type (e.g. a class) in TypeScript that, when deserialized from some I/O (such as an incoming form body or database result), is _guaranteed_ at runtime to have the type you've defined on it.

This is a fundamental limitation of TypeScript's goal of being an "erased types" system, that is, one that turns into JavaScript. There are only a few real ways to get around it:

* You can use a runtime validation library for JS, and manually create a static type for the output that matches your runtime validation definition. In addition to being verbose, this is also fraught with peril, as you can easily make a mistake that causes things to not match up.

* You can use a TypeScript-first validation library like [io-ts](https://github.com/gcanti/io-ts). I'm always incredibly impressed by the feats of type engineering that go into these things, but at the end of the day find them rather difficult to integrate into real-world usage without coming up with a lot of your own abstractions to wrap them.

This _really_ came to a head with database access, which, in the Jam Buds API, is a mess of different functions using Knex to output various objects. I think it's gotten really messy and difficult to reason about. I've tried finding ORMs, but found them generally way too heavy-weight for my needs. The closest-to-usable wrapper I've found is [typed-knex](https://github.com/wwwouter/typed-knex), which is another incredibly impressive feat of engineering, but it's feature-incomplete (due to being used primarily by its author, who, I assume, is focused mainly on their own needs, and that's fine!).

I started realizing what I really wanted wasn't just static types. What I really need is nice runtime validation of my inputs and outputs: something that will let me run a SQL query, cast the output row into a typed object, throw an error if it doesn't match the expected types of the object, and if it succeeds, will cast the object to its static type.

### Why Kotlin?

The back-end developers at my employer use Kotlin, and thus I already had IntelliJ installed on this computer, which is about half of the work of spinning up a new JVM project, so why not?

More seriously: I did a quick hunt for "static-typed backend languages," and came up pretty empty. The hot new thing is microservices and serverless, and the runtime characteristics of those have led people to shun JVM languages, so I figured I'd be able to find some options.

The main one I saw was Go which is, against all odds, a very popular web language. I respect that people manage to get stuff done with it, but I found it very difficult to work with, especailly for the context of web programming. With the lack of higher-order functions and generics, the most basic data processing required of all CRUD apps felt like it required a lot more `for` loops and copy-pasted per-type logic than I wanted. I also found very little coherent documentation on structuring web services (shoutout to the [legacy version of Fathom](https://github.com/usefathom/fathom) for being the only real-world open source Go web app I could find).

_(todo...)_