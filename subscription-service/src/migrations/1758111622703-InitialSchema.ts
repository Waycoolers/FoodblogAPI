import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1758111622703 implements MigrationInterface {
    name = 'InitialSchema1758111622703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_subscription" ("id" SERIAL NOT NULL, "followerId" integer NOT NULL, "followedId" integer NOT NULL, CONSTRAINT "PK_ec4e57f4138e339fb111948a16f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_subscription"`);
    }

}
