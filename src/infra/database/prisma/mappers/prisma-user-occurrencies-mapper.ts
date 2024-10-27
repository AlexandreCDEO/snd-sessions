import { UsuOco as PrismaUserOccurrency } from '@prisma/client'
import { convertToTypeOccurrency } from 'src/core/enums/type-occurrency'
import { UserOccurrency } from 'src/domain/enterprise/entities/user-occurrency'

export class PrismaUserOccurrenciesMapper {
  static toDomain(raw: PrismaUserOccurrency): UserOccurrency {
    return UserOccurrency.create({
      usuCod: raw.usucod,
      usuDtaOco: raw.usudtaoco,
      usuMenOco: raw.usumenoco,
      usuTipOco: convertToTypeOccurrency(raw.usutipoco),
      UsuCodDes: raw.usucoddes,
    })
  }
}
