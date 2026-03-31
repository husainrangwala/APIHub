import { User } from '../db/schema';

declare global {
    namespace Express {
        interface Request {
            user?: Pick<User, 'id' | 'email'>;
        }
    }
}
