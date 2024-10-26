import { Entity } from 'src/core/entities/entity'
import { TypeOccurrency } from 'src/core/enums/type-occurrency'

interface UserOccurrencyProps {
  usuCod: string
  usuDtaOco: Date
  usuTipOco: TypeOccurrency
  usuMenOco: string
  UsuCodDes?: string
}

export class UserOccurrency extends Entity<UserOccurrencyProps> {
  constructor(props: UserOccurrencyProps) {
    super(props)
  }

  get usuCod() {
    return this.props.usuCod
  }

  get usuDtaOco() {
    return this.props.usuDtaOco
  }

  get usuTipOco() {
    return this.props.usuTipOco
  }

  get usuMenOco() {
    return this.props.usuMenOco
  }

  get UsuCodDes() {
    return this.props.UsuCodDes
  }

  static create(props: UserOccurrencyProps) {
    return new UserOccurrency({
      ...props,
    })
  }
}
