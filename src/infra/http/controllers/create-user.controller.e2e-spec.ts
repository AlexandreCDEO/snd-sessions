import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from 'src/app.module'
import { PrismaService } from 'src/infra/database/prisma/prisma.service'
import request from 'supertest'

describe('Cadastro de usuário (E2E) - (create-user.controller.e2e.spec)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = app.get(PrismaService)

    await app.init()
  })

  beforeEach(async () => {
    await prisma.$executeRaw`BEGIN;`
  })

  afterEach(async () => {
    await prisma.$executeRaw`ROLLBACK;`
  })

  test('[POST] /users', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      name: 'Jhon',
      email: 'jhon@example.com',
      username: 'Jhon',
      password: '123456',
    })

    expect(response.statusCode).toBe(201)
  })

  afterAll(async () => {
    await app.close()
  })
})
