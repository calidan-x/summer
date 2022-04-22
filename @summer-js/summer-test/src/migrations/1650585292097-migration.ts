import { MigrationInterface, QueryRunner } from 'typeorm'

export class migration1650585292097 implements MigrationInterface {
  name = 'migration1650585292097'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`todo\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`content\` varchar(255) NOT NULL,
                \`is_done\` tinyint NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE \`todo\`
        `)
  }
}
