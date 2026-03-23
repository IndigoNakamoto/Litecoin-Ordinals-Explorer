import type { Prisma } from '@prisma/client';

/** Strip immutable key for `inscription.update` — all other mapped fields come from ord. */
export function inscriptionCreateInputToUpdateData(
    row: Prisma.InscriptionCreateManyInput,
): Prisma.InscriptionUpdateInput {
    const { inscription_id: _omit, ...rest } = row;
    return rest;
}
