import {MigrationInterface, QueryRunner} from "typeorm";

export class generateTableV11626329147854 implements MigrationInterface {
    name = 'generateTableV11626329147854'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "key" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userid" varchar NOT NULL, "signingkey" varchar NOT NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "key"`);
    }

}
