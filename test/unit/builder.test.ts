import faker from 'faker';
import { Factory } from '../../src';
import { User } from '../fixtures/user';
import { Post } from '../fixtures/post';

describe('builder', () => {
  describe('build', () => {
    it('should override mixin properties correctly', () => {
      const expectedAge = faker.random.number();
      const mixinUserFactory = new Factory(User)
        .props({
          age: faker.random.number,
          username: faker.internet.userName,
        })
        .done();

      const userFactory = new Factory(User)
        .props({
          age: expectedAge,
        })
        .mixins([mixinUserFactory])
        .done();

      const result = userFactory.buildOne();

      expect(result.age).toBe(expectedAge);
    });

    it('should allow to assign properties as functions', () => {
      const expectedAge = faker.random.number();
      const userFactory = new Factory(User).prop('age', expectedAge).done();

      const result = userFactory.buildOne();

      expect(result.age).toBe(expectedAge);
    });

    it('should allow to assign properties as objects/primitives', () => {
      const expectedAge = faker.random.number();
      const userFactory = new Factory(User).prop('age', expectedAge).done();
      const postFactory = new Factory(Post)
        .props({
          likedBy: () => userFactory.buildMany(4),
          author: () => userFactory.buildOne(),
        })
        .done();

      const result = postFactory.buildOne();

      expect(result.author.age).toBe(expectedAge);
      expect(result.likedBy[3].age).toBe(expectedAge);
    });

    it('should assign object properties in correct order', () => {
      const age = faker.random.number();
      const userFactory = new Factory(User)
        .computed({
          age: (e) => e.age * 2,
        })
        .props({
          age,
        })
        .done();

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

      const userFactory = new Factory<IUser>().props(properties).done();

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
      const userFactory = new Factory(User)
        .props({
          id: faker.random.uuid(),
          username: faker.internet.userName,
        })
        .done();

      const result = userFactory.buildOne(properties);

      expect(result).toEqual(properties);
    });
  });

  describe('buildMany', () => {
    it('should build multiple objects', () => {
      const count = 5;
      const userFactory = new Factory(User).done();

      const result = userFactory.buildMany(count);

      expect(result.length).toBe(count);
    });
    it('should create objects with different properties, if properties are passed as functions', () => {
      const userFactory = new Factory(User)
        .props({
          username: faker.internet.userName,
        })
        .done();

      const result = userFactory.buildMany(2);

      expect(result[0].username).not.toBe(result[1].username);
    });
    it('should create objects with similar properties, if properties are passed as primitives', () => {
      const userFactory = new Factory(User)
        .props({
          username: faker.internet.userName(),
        })
        .done();
      const result = userFactory.buildMany(2);

      expect(result[0].username).toBe(result[1].username);
    });
  });

  describe('resetId', () => {
    it('should reset object enumeration', () => {
      const defaultIdValue = 1;
      const userFactory = new Factory(User)
        .options({ idField: 'id', defaultIdValue })
        .done();
      userFactory.buildMany(5);

      userFactory.resetId();
      const result = userFactory.buildOne();

      expect(result.id).toBe(defaultIdValue);
    });
  });
});
