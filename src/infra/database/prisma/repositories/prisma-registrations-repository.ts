import { RegistrationsRepository } from 'src/domain/application/repositories/registrations-repository'
import { PrismaService } from '../prisma.service'
import { Injectable } from '@nestjs/common'
import { Registration } from 'src/domain/enterprise/entities/Registration'

@Injectable()
export class PrismaRegistrationsRepository implements RegistrationsRepository {
  constructor(private prisma: PrismaService) {}
  async findByDocument(companyId, document: string): Promise<Registration[]> {
    const result = await this.prisma.matricula.findMany({
      include: {
        participanteFilial: true,
      },
      where: {
        empresaid: companyId,
        matriculasituacaoaluno: true,
        participanteFilial: {
          participantefilialcnpj: Number(document),
        },
      },
    })

    const registrations = result.map((item) =>
      Registration.create({
        empresaid: item.empresaid,
        matriculacodigo: item.matriculacodigo,
        alunoparticipantecod: item.alunoparticipantecod,
        alunoparticipantefilialcod: item.alunoparticipantefilialcod,
        cursocodigo: item.cursocodigo,
        matriculadatacadastro: item.matriculadatacadastro,
        matriculaidmoodle: item.matriculaidmoodle,
        matriculaidpf: item.matriculaidpf,
        matriculasituacaoacademica: item.matriculasituacaoacademica,
        matriculasituacaoaluno: item.matriculasituacaoaluno,
        periodoescolaratualid: item.periodoescolaratualid,
        periodoescolarid: item.periodoescolarid,
        turmacodigo: item.turmacodigo,
      }),
    )

    return registrations
  }
}
