import { Entity } from '../../../core/entities/entity'
import { Optional } from 'src/core/types/optional'

interface PolSegNroProps {
  empresaid: number
  empresadatavigenciaseg: Date
  empresatipopoliticaseg: number
  empresaautenticawindowsseg: number
  usuarioseg: string
}

export class PolSegNro extends Entity<PolSegNroProps> {
  constructor(props: PolSegNroProps) {
    super(props)
  }

  get empresaid() {
    return this.props.empresaid
  }

  get empresadatavigenciaseg() {
    return this.props.empresadatavigenciaseg
  }

  get empresatipopoliticaseg() {
    return this.props.empresatipopoliticaseg
  }

  get empresaautenticawindowsseg() {
    return this.props.empresaautenticawindowsseg
  }

  get usuarioseg() {
    return this.props.usuarioseg
  }

  static create(props: Optional<PolSegNroProps, 'empresaautenticawindowsseg'>) {
    return new PolSegNro({
      ...props,
      empresaautenticawindowsseg: props.empresaautenticawindowsseg ?? 0,
    })
  }
}
