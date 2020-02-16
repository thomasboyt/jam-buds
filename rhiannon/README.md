# rhiannon

Rhiannon is the new backend for Jam Buds, built on Kotlin and the JVM. If you're reading this with no context, you may want to scroll down to the "Why" section first.

## Architecture

This project is a Kotlin app that uses [Javalin](https://javalin.io/), a small web framework for Java and Kotlin built on [Jetty](https://www.eclipse.org/jetty/). I originally started out using [Ktor](https://ktor.io/), but wasn't happy with its APIs and immaturity. Javalin seems to have the batteries I'm looking for, like parameter validation. Notably, it doesn't have coroutines, but does support [completable features](https://javalin.io/documentation#faq). In a world where most Java libraries aren't async, but generally _are_ thread-safe, this seems like an okay tradeoff.

I've imported the Jam Buds schema and I've created an isolated database for tests using [Flyway](https://flywaydb.org/). It took me forever to get up and running (turns out there are very specific file naming rules for migrations, who knew?). It runs before every test file, clearing the DB.

I'm currently building things with fairly standard "route handlers/business logic/data access" layers. The data layer is just [JDBI](https://jdbi.org/) DAOs, while the logic and handler layers are plain classes that have their dependencies ~~injected~~ passed to them at app startup time. Different dependencies are wired up for tests and for the real app, which makes it easy to wrap DAOs in a transaction and, eventually, stub out external clients. All tests right now just use the HTTP API directly, since it requires less boilerplate than testing both the service layer and the routes layer directly.

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