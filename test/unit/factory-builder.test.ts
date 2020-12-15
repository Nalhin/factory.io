import { FactoryBuilder } from '../../src';
import { PartialUser, User } from '../fixtures/user';
import * as faker from 'faker';
import { Post } from '../fixtures/post';

describe('FactoryBuilder', () => {
  describe('ctor', () => {
    it('should pass arguments to constructor', () => {
      const userFactory = FactoryBuilder.of(User).ctor<typeof User>(['3', 'username', 'password', 18]).build();

      const result = userFactory.buildOne();

      expect(result.id).toBe('3');
      expect(result.username).toBe('username');
      expect(result.password).toBe('password');
      expect(result.age).toBe(18);
    });

    it('should resolve arguments provided as function', () => {
      const userFactory = FactoryBuilder.of(User).ctor<typeof User>(() => ['3', 'username', 'password', 18]).build();

      const result = userFactory.buildOne();

      expect(result.id).toBe('3');
      expect(result.username).toBe('username');
      expect(result.password).toBe('password');
      expect(result.age).toBe(18);
    });
  });


  describe('prop', () => {
    it('should add property given as function', () => {
      const password = faker.internet.password();
      const userFactory = FactoryBuilder.of(User)
        .prop('password', () => password)
        .build();

      const result = userFactory.buildOne();

      expect(result.password).toBe(password);
    });

    it('should add property given as object/primitive', () => {
      const password = faker.internet.password();
      const userFactory = FactoryBuilder.of(User).prop('password', password).build();

      const result = userFactory.buildOne();

      expect(result.password).toBe(password);
    });

    it('should add properties in correct order', () => {
      const password = faker.internet.password();
      const userFactory = FactoryBuilder.of(User)
        .prop('password', faker.internet.password())
        .prop('password', faker.internet.password())
        .prop('password', password)
        .build();

      const result = userFactory.buildOne();

      expect(result.password).toBe(password);
    });
  });

  describe('props', () => {
    it('should add multiple properties to an object', () => {
      const expected = {
        password: faker.internet.password(),
        username: faker.internet.userName(),
        age: faker.random.number(),
        email: faker.internet.email(),
        birthDay: faker.date.recent(),
        id: faker.random.uuid(),
      };
      const userFactory = FactoryBuilder.of(User).props(expected).build();

      const result = userFactory.buildOne();

      expect(expected).toEqual(result);
    });

    it('should add multiple properties to an object', () => {
      const expected = {
        password: faker.internet.password(),
        username: faker.internet.userName(),
        id: faker.random.uuid(),
      };
      const userFactory = FactoryBuilder.of(User)
        .props({
          password: expected.password,
          username: faker.internet.userName,
        })
        .props({
          username: expected.username,
          id: expected.id,
        })
        .build();

      const result = userFactory.buildOne();

      expect(expected).toEqual(result);
    });

    it('should allow to assign properties as functions', () => {
      const expectedAge = faker.random.number();
      const userFactory = FactoryBuilder.of(User).prop('age', expectedAge).build();

      const result = userFactory.buildOne();

      expect(result.age).toBe(expectedAge);
    });

    it('should allow to assign properties as objects/primitives', () => {
      const expectedAge = faker.random.number();
      const userFactory = FactoryBuilder.of(User).prop('age', expectedAge).build();
      const postFactory = FactoryBuilder.of(Post)
        .props({
          likedBy: () => userFactory.buildMany(4),
          author: () => userFactory.buildOne(),
        })
        .build();

      const result = postFactory.buildOne();

      expect(result.author.age).toBe(expectedAge);
      expect(result.likedBy[3].age).toBe(expectedAge);
    });

    it('should resolve recursive props', () => {
      const username = faker.random.word();

      const userFactory = FactoryBuilder.of(User)
        .props({
          username: 'dd',
          friend: {
            username,
            age: faker.random.number,
            friend: {
              username,
              age: faker.random.number,
            },
          },
        })
        .build();

      const result = userFactory.buildOne();

      expect(result.friend?.friend?.username).toBe(username);
      expect(typeof result.friend?.friend?.age).toBe('number');
    });

    it('should not override mixin fields (if nested)', () => {
      const expectedUsername = faker.random.word();
      const expectedAge = faker.random.number();
      const partialUserMixin = FactoryBuilder.of(PartialUser)
        .props({
          username: faker.random.word,
          friend: {
            username: expectedUsername,
            age: faker.random.number,
          },
        })
        .build();
      const userMixin = FactoryBuilder.of(User)
        .props({
          friend: {
            age: expectedAge,
          },
        })
        .mixins([partialUserMixin])
        .build();

      const result = userMixin.buildOne();

      expect(result.friend?.username).toBe(expectedUsername);
      expect(result.friend?.age).toBe(expectedAge);
    });
  });

  describe('computed', () => {
    it('should add computed to an object', () => {
      const age = 18;
      const userFactory = FactoryBuilder.of(User)
        .props({
          age,
        })
        .computed({
          monthsAlive: (entity) => entity.age * 12,
        })
        .build();

      const result = userFactory.buildOne();

      expect(result.monthsAlive).toBe(age * 12);
    });

    it('should add multiple computed to an object', () => {
      const properties = {
        age: faker.random.number(),
        username: faker.internet.userName(),
      };
      const expected = {
        ...properties,
        monthsAlive: properties.age * 12,
        password: properties.age * 12 + properties.username,
      };
      const userFactory = FactoryBuilder.of(User)
        .props(properties)
        .computed({
          monthsAlive: (entity) => entity.age * 12,
        })
        .computed({
          password: (entity) => entity.monthsAlive + entity.username,
        })
        .build();

      const result = userFactory.buildOne();

      expect(result).toEqual(expected);
    });

    it('should resolve recursive computed', () => {
      const username = faker.random.word();

      const userFactory = FactoryBuilder.of(User)
        .props({
          username: username,
          friend: {
            username,
            age: faker.random.number,
          },
        })
        .computed({
          friend: {
            friend: {
              username: entity => entity.username,
            },
          },
        })
        .build();

      const result = userFactory.buildOne();

      expect(result.friend?.username).toBe(username);
      expect(result.friend?.friend?.username).toBe(username);
    });
  });

  describe('mixins', () => {
    it('should allow to extend factory with preexisting one', () => {
      const expectedAge = faker.random.number();
      const properties = {
        age: faker.random.number(),
        username: faker.internet.userName(),
      };
      const mixinUserFactory = FactoryBuilder.of(User).props(properties).build();
      const userFactory = FactoryBuilder.of(User)
        .props({ age: expectedAge })
        .mixins([mixinUserFactory])
        .build();

      const result = userFactory.buildOne();

      expect(result.age).toBe(expectedAge);
      expect(result.username).toBe(properties.username);
    });
    it('should resolve multiple mixins in correct order', () => {
      const expectedUsername = faker.internet.userName();
      const mixinPartialUserFactory = FactoryBuilder.of(PartialUser)
        .computed({
          username: () => faker.internet.userName(),
        })
        .build();
      const mixinUserFactory = FactoryBuilder.of(User)
        .props({ username: expectedUsername })
        .build();
      const userFactory = FactoryBuilder.of(User)
        .mixins([mixinPartialUserFactory, mixinUserFactory])
        .build();

      const result = userFactory.buildOne();

      expect(result.username).toBe(expectedUsername);
    });
  });
});
