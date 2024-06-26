import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from './schemas/user.schema';

@Module({
  imports:[MongooseModule.forFeature([{name:'user', schema:userSchema }]),
  MongooseModule.forFeature([{ name: 'PendingUser', schema: userSchema }]),
],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

