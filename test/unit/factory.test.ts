import { Factory } from '../../src';
import { User } from '../fixtures/user';
import * as faker from 'faker';
import { Post } from '../fixtures/post';

describe('factory', () => {
  describe('addProperty', () => {
    it('should add property given as function', () => {
      const password = faker.internet.password();
      const userFactory = new Factory(User).addProperty(
        'password',
        () => password,
      );

      const result = userFactory.buildOne();

      expect(result.password).toBe(password);
    });

    it('should add property given as object/primitive', () => {
      const password = faker.internet.password();
      const userFactory = new Factory(User).addProperty('password', password);

      const result = userFactory.buildOne();

      expect(result.password).toBe(password);
    });

    it('should add properties in correct order', () => {
      const password = faker.internet.password();
      const userFactory = new Factory(User)
        .addProperty('password', faker.internet.password())
        .addProperty('password', faker.internet.password())
        .addProperty('password', password);

      const result = userFactory.buildOne();

      expect(result.password).toBe(password);
    });
  });

  describe('addProperties', () => {
    it('should add multiple properties to an object', () => {
      const expected = {
        password: faker.internet.password(),
        username: faker.internet.userName(),
        age: faker.random.number(),
        email: faker.internet.email(),
        birthDay: faker.date.recent(),
        id: faker.random.uuid(),
      };
      const userFactory = new Factory(User).addProperties(expected);

      const result = userFactory.buildOne();

      expect(expected).toEqual(result);
    });

    it('should add multiple properties to an object', () => {
      const expected = {
        password: faker.internet.password(),
        username: faker.internet.userName(),
        id: faker.random.uuid(),
      };
      const userFactory = new Factory(User)
        .addProperties({
          password: expected.password,
          username: faker.internet.userName,
        })
        .addProperties({
          username: expected.username,
          id: expected.id,
        });

      const result = userFactory.buildOne();

      expect(expected).toEqual(result);
    });
  });

  describe('addComputed', () => {
    it('should add computed to an object', () => {
      const age = 18;
      const userFactory = new Factory(User)
        .addProperties({
          age,
        })
        .addComputed({
          monthsAlive: (entity) => entity.age * 12,
        });

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
      const userFactory = new Factory(User)
        .addProperties(properties)
        .addComputed({
          monthsAlive: (entity) => entity.age * 12,
        })
        .addComputed({
          password: (entity) => entity.monthsAlive + entity.username,
        });

      const result = userFactory.buildOne();

      expect(result).toEqual(expected);
    });
  });

  describe('addMixin', () => {
    it('should allow to extend factory with preexisting one', () => {
      const expectedAge = faker.random.number();
      const properties = {
        age: faker.random.number(),
        username: faker.internet.userName(),
      };
      const mixinUserFactory = new Factory(User).addProperties(properties);
      const userFactory = new Factory(User)
        .addProperties({ age: expectedAge })
        .addMixins(mixinUserFactory);

      const result = userFactory.buildOne();

      expect(result.age).toBe(expectedAge);
      expect(result.username).toBe(properties.username);
    });
  });

  describe('build', () => {
    it('should override mixin properties correctly', () => {
      const expectedAge = faker.random.number();
      const mixinUserFactory = new Factory(User).addProperties({
        age: faker.random.number,
        username: faker.internet.userName,
      });
      const userFactory = new Factory(User)
        .addProperties({
          age: expectedAge,
        })
        .addMixins(mixinUserFactory);

      const result = userFactory.buildOne();

      expect(result.age).toBe(expectedAge);
    });

    it('should allow to assign properties as functions', () => {
      const expectedAge = faker.random.number();
      const userFactory = new Factory(User).addProperty('age', expectedAge);

      const result = userFactory.buildOne();

      expect(result.age).toBe(expectedAge);
    });

    it('should allow to assign properties as objects/primitives', () => {
      const expectedAge = faker.random.number();
      const userFactory = new Factory(User).addProperty('age', expectedAge);
      const postFactory = new Factory(Post).addProperties({
        likedBy: () => userFactory.buildMany(4),
        author: () => userFactory.buildOne(),
      });

      const result = postFactory.buildOne();

      expect(result.author.age).toBe(expectedAge);
      expect(result.likedBy[3].age).toBe(expectedAge);
    });

    it('should assign object properties in correct order', () => {
      const age = faker.random.number();
      const userFactory = new Factory(User)
        .addComputed({
          age: (e) => e.age * 2,
        })
        .addProperties({
          age,
        });

      const result = userFactory.buildOne();

      expect(result.age).toBe(age * 2);
    });

    it('should work with interfaces', () => {
      interface IUser {
        id: number;
        firstName: string;
      }
      const properties = {
        id: faker.random.number(),
        firstName: faker.name.findName(),
      };

      const userFactory = new Factory<IUser>().addProperties(properties);

      const result = userFactory.buildOne();

      expect(result).toEqual(properties);
    });
  });

  describe('buildOne', () => {
    it('should allow to override properties with preexisting object given as partial type', () => {
      const properties = {
        id: faker.random.uuid(),
        username: faker.internet.userName(),
      };
      const userFactory = new Factory(User).addProperties({
        id: faker.random.uuid(),
        username: faker.internet.userName,
      });

      const result = userFactory.buildOne(properties);

      expect(result).toEqual(properties);
    });
  });

  describe('buildOneAsync', () => {
    it('should fire callback after object creation with object as argument', async () => {
      const properties = {
        id: faker.random.uuid(),
        age: faker.random.number(),
        username: faker.internet.userName(),
      };
      const callback = jest.fn();
      const userFactory = new Factory(User).addProperties(properties);

      await userFactory.buildOneAsync(callback);

      expect(callback).toBeCalledTimes(1);
      expect(callback).toBeCalledWith(properties);
    });
  });

  describe('buildMany', () => {
    it('should build multiple objects', () => {
      const count = 5;
      const userFactory = new Factory(User);

      const result = userFactory.buildMany(count);

      expect(result.length).toBe(count);
    });
    it('should create objects with different properties, if properties are passed as functions', () => {
      const userFactory = new Factory(User);

      const result = userFactory
        .addProperties({ username: faker.internet.userName })
        .buildMany(2);

      expect(result[0].username).not.toBe(result[1].username);
    });
    it('should create objects with similar properties, if properties are passed as primitives', () => {
      const userFactory = new Factory(User);

      const result = userFactory
        .addProperties({ username: faker.internet.userName() })
        .buildMany(2);

      expect(result[0].username).toBe(result[1].username);
    });
  });

  describe('buildManyAsync', () => {
    it('should fire callback after object creation with objects as arguments', async () => {
      const properties = {
        id: faker.random.uuid(),
        age: faker.random.number(),
        username: faker.internet.userName(),
      };
      const callback = jest.fn();
      const count = 3;
      const userFactory = new Factory(User).addProperties(properties);

      await userFactory.buildManyAsync(callback, count);

      expect(callback).toBeCalledTimes(1);
      expect(callback).toBeCalledWith(properties, properties, properties);
    });
  });
});
