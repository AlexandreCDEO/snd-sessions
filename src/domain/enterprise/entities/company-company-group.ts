import { Entity } from '../../../core/entities/entity'
import { Optional } from 'src/core/types/optional'

interface CompanyCompanyGroupProps {
  empresaprincipal: boolean
  empresacontabilizadora: boolean
  empresaid: number
  grupoempresaid: number
}

export class CompanyCompanyGroup extends Entity<CompanyCompanyGroupProps> {
  constructor(props: CompanyCompanyGroupProps) {
    super(props)
  }

  get empresaprincipal() {
    return this.props.empresaprincipal
  }

  get empresacontabilizadora() {
    return this.props.empresacontabilizadora
  }

  get empresaid() {
    return this.props.empresaid
  }

  get grupoempresaid() {
    return this.props.grupoempresaid
  }

  static create(
    props: Optional<
      CompanyCompanyGroupProps,
      'empresaprincipal' | 'empresacontabilizadora'
    >,
  ) {
    return new CompanyCompanyGroup({
      ...props,
      empresaprincipal: props.empresaprincipal ?? false,
      empresacontabilizadora: props.empresacontabilizadora ?? false,
    })
  }
}
