[![Test](https://github.com/Nalhin/factory.io/workflows/Test/badge.svg)](https://github.com/Nalhin/factory.io/actions)
[![Codecov](https://codecov.io/gh/Nalhin/factory.io/branch/master/graph/badge.svg)](https://codecov.io/gh/Nalhin/factory.io)
[![License](https://img.shields.io/github/license/Nalhin/factory.io)](https://github.com/Nalhin/factory.io/blob/master/LICENSE.md)
[![Downloads](https://img.shields.io/npm/dm/factory.io)](https://www.npmjs.com/package/factory.io)
[![Version](https://img.shields.io/npm/v/factory.io)](https://www.npmjs.com/package/factory.io)

# factory.io

A modern class-based mock data generation with typescript support. It integrates exceptionally well with ORM libraries such
as TypeORM.

## Table of contents

- [Usage](#usage)
- [Props](#props)
- [Computed](#computed)
- [Mixins](#mixins)
- [Options](#options)
- [Factory.build()](#factory.build())
- [Builder](#builder)
- [Examples](#examples)
- [TypeORM integration](#typeorm-integration)
- [License](#license)

## Usage

Factories can be constructed with the following (chaining) methods.

- props or prop (properties to be assigned)
- computed (values calculated based on props or default object properties)
- mixins (factories for partial of provided class)
- done (returns class builder)

**Things to remember**

- Methods can be called in any order - execution order is predefined
- Execution order:
  - constructor
  - removeUnassignedProperties (if set in options)
  - mixins
  - props
  - computed
  - partial
- Relations between objects can be assigned with computed method.

### Props

Props should be provided as values, functions or nested objects consisting of values and functions.

- Plain values are always the same.
- Functions are recalculated each time an object is build.

```ts
const userFactory = FactoryBuilder.of(User)
  .props({
    age: faker.random.number,
    username: faker.internet.userName,
    friend: {
      username: faker.internet.userName,
    },
  })
  .build();

const user = userFactory.buildOne();
```

### Computed

Computed properties should be provided as functions or nested objects. They can reference the main object (and objects
it references) after mixins and props are assigned.

```ts
const userFactory = FactoryBuilder.of(User)
  .computed({
    age: (e) => e.age * 2,
  })
  .props({
    age,
  })
  .build();

const user = userFactory.buildOne();
```

### Mixins

Use mixins in order to extend previously constructed factories. Remember that mixins are resolved in **provided order**
and **before** props and computed of factory currently being extended.

```ts
const mixinUserFactory = FactoryBuilder.of(User)
  .props({
    age: faker.random.number,
    username: faker.internet.userName,
  })
  .build();

const userFactory = FactoryBuilder.of(User)
  .props({
    /*
      Mixin age value is overridden
    */
    age: faker.random.number,
  })
  .mixins([mixinUserFactory])
  .build();

const result = userFactory.buildOne();
```

### Options

- sequenceField - Object property to which sequence value should be assigned
- sequenceTransformer - Custom function responsible for sequence assignment (allows to modify the value pre-assignment) 
- removeUnassignedProperties - Whether undefined properties should be removed (as constructor is passed with no
  arguments, fields without default values are assigned undefined)
- defaultSequenceValue - Initial sequence value, incremented by one each time an object is build

### Factory.build()

`build()` method transforms FactoryBuilder into Factory. This process cannot be reversed. Factories **cannot**
be assigned new properties.

### Builder

Builder object has the following methods

- buildOne
- buildMany
- resetSequence

## Examples

### Classes

```ts
const userFactory = FactoryBuilder.of(User)
  .props({
    age: faker.random.number,
    username: faker.internet.userName,
  })
  .build();

const result = userFactory.buildOne({ id: 1 });
```

```ts
const userFactory = FactoryBuilder.of(User)
  .props({
    age: faker.random.number,
    username: faker.internet.userName,
  })
  .build();

const result = userFactory.buildOne({ id: 1 });
```

### Interfaces

```ts
const userFactory = FactoryBuilder<IUser>.of()
  .props({ age: faker.random.number, username: faker.internet.userName })
  .computed({
    monthsAlive: (user) => user.age * 12,
  })
  .build();

const result = userFactory.buildMany(4);
```

```ts
const userFactory = FactoryBuilder<IUser>.of()
  .props({ age: faker.random.number, username: faker.internet.userName })
  .build();

const result = userFactory.buildMany(5);
```

### TypeORM integration

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
export const userFactory = FactoryBuilder.of(User)
  .options({ sequenceField: 'id' })
  .props({
    email: faker.internet.email,
    password: faker.internet.password,
  })
  .build();
```

#### Utils

```ts
async function saveOne(current: any) {
  try {
    const repository = getConnection().getRepository(current.constructor.name);
    return await repository.save(current);
  } catch (e) {
    console.log(e);
  }
}
```

#### Usage

```ts
it('should save data to db', async () => {
  const user = await saveOne(userFactory.buildOne());

  const result = await getConnection()
    .getRepository(user.constructor.name)
    .findOne({ id: user.id });

  expect(result).toEqual(user);
});
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
