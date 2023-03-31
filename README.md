# Axios Request Builder

A ~100-lines module to build [Axios](https://github.com/axios/axios) requests using chainable "magic" properties.

```js
import axios from "axios";
import RequestBuilder from "axios-request-builder";

// Create an Axios instance with some default config
const client = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com/",
});

// Create a builder
const api = new RequestBuilder(client);

// 1. A simple GET request
// GET /users/1/todos?completed=true
api.users.$(1).todos
  .get({
    completed: true,
  })
  .then(({ data }) => {
    console.log(data);
  });

// 2. Every next property returns a new Builder
const users = api.users;
const firstUser = users.$(1);
// GET /users
users.get();
// PATCH /users/1
firstUser.patch({ name: "Sammy" });

// 3. Every endpoint can have a different config
const allTodos = api.todos;
const completedTodos = api.todos.config({
  params: {
    completed: true,
  },
});
// GET /todos
allTodos.get();
// GET /todos?completed=true
completedTodos.get();
```

## Installing

Install the package:

```
$ npm i axios-request-builder
```

Import Axios and the builder:

```js
import axios from "axios";
import RequestBuilder from "axios-request-builder";
```

Create an Axios instance and pass to the RequestBuilder constructor:

```js
const client = axios.create({
  baseURL: "https://api.example.com",
});

const req = new RequestBuilder(client);
```

## Building requests

Build a request URL using chainable properties:

```js
// GET /this/is/magic
req.this.is.magic.get();
```

You can parameterize the URL with a special method `$`:

```js
const userId = 10;
// GET /users/10/todos
req.users.$(userId).todos.get();
```

Send the request with method aliases:

```
req.get([params])
```

```
req.post(data[, params])
```

```
req.put(data[, params])
```

```
req.patch(data[, params])
```

```
req.delete([params])
```

Behind the scenes the builder calls the corresponding Axios method aliases and returns the resulting Promise which will resolve with [the Axios response object](https://github.com/axios/axios#response-schema) or reject with [an error](https://github.com/axios/axios#handling-errors).

```js
req.users.
  .get()
  .then(({ data, status }) => {
    // Handle response
  })
  .catch((error) => {
    // Handle errors
  });

// OR

try {
  const { data, status } = await req.users.get();
  // Handle response
}
catch (error) {
  // Handle errors
}
```

## Request Config

You can add an individual [Axios request config](https://github.com/axios/axios#request-config) to every request:

```js
const posts = req.posts.config({
  params: { limit: 10 }
});
// GET /posts?limit=10
posts.get();
```

You can call `config()` multiple times on the same request instance to extend or change the config.

Configs get inherited:

```js
// GET /posts/archive?limit=10
posts.archive.get()
```

But can be overridden:

```js
// GET /posts/archive?limit=15
posts.archive.get({ limit: 15 })

// OR

const archive = posts.archive.config({
  params: { limit: 15 }
})
// GET /posts/archive?limit=15
archive.get()
```

When request is dispatched its config is merged with the default config of the provided Axios instance.

There are several config shortcuts for the most commonly used options:

**headers()**

```js
req.headers({
  'X-Custom-Header': 'foobar'
});
// is the same as
req.config(
  headers: {
    'X-Custom-Header': 'foobar'
  }
);
```

**params()**

```js
req.params({
  'foo': 'bar'
});
// is the same as
req.config(
  params: {
    'foo': 'bar'
  }
);
```

**transform()**

```js
req.transform(function (data, headers) {
  return data;
});
// is the same as
req.config(
  transformResponse: [function (data, headers) {
    return data; 
  }]
);
```

**signal()**

```js
const controller = new AbortController();

req.signal(controller.signal);
// is the same as
req.config(
  signal: controller.signal
);
```

## Abort Controller

The builder has a helper method `createSignal()` for creating abort controllers:

```js
const post = req.posts.$(1);
// Create an abort controller and set the signal in one line
const controller = post.createSignal();

// Dispatch the request
post.get();
// And abort it
controller.abort();
```