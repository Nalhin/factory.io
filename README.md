[![Test](https://github.com/Nalhin/factory.io/workflows/Test/badge.svg)](https://github.com/Nalhin/factory.io/actions)
[![Codecov](https://codecov.io/gh/Nalhin/factory.io/branch/master/graph/badge.svg)](https://codecov.io/gh/Nalhin/factory.io)

# factory.io

Typescript class based mock data generation made simple

## Usage

Factory can be constructed with the following (chaining) methods.

- props or prop
- computed (values calculated based on props or default object properties)
- mixins (factories for partial of provided class)

**Important**

- Properties can be assigned to factory in any order.
- Execution order.
  - constructor
  - ?removeUnassigned
  - mixins
  - props
  - computed
  - partial
- Objects with recursive dependencies are currently not supported.
- Methods defined on any other than the current class are stripped away.

### Props

Props should be provided as values or functions that return values.

- Plain values are always the same
- Functions are recalculated on every build

```ts
const userFactory = new Factory(User)
  .props({
    age: faker.random.number,
    username: faker.internet.userName,
  })
  .done();

const user = userFactory.buildOne();
```

### Computed

Computed properties should be provided as functions. They have access to the object after props are already assigned.

```ts
const userFactory = new Factory(User)
  .computed({
    age: (e) => e.age * 2,
  })
  .props({
    age,
  });

const user = userFactory.buildOne();
```

### Mixins

```ts
const mixinUserFactory = new Factory(User)
  .props({
    age: faker.random.number,
    username: faker.internet.userName,
  })
  .done();

const userFactory = new Factory(User)
  .props({
    /*
      Age value is overridden
    */
    age: faker.random.number,
  })
  .mixins(mixinUserFactory)
  .done();

const result = userFactory.buildOne;
```

### Done method

Done method transforms class factory into class builder.
Class builders **cannot** be assigned new properties.

## Examples

### Classes

#### One

```ts
const userFactory = new Factory(User)
  .props({
    age: faker.random.number,
    username: faker.internet.userName,
  })
  .done();

const result = userFactory.buildOne({ id: 1 });
```

#### Many

### Interfaces

#### One

```ts
const userFactory = new Factory<IUser>()
  .props({ age: faker.random.number, username: faker.internet.userName })
  .computed({
    monthsAlive: (entity) => entity.age * 12,
  })
  .done();

const result = userFactory.buildOne({ id: 1 });
```

#### Many

```ts
const userFactory = new Factory<IUser>()
  .props({ age: faker.random.number, username: faker.internet.userName })
  .done();

const result = userFactory.buildMany(5);
```
