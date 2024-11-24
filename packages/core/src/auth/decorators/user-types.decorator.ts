// packages/core/src/auth/decorators/user-types.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { UserType } from '@tcora/config';

export const USER_TYPES_KEY = 'userTypes';
export const UserTypes = (...types: UserType[]) => SetMetadata(USER_TYPES_KEY, types);