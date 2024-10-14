import { Module } from '@nestjs/common'
import { CreateUserUseCase } from './domain/application/use-cases/create-user'
import { PrismaUsersRepository } from './infra/database/prisma/repositories/prisma-users-repository'
import { UsersRepository } from './domain/application/repositories/users-repository'
import { PrismaService } from './infra/database/prisma/prisma.service'
import { CreateUserController } from './infra/http/controllers/create-user.controller'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env'
import { AuthModule } from './infra/auth/auth.module'
import { AuthenticateController } from './infra/http/controllers/authenticate.controller'
import { AuthenticateUseCase } from './domain/application/use-cases/authenticate'
import { SearchUserProfileUseCase } from './domain/application/use-cases/search-user-Profile'
import { SearchUserProfileController } from './infra/http/controllers/search-user-profile.controller'
import { SearchUsersController } from './infra/http/controllers/search-users.controller'
import { SearchUsersUseCase } from './domain/application/use-cases/search-users'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [
    CreateUserController,
    AuthenticateController,
    SearchUserProfileController,
    SearchUsersController,
  ],
  providers: [
    PrismaService,
    AuthenticateUseCase,
    SearchUserProfileUseCase,
    CreateUserUseCase,
    SearchUsersUseCase,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
})
export class AppModule {}
