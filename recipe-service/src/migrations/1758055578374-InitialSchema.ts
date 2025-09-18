import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1758055578374 implements MigrationInterface {
    name = 'InitialSchema1758055578374'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`);
        await queryRunner.query(`ALTER TABLE "user_recipe" DROP CONSTRAINT "FK_f0786434a5195df399e915d41e3"`);
        await queryRunner.query(`ALTER TABLE "recipe" DROP CONSTRAINT "FK_1370c876f9d4a525a45a9b50d81"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP CONSTRAINT "FK_13e07a2aae74a5d365f86083b67"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP CONSTRAINT "FK_0da2e472fc6fcbc6958a906d56b"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_recipe" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipe" ALTER COLUMN "authorId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ALTER COLUMN "followerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ALTER COLUMN "followedId" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_subscription" ALTER COLUMN "followedId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ALTER COLUMN "followerId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipe" ALTER COLUMN "authorId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_recipe" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD CONSTRAINT "FK_0da2e472fc6fcbc6958a906d56b" FOREIGN KEY ("followedId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD CONSTRAINT "FK_13e07a2aae74a5d365f86083b67" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe" ADD CONSTRAINT "FK_1370c876f9d4a525a45a9b50d81" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_recipe" ADD CONSTRAINT "FK_f0786434a5195df399e915d41e3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
