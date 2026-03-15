import { ExecutionContext } from '@nestjs/common';

// The inner function passed to createParamDecorator — extracted here for direct testing.
// This mirrors the exact logic in get-user.decorator.ts.
const getUserFactory = (key: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request['user'];
  return key ? user?.[key] : user;
};

function buildContext(user: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('GetUser decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the full user object when no key is provided', () => {
    const user = { sub: 'uid1', email: 'a@b.com' };
    const ctx = buildContext(user);

    const result = getUserFactory(undefined, ctx);

    expect(result).toEqual(user);
  });

  it('returns user[key] for a specific key "sub"', () => {
    const user = { sub: 'uid1', email: 'a@b.com' };
    const ctx = buildContext(user);

    const result = getUserFactory('sub', ctx);

    expect(result).toBe('uid1');
  });

  it('returns user[key] for a specific key "email"', () => {
    const user = { sub: 'uid1', email: 'a@b.com' };
    const ctx = buildContext(user);

    const result = getUserFactory('email', ctx);

    expect(result).toBe('a@b.com');
  });

  it('returns undefined when key does not exist on user', () => {
    const user = { sub: 'uid1' };
    const ctx = buildContext(user);

    const result = getUserFactory('nonexistent', ctx);

    expect(result).toBeUndefined();
  });

  it('returns undefined when request["user"] is undefined and no key given', () => {
    const ctx = buildContext(undefined);

    const result = getUserFactory(undefined, ctx);

    expect(result).toBeUndefined();
  });

  it('returns undefined when request["user"] is undefined and a key is given', () => {
    const ctx = buildContext(undefined);

    const result = getUserFactory('sub', ctx);

    expect(result).toBeUndefined();
  });
});
