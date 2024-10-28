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
import { AuthenticateStudentController } from './infra/http/controllers/authenticate-student.controller'
import { AuthenticateStudentUseCase } from './domain/application/use-cases/authenticate-student'
import { RegistrationsRepository } from './domain/application/repositories/registrations-repository'
import { PrismaRegistrationsRepository } from './infra/database/prisma/repositories/prisma-registrations-repository'
import { CompanyGroupsRepository } from './domain/application/repositories/company-groups-repository'
import { PrismaCompanyGroupsRepository } from './infra/database/prisma/repositories/prisma-company-groups-repository'
import { CompanyCompanyGroupsRepository } from './domain/application/repositories/company-company-groups-repository'
import { PrismaCompanyCompanyGroupsRepository } from './infra/database/prisma/repositories/prisma-company-company-groups-repository'
import { SecuryPoliciesRepository } from './domain/application/repositories/secury-policies-repository'
import { PrismaSecuryPoliciesRepository } from './infra/database/prisma/repositories/prisma-secury-policies-repository'
import { SecUserPassRepository } from './domain/application/repositories/secuser-pass-repository'
import { PrismaSecUserPassRepository } from './infra/database/prisma/repositories/prisma-secuserpass-repository'
import { UserOccurrenciesRepository } from './domain/application/repositories/user-occurrencies-repository'
import { PrismaUserOccurrenciesRepository } from './infra/database/prisma/repositories/prisma-user-occurrencies-repository'

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
    AuthenticateStudentController,
  ],
  providers: [
    PrismaService,
    AuthenticateUseCase,
    SearchUserProfileUseCase,
    CreateUserUseCase,
    SearchUsersUseCase,
    AuthenticateStudentUseCase,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: RegistrationsRepository,
      useClass: PrismaRegistrationsRepository,
    },
    {
      provide: CompanyGroupsRepository,
      useClass: PrismaCompanyGroupsRepository,
    },
    {
      provide: CompanyCompanyGroupsRepository,
      useClass: PrismaCompanyCompanyGroupsRepository,
    },
    {
      provide: SecuryPoliciesRepository,
      useClass: PrismaSecuryPoliciesRepository,
    },
    {
      provide: SecUserPassRepository,
      useClass: PrismaSecUserPassRepository,
    },
    {
      provide: UserOccurrenciesRepository,
      useClass: PrismaUserOccurrenciesRepository,
    },
  ],
})
export class AppModule {}
