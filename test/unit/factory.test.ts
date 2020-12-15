import faker from 'faker';
import { FactoryBuilder } from '../../src';
import { User } from '../fixtures/user';

describe('Factory', () => {
  describe('build', () => {
    it('should override mixin properties correctly', () => {
      const expectedAge = faker.random.number();
      const mixinUserFactory = FactoryBuilder.of(User)
        .props({
          age: faker.random.number,
          username: faker.internet.userName,
        })
        .build();

      const userFactory = FactoryBuilder.of(User)
        .props({
          age: expectedAge,
        })
        .mixins([mixinUserFactory])
        .build();

      const result = userFactory.buildOne();

      expect(result.age).toBe(expectedAge);
    });

    it('should assign object properties in correct order', () => {
      const age = faker.random.number();
      const userFactory = FactoryBuilder.of(User)
        .computed({
          age: (e) => e.age * 2,
        })
        .props({
          age,
        })
        .build();

      const result = userFactory.buildOne();

      expect(result.age).toBe(age * 2);
    });

    it('should work with interfaces', () => {
      interface TestInterface {
        id: number;
        firstName: string;
      }

      const properties = {
        id: faker.random.number(),
        firstName: faker.name.findName(),
      };

      const userFactory = FactoryBuilder.of<TestInterface>().props(properties).build();

      const result = userFactory.buildOne();

      expect(result).toEqual(properties);
    });

    it('should preserve this binding', () => {
      const username = faker.internet.userName();
      const friendFactory = FactoryBuilder.of(User)
        .props({
          username,
          friend: {
            friend: {
              username,
            },
          },
        })
        .computed({
          friend: {
            friend: {
              username: (e) => e.username,
            },
          },
        })
        .build();
      const userFactory = FactoryBuilder.of(User)
        .props({
          friend: friendFactory.buildOne,
        })
        .build();

      const result = userFactory.buildOne();

      expect(result.friend?.username).toBe(username);
    });
  });

  describe('buildOne', () => {
    it('should allow to override properties with preexisting object given as partial type', () => {
      const properties = {
        id: faker.random.uuid(),
        username: faker.internet.userName(),
      };
      const userFactory = FactoryBuilder.of(User)
        .props({
          id: faker.random.uuid(),
          username: faker.internet.userName,
        })
        .build();

      const result = userFactory.buildOne(properties);

      expect(result).toEqual(properties);
    });
  });

  describe('buildMany', () => {
    it('should build multiple objects', () => {
      const count = 5;
      const userFactory = FactoryBuilder.of(User).build();

      const result = userFactory.buildMany(count);

      expect(result.length).toBe(count);
    });

    it('should create objects with different properties, if properties are passed as functions', () => {
      const userFactory = FactoryBuilder.of(User)
        .props({
          username: faker.internet.userName,
        })
        .build();

      const result = userFactory.buildMany(2);

      expect(result[0].username).not.toBe(result[1].username);
    });

    it('should create objects with similar properties, if properties are passed as primitives', () => {
      const userFactory = FactoryBuilder.of(User)
        .props({
          username: faker.internet.userName(),
        })
        .build();

      const result = userFactory.buildMany(2);

      expect(result[0].username).toBe(result[1].username);
    });

    it('should assign partial', () => {
      const expectedUsername = faker.internet.userName();
      const userFactory = FactoryBuilder.of(User)
        .props({
          username: faker.internet.userName(),
        })
        .build();

      const result = userFactory.buildMany(2, {
        partial: { username: expectedUsername },
      });

      expect(result[1].username).toBe(expectedUsername);
    });
  });

  describe('resetId', () => {
    it('should reset object enumeration', () => {
      const defaultIdValue = 2;
      const userFactory = FactoryBuilder.of(User)
        .options({ sequenceField: 'id', defaultSequenceValue: defaultIdValue })
        .build();

      userFactory.buildMany(5);
      userFactory.resetSequence();
      const result = userFactory.buildOne();

      expect(result.id).toBe(defaultIdValue);
    });
  });
});
