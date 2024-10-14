import { secuser as PrismaUser, Prisma } from '@prisma/client'
import { User } from 'src/domain/enterprise/entities/user'

export class PrismaUsersMapper {
  static toDomain(raw: PrismaUser): User {
    if (!raw.secuseremail || !raw.secusernamecomp || !raw.secuserpassword) {
      throw new Error('Usuário inválido. verifique!')
    }

    return User.create({
      id: raw.secuserid,
      email: raw.secuseremail,
      name: raw.secusernamecomp,
      password: raw.secuserpassword,
      username: raw.secusername,
      createdAt: raw.secuserdatacadastro!,
    })
  }

  static toPrisma(user: User): Prisma.secuserCreateInput {
    return {
      secusername: user.username,
      secuseremail: user.email,
      secusernamecomp: user.name,
      secuserpassword: user.password,
      secuseractive: user.isActive,
      secuserbloqueado: user.isBlocked,
      secuserdatacadastro: user.createdAt,
      secusersenhaprovisoria: user.temporaryPassword,
      secuserstatus: user.status,
    }
  }

  // Mapeamento de uma lista de PrismaUser para uma lista de User (Domínio)
  static toDomainList(rawUsers: PrismaUser[]): User[] {
    return rawUsers.map((rawUser) => PrismaUsersMapper.toDomain(rawUser))
  }
}
