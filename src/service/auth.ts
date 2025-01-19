import { IResponseUser, IUser } from "../interfaces/auth";
import { hashing } from "../lib/helper";
import { UserRepository } from "../repository/user";

interface AuthServiceDepedencies {
  userRepository: UserRepository;
}

export class AuthService {
  private userRepository: UserRepository;
  constructor({ userRepository }: AuthServiceDepedencies) {
    this.userRepository = userRepository;
  }

  async createAccount(payload: IUser): Promise<IResponseUser> {
    const user = await this.userRepository.findUser(payload.username);
    if (user) throw { statusCode: 200, message: "User already exist" };
    const hashPassword = await hashing(payload.password);
    const userData = await this.userRepository.createUser({
      ...payload,
      password: hashPassword,
    });
    return userData;
  }
}
