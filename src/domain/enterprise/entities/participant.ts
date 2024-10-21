import { Entity } from '../../../core/entities/entity'
import { Optional } from 'src/core/types/optional'

interface ParticipantProps {
  empresaid: number
  participantecodigo: bigint
  participantetipopessoa?: string
  participanterazaosocial?: string
  participantedatacadastro?: Date
  participanteusuariolog?: string
  participantepgmlog?: string
  participantedatalog?: Date
  participantestatus?: boolean
}

export class Participant extends Entity<ParticipantProps> {
  constructor(props: ParticipantProps) {
    super(props)
  }

  get participantecodigo() {
    return this.props.participantecodigo
  }

  get participantetipopessoa() {
    return this.props.participantetipopessoa
  }

  get participanterazaosocial() {
    return this.props.participanterazaosocial
  }

  get participantedatacadastro() {
    return this.props.participantedatacadastro
  }

  get participanteusuariolog() {
    return this.props.participanteusuariolog
  }

  get participantepgmlog() {
    return this.props.participantepgmlog
  }

  get participantedatalog() {
    return this.props.participantedatalog
  }

  get participantestatus() {
    return this.props.participantestatus
  }

  get empresaid() {
    return this.props.empresaid
  }

  static create(
    props: Optional<
      ParticipantProps,
      | 'participantetipopessoa'
      | 'participanterazaosocial'
      | 'participantedatacadastro'
      | 'participanteusuariolog'
      | 'participantepgmlog'
      | 'participantedatalog'
      | 'participantestatus'
    >,
  ) {
    return new Participant({
      ...props,
      participantedatacadastro: props.participantedatacadastro ?? new Date(),
      participantestatus: props.participantestatus ?? true,
    })
  }
}
