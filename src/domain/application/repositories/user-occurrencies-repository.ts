import { TypeOccurrency } from 'src/core/enums/type-occurrency'
import { UserOccurrency } from 'src/domain/enterprise/entities/user-occurrency'

export abstract class UserOccurrenciesRepository {
  abstract create(
    usuCod: string,
    usuDtaOco: Date,
    UsuTipOco: TypeOccurrency,
    UsuMenOco: string,
    UsuCodDes?: string,
  ): Promise<UserOccurrency | null>
}
