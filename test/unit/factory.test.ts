import { Factory } from '../../src';
import { PartialUser, User } from '../fixtures/user';
import * as faker from 'faker';

describe('factory', () => {
  describe('prop', () => {
    it('should add property given as function', () => {
      const password = faker.internet.password();
      const userFactory = new Factory(User)
        .prop('password', () => password)
        .done();

      const result = userFactory.buildOne();

      expect(result.password).toBe(password);
    });

    it('should add property given as object/primitive', () => {
      const password = faker.internet.password();
      const userFactory = new Factory(User).prop('password', password).done();

      const result = userFactory.buildOne();

      expect(result.password).toBe(password);
    });

    it('should add properties in correct order', () => {
      const password = faker.internet.password();
      const userFactory = new Factory(User)
        .prop('password', faker.internet.password())
        .prop('password', faker.internet.password())
        .prop('password', password)
        .done();

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
      const userFactory = new Factory(User).props(expected).done();

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
        .props({
          password: expected.password,
          username: faker.internet.userName,
        })
        .props({
          username: expected.username,
          id: expected.id,
        })
        .done();

      const result = userFactory.buildOne();

      expect(expected).toEqual(result);
    });
  });

  describe('computed', () => {
    it('should add computed to an object', () => {
      const age = 18;
      const userFactory = new Factory(User)
        .props({
          age,
        })
        .computed({
          monthsAlive: (entity) => entity.age * 12,
        })
        .done();

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
        .props(properties)
        .computed({
          monthsAlive: (entity) => entity.age * 12,
        })
        .computed({
          password: (entity) => entity.monthsAlive + entity.username,
        })
        .done();

      const result = userFactory.buildOne();

      expect(result).toEqual(expected);
    });
  });

  describe('mixins', () => {
    it('should allow to extend factory with preexisting one', () => {
      const expectedAge = faker.random.number();
      const properties = {
        age: faker.random.number(),
        username: faker.internet.userName(),
      };
      const mixinUserFactory = new Factory(User).props(properties).done();
      const userFactory = new Factory(User)
        .props({ age: expectedAge })
        .mixins([mixinUserFactory])
        .done();

      const result = userFactory.buildOne();

      expect(result.age).toBe(expectedAge);
      expect(result.username).toBe(properties.username);
    });
    it('should resolve multiple mixins in correct order', () => {
      const expectedUsername = faker.internet.userName();
      const mixinPartialUserFactory = new Factory(PartialUser)
        .computed({
          username: () => faker.internet.userName(),
        })
        .done();
      const mixinUserFactory = new Factory(User)
        .props({ username: expectedUsername })
        .done();
      const userFactory = new Factory(User)
        .mixins([mixinPartialUserFactory, mixinUserFactory])
        .done();

      const result = userFactory.buildOne();

      expect(result.username).toBe(expectedUsername);
    });
  });
});
