import { Entity } from '../../../core/entities/entity'
import { Optional } from 'src/core/types/optional'

interface BranchParticipantProps {
  participantefilialcodigo: number
  participantenomecompleto?: string
  participantefilialstatus?: boolean
  participantefilialsexo?: string
  participantefilialnacionalidadepais?: number
  participantefilialnacionalidade?: string
  participantefilialnacionalidadeuf?: string
  participantefilialnacionalidadeestrangeiro?: string
  participantefilialnomefantasia?: string
  participantefilialcnpj?: bigint
  participantefilialrg?: string
  participantefilialrguf?: string
  participantefilialdocumentosubstituto?: string
  participantefilialdocumentosubstitutoid?: string
  participantefilialnascimento?: Date
  participantefilialdataconclusao?: Date
  participantefilialqtddiasper?: number
  participantefilialregimetributario?: string
  participantefilialcodexterno?: string
  participantefilialretws?: string
  participantefilialdatady?: Date
  participantefilialcustomeridlinx?: bigint
  participantefilialtransportadora?: number
  participantefilialgrupocontabil?: number
  participantefilialregiaogeografica?: string
  participantefilialsubstituidoicms?: string
  participantefilialgeraspd?: string
  participantefilialtipo?: string
  participantefilialterceirocargo?: string
  participantefilialcodigoinep?: string
  participantefilialpgmlog?: string
  participantefilialusuariolog?: string
  participantefilialdatalog?: Date
  participantefilialinscricaoestadual?: string
  participantefilialcorraca?: number
  participantefilialnomesocial?: string
  empresaid: number
  participantecodigo: bigint
  participantefilialnacionalidadecodmunicipio?: number
  participantefilialrgorgaoexpedidor?: number
  participantefilialcargoempresaid?: number
  participantefilialcargocodigo?: number
  generoid?: number
}

export class BranchParticipant extends Entity<BranchParticipantProps> {
  constructor(props: BranchParticipantProps) {
    super(props)
  }

  get participantefilialcodigo() {
    return this.props.participantefilialcodigo
  }

  get participantenomecompleto() {
    return this.props.participantenomecompleto
  }

  get participantefilialstatus() {
    return this.props.participantefilialstatus
  }

  get participantefilialsexo() {
    return this.props.participantefilialsexo
  }

  get empresaid() {
    return this.props.empresaid
  }

  get participantecodigo() {
    return this.props.participantecodigo
  }

  static create(
    props: Optional<
      BranchParticipantProps,
      | 'participantenomecompleto'
      | 'participantefilialstatus'
      | 'participantefilialsexo'
      | 'participantefilialnacionalidadepais'
      | 'participantefilialnacionalidade'
      | 'participantefilialnacionalidadeuf'
      | 'participantefilialnacionalidadeestrangeiro'
      | 'participantefilialnomefantasia'
      | 'participantefilialcnpj'
      | 'participantefilialrg'
      | 'participantefilialrguf'
      | 'participantefilialdocumentosubstituto'
      | 'participantefilialdocumentosubstitutoid'
      | 'participantefilialnascimento'
      | 'participantefilialdataconclusao'
      | 'participantefilialqtddiasper'
      | 'participantefilialregimetributario'
      | 'participantefilialcodexterno'
      | 'participantefilialretws'
      | 'participantefilialdatady'
      | 'participantefilialcustomeridlinx'
      | 'participantefilialtransportadora'
      | 'participantefilialgrupocontabil'
      | 'participantefilialregiaogeografica'
      | 'participantefilialsubstituidoicms'
      | 'participantefilialgeraspd'
      | 'participantefilialtipo'
      | 'participantefilialterceirocargo'
      | 'participantefilialcodigoinep'
      | 'participantefilialpgmlog'
      | 'participantefilialusuariolog'
      | 'participantefilialdatalog'
      | 'participantefilialinscricaoestadual'
      | 'participantefilialcorraca'
      | 'participantefilialnomesocial'
      | 'participantefilialnacionalidadecodmunicipio'
      | 'participantefilialrgorgaoexpedidor'
      | 'participantefilialcargoempresaid'
      | 'participantefilialcargocodigo'
      | 'generoid'
    >,
  ) {
    return new BranchParticipant({
      ...props,
      participantefilialstatus: props.participantefilialstatus ?? true,
    })
  }
}
