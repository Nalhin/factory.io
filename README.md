[![Test](https://github.com/Nalhin/factory.io/workflows/Test/badge.svg)](https://github.com/Nalhin/factory.io/actions)
[![Codecov](https://codecov.io/gh/Nalhin/factory.io/branch/master/graph/badge.svg)](https://codecov.io/gh/Nalhin/factory.io)
[![License](https://img.shields.io/github/license/Nalhin/factory.io)](https://github.com/Nalhin/factory.io/blob/master/LICENSE.md)
[![Downloads](https://img.shields.io/npm/dm/factory.io)](https://www.npmjs.com/package/factory.io)
[![Version](https://img.shields.io/npm/v/factory.io)](https://www.npmjs.com/package/factory.io)

# factory.io

Modern class based mock data generation with typescript support.
Integrates exceptionally well with Orm libraries like TypeORM.

## Table of contents

- [Usage](#usage)
- [Props](#props)
- [Computed](#computed)
- [Mixins](#mixins)
- [Options](#options)
- [Done](#done)
- [Builder](#builder)
- [Examples](#examples)
- [TypeORM integration](#typeorm-integration)
- [License](#license)

## Usage

Factory can be constructed with the following (chaining) methods.

- props or prop (properties to be assigned)
- computed (values calculated based on props or default object properties)
- mixins (factories for partial of provided class)
- done (returns class builder)

**Things to remember**

- Properties can be assigned in any order (assignment order does not matter).
- Execution order.
  - constructor
  - removeUnassigned (if set in options)
  - mixins
  - props
  - computed
  - partial
- Objects with recursive dependencies are not currently supported.
- Many to many relationships can be assigned via computed method.
- Methods defined on any other than the current class are stripped away.

### Props

Props should be provided as values or functions.

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

Use mixins in order to extend previously constructed factory.
Remember that mixins are resolved in a **given order and before** props and computed of factory currently being extended.

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
  .mixins([mixinUserFactory])
  .done();

const result = userFactory.buildOne();
```

### Options

- idField - Object property to which id should be assigned
- idTransformer - Custom function responsible for object id generation.
- removeUnassigned - Whether undefined properties should be removed (as constructor is passed with no arguments, fields without default values are assigned undefined)
- defaultIdValue - Initial id value, incremented by one in each time an object is build

### Done

`done()` method transforms class factory into class builder.
Class builders **cannot** be assigned new properties and this process cannot be reversed.

### Builder

Builder object has the following methods

- buildOne
- buildOneAsync
- buildMany
- buildManyAsync
- resetId

Async methods expect callback to be passed as the first argument.

## Examples

### Classes

```ts
const userFactory = new Factory(User)
  .props({
    age: faker.random.number,
    username: faker.internet.userName,
  })
  .done();

const result = userFactory.buildOne({ id: 1 });
```

```ts
const userFactory = new Factory(User)
  .props({
    age: faker.random.number,
    username: faker.internet.userName,
  })
  .done();

const result = userFactory.buildOne({ id: 1 });
```

### Interfaces

```ts
const userFactory = new Factory<IUser>()
  .props({ age: faker.random.number, username: faker.internet.userName })
  .computed({
    monthsAlive: (entity) => entity.age * 12,
  })
  .done();

const result = userFactory.buildMany(4);
```

```ts
const userFactory = new Factory<IUser>()
  .props({ age: faker.random.number, username: faker.internet.userName })
  .done();

const result = userFactory.buildMany(5);
```

### TypeORM integration

Factory.io integrates exceptionally with orm libraries.
Async methods (saveOneAsync, saveManyAsync) allow us to persist and retrieve entities in just one line!

#### Entity

```ts
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;
}
```

#### Factory

```ts
export const userFactory = new Factory(User)
  .options({ idField: 'id' })
  .props({
    email: faker.internet.email,
    password: faker.internet.password,
  })
  .done();
```

#### Utils

```ts
async function saveOne(entity: any) {
  try {
    const repository = getConnection().getRepository(entity.constructor.name);
    return await repository.save(entity);
  } catch (e) {
    console.log(e);
  }
}
```

#### Usage

```ts
it('should save data to db', async () => {
  const user = await userFactory.buildOneAsync(saveOne);

  const result = await getConnection()
    .getRepository(user.constructor.name)
    .findOne({ id: user.id });

  expect(result).toEqual(user);
});
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
