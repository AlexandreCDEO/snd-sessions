import { Entity } from '../../../core/entities/entity'
import { Optional } from 'src/core/types/optional'

interface RegistrationProps {
  empresaid: number
  matriculacodigo: string
  alunoparticipantecod?: bigint | null
  alunoparticipantefilialcod?: number | null
  matriculasituacaoacademica?: string | null
  matriculaidpf?: string | null
  matriculaidmoodle?: string | null
  matriculasituacaoaluno?: boolean | null
  matriculadatacadastro?: Date | null
  periodoescolarid?: number | null
  periodoescolaratualid?: number | null
  cursocodigo?: bigint | null
  turmacodigo?: number | null
}

export class Registration extends Entity<RegistrationProps> {
  get empresaid() {
    return this.props.empresaid
  }

  get matriculacodigo() {
    return this.props.matriculacodigo
  }

  get alunoparticipantecod() {
    return this.props.alunoparticipantecod
  }

  get alunoparticipantefilialcod() {
    return this.props.alunoparticipantefilialcod
  }

  get matriculasituacaoacademica() {
    return this.props.matriculasituacaoacademica
  }

  get matriculaidpf() {
    return this.props.matriculaidpf
  }

  get matriculaidmoodle() {
    return this.props.matriculaidmoodle
  }

  get matriculasituacaoaluno() {
    return this.props.matriculasituacaoaluno
  }

  get matriculadatacadastro() {
    return this.props.matriculadatacadastro
  }

  get periodoescolarid() {
    return this.props.periodoescolarid
  }

  get periodoescolaratualid() {
    return this.props.periodoescolaratualid
  }

  get cursocodigo() {
    return this.props.cursocodigo
  }

  get turmacodigo() {
    return this.props.turmacodigo
  }

  static create(
    props: Optional<
      Registration,
      | 'alunoparticipantecod'
      | 'alunoparticipantefilialcod'
      | 'matriculasituacaoacademica'
      | 'matriculaidpf'
      | 'matriculaidmoodle'
      | 'matriculasituacaoaluno'
      | 'matriculadatacadastro'
      | 'periodoescolarid'
      | 'periodoescolaratualid'
      | 'cursocodigo'
      | 'turmacodigo'
    >,
  ) {
    const matricula = new Registration({
      ...props,
      matriculadatacadastro: props.matriculadatacadastro ?? new Date(),
    })

    return matricula
  }
}
