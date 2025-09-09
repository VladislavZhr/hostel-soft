import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User} from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>, // в даному випадку readonly це те саме що і в джаві final
  ) {}

  findByUsername(username: string) {
    return this.repo.findOne({ where: { username } });
  }

  async createAndSave(user: Partial<User>){
    const entity = this.repo.create(user);
    //await this.repo.save(entity); // await каже зупинити виконання цієї ф-ї і покласти в чергу, доки запит не завершиться
    return this.repo.save(entity); // якщо ф-я позначена як async, то  повертає одразу Promise<User>, але тут я не чекаю у середині, а віддаю сам проміс нагору, тобто чекати буде той, ХТО ВИКЛИКАЄ ЦЕЙ МЕТОД
  }
}
