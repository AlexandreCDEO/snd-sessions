import { Entity } from '../../../core/entities/entity'
import { Optional } from 'src/core/types/optional'
import { CompanyCompanyGroup } from './company-company-group'

interface CompanyGroupProps {
  grupoempresaid: number
  grupoempresadesc: string
  grupoempresaativo: boolean
  grupoempresaprincipal: boolean
  companyCompanyGroups?: CompanyCompanyGroup[]
}

export class CompanyGroup extends Entity<CompanyGroupProps> {
  constructor(props: CompanyGroupProps) {
    super(props)
  }

  get grupoempresaid() {
    return this.props.grupoempresaid
  }

  get grupoempresadesc() {
    return this.props.grupoempresadesc
  }

  get grupoempresaativo() {
    return this.props.grupoempresaativo
  }

  get grupoempresaprincipal() {
    return this.props.grupoempresaprincipal
  }

  get companyCompanyGroups() {
    return this.props.companyCompanyGroups || []
  }

  static create(props: Optional<CompanyGroupProps, 'companyCompanyGroups'>) {
    return new CompanyGroup({
      ...props,
      grupoempresaativo: props.grupoempresaativo ?? true,
      grupoempresaprincipal: props.grupoempresaprincipal ?? false,
    })
  }
}
