import { Entity } from '../../../core/entities/entity'
import { Optional } from 'src/core/types/optional'

interface EnterpriseProps {
  empresaid: number
  empresacnpj: string
  empresanome: string
  empresanomefantasia: string
  empresatemaid?: number
  empresaambiente?: number
  empresaativo: boolean
  empnom?: string
  emprzo?: string
  empresacodinep?: bigint
}

export class Enterprise extends Entity<EnterpriseProps> {
  constructor(props: EnterpriseProps) {
    super(props)
  }

  get empresaid() {
    return this.props.empresaid
  }

  get empresacnpj() {
    return this.props.empresacnpj
  }

  get empresanome() {
    return this.props.empresanome
  }

  get empresanomefantasia() {
    return this.props.empresanomefantasia
  }

  get empresatemaid() {
    return this.props.empresatemaid
  }

  get empresaambiente() {
    return this.props.empresaambiente
  }

  get empresaativo() {
    return this.props.empresaativo
  }

  get empnom() {
    return this.props.empnom
  }

  get emprzo() {
    return this.props.emprzo
  }

  get empresacodinep() {
    return this.props.empresacodinep
  }

  static create(
    props: Optional<
      EnterpriseProps,
      | 'empresatemaid'
      | 'empresaambiente'
      | 'empnom'
      | 'emprzo'
      | 'empresacodinep'
    >,
  ) {
    return new Enterprise({
      ...props,
      empresaativo: props.empresaativo ?? true,
    })
  }
}
