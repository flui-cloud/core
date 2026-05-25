import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropOauthAppMode1779666862040 implements MigrationInterface {
  name = 'DropOauthAppMode1779666862040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const gicDeleted = await queryRunner.query(
      `DELETE FROM public.github_integration_config WHERE auth_method = 'oauth_app' RETURNING id`,
    );
    const rcDeleted = await queryRunner.query(
      `DELETE FROM public.repository_credentials WHERE credential_type = 'oauth_app' RETURNING id`,
    );
    console.log(
      `[DropOauthAppMode] deleted github_integration_config rows: ${gicDeleted.length}, repository_credentials rows: ${rcDeleted.length}`,
    );

    await queryRunner.query(
      `ALTER TABLE public.repository_credentials ALTER COLUMN credential_type DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TYPE public.github_integration_config_auth_method_enum RENAME TO github_integration_config_auth_method_enum_old`,
    );
    await queryRunner.query(
      `CREATE TYPE public.github_integration_config_auth_method_enum AS ENUM ('pat', 'github_app')`,
    );
    await queryRunner.query(
      `ALTER TABLE public.github_integration_config
         ALTER COLUMN auth_method TYPE public.github_integration_config_auth_method_enum
         USING auth_method::text::public.github_integration_config_auth_method_enum`,
    );
    await queryRunner.query(
      `DROP TYPE public.github_integration_config_auth_method_enum_old`,
    );

    await queryRunner.query(
      `ALTER TYPE public.repository_credentials_credential_type_enum RENAME TO repository_credentials_credential_type_enum_old`,
    );
    await queryRunner.query(
      `CREATE TYPE public.repository_credentials_credential_type_enum AS ENUM ('pat', 'github_app')`,
    );
    await queryRunner.query(
      `ALTER TABLE public.repository_credentials
         ALTER COLUMN credential_type TYPE public.repository_credentials_credential_type_enum
         USING credential_type::text::public.repository_credentials_credential_type_enum`,
    );
    await queryRunner.query(
      `DROP TYPE public.repository_credentials_credential_type_enum_old`,
    );

    await queryRunner.query(
      `ALTER TABLE public.repository_credentials
         ALTER COLUMN credential_type SET DEFAULT 'github_app'::public.repository_credentials_credential_type_enum`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE public.repository_credentials ALTER COLUMN credential_type DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TYPE public.github_integration_config_auth_method_enum RENAME TO github_integration_config_auth_method_enum_old`,
    );
    await queryRunner.query(
      `CREATE TYPE public.github_integration_config_auth_method_enum AS ENUM ('oauth_app', 'pat', 'github_app')`,
    );
    await queryRunner.query(
      `ALTER TABLE public.github_integration_config
         ALTER COLUMN auth_method TYPE public.github_integration_config_auth_method_enum
         USING auth_method::text::public.github_integration_config_auth_method_enum`,
    );
    await queryRunner.query(
      `DROP TYPE public.github_integration_config_auth_method_enum_old`,
    );

    await queryRunner.query(
      `ALTER TYPE public.repository_credentials_credential_type_enum RENAME TO repository_credentials_credential_type_enum_old`,
    );
    await queryRunner.query(
      `CREATE TYPE public.repository_credentials_credential_type_enum AS ENUM ('oauth_app', 'pat', 'github_app')`,
    );
    await queryRunner.query(
      `ALTER TABLE public.repository_credentials
         ALTER COLUMN credential_type TYPE public.repository_credentials_credential_type_enum
         USING credential_type::text::public.repository_credentials_credential_type_enum`,
    );
    await queryRunner.query(
      `DROP TYPE public.repository_credentials_credential_type_enum_old`,
    );

    await queryRunner.query(
      `ALTER TABLE public.repository_credentials
         ALTER COLUMN credential_type SET DEFAULT 'oauth_app'::public.repository_credentials_credential_type_enum`,
    );
  }
}
