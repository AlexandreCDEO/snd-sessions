import { Entity } from '../../../core/entities/entity'
import { Optional } from 'src/core/types/optional'

interface SecUserPassProps {
  secuserid: number
  secuserpassdata: Date
  secuserpassreg: string
}

export class SecUserPass extends Entity<SecUserPassProps> {
  constructor(props: SecUserPassProps) {
    super(props)
  }

  get secuserid() {
    return this.props.secuserid
  }

  get secuserpassdata() {
    return this.props.secuserpassdata
  }

  get secuserpassreg() {
    return this.props.secuserpassreg
  }

  static create(props: Optional<SecUserPassProps, 'secuserpassreg'>) {
    return new SecUserPass({
      ...props,
      secuserpassreg: props.secuserpassreg ?? '',
    })
  }
}
