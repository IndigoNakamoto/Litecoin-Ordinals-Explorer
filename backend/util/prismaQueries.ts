import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import createInscriptionsWithStatsTypeAndCounts from '../prisma/prismaClient'

async function main() {
    // const inscription = await createInscriptionsWithStatsTypeAndCounts([{
    //     "address": "ltc1q380rjmcpttenfc5qndvkffseec3a2euu6fvmv6",
    //     "charms": [],
    //     "script_pubkey": "001489de396f015af334e2809b5964a619ce23d5679c",
    //     "children": [],
    //     "content_length": 56,
    //     "content_type": "text/plain;charset=utf-8",
    //     "genesis_fee": 210,
    //     "genesis_height": 2646851,
    //     "genesis_address": "ltc1q380rjmcpttenfc5qndvkffseec3a2euu6fvmv6",
    //     "inscription_id": "49af7f81ac66c3d7f6917a53cd93176eb7379d3283c86cf804ec1ccf026b60b9i0",
    //     "inscription_number": 21682545,
    //     "next": "cc989aa79b4d9349213c6c074868b0e7a57cd00a6ddf51ce50378a6d1e4ecab9i0",
    //     "output_value": 10000,
    //     "parent": null,
    //     "previous": "f00205dbc361b36e603495e7443ca510e08065b0d155d9bd2b8a8fe0038182b2i0",
    //     "rune": null,
    //     "sat": null,
    //     "satpoint": "49af7f81ac66c3d7f6917a53cd93176eb7379d3283c86cf804ec1ccf026b60b9:0:0",
    //     "timestamp": 1709963175
    // },
    // {
    //     "address": "ltc1q380rjmcpttenfc5qndvkffseec3a2euu6fvmv6",
    //     "charms": [],
    //     "script_pubkey": "001489de396f015af334e2809b5964a619ce23d5679c",
    //     "children": [],
    //     "content_length": 56,
    //     "content_type": "text/plain;charset=utf-8",
    //     "genesis_fee": 210,
    //     "genesis_height": 2646851,
    //     "genesis_address": "ltc1q380rjmcpttenfc5qndvkffseec3a2euu6fvmv6",
    //     "inscription_id": "878bacbcd10d4418fc261c81b45eecee761eff9e8462996e45192f31f88669bbi0",
    //     "inscription_number": 21682547,
    //     "next": "bc2d1140dbdb4736dde72990a623f7cadbc125de00e03ad073203762db1074c0i0",
    //     "output_value": 10000,
    //     "parent": null,
    //     "previous": "cc989aa79b4d9349213c6c074868b0e7a57cd00a6ddf51ce50378a6d1e4ecab9i0",
    //     "rune": null,
    //     "sat": null,
    //     "satpoint": "878bacbcd10d4418fc261c81b45eecee761eff9e8462996e45192f31f88669bb:0:0",
    //     "timestamp": 1709963175
    // }

    // ])

    // console.log(inscription)

    const inscriptions = await prisma.inscription.findMany()
    // console.log(inscriptions)

    // const user = await prisma.user.create({
    //     data: {
    //         email: "indigo3@gmail.com",
    //         username: "indigo3",
    //     }
    // })
    // console.log(user)

    const profile = await prisma.profile.create({
        data: {
            userId: 2,
            bio: "I am a software developer",
            // location: "Lagos, Nigeria",
            // url: "https://www.indigo.com"
        }
    })
    console.log(profile)
}

main()
    .catch(e => {
        console.error(e.message)
    }).finally(async () => {
        await prisma.$disconnect()
    }
    )