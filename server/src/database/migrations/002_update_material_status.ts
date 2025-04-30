import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('materials')
    .modifyColumn('status', 'enum', (col) =>
      col.enumValues(['pending', 'approved', 'rejected']).notNull().defaultTo('pending')
    )
    .execute();

  await db.executeQuery(`
    UPDATE materials 
    SET status = 'pending' 
    WHERE status = 'active' OR status IS NULL
  `);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('materials')
    .modifyColumn('status', 'varchar(255)', (col) => col.notNull().defaultTo('active'))
    .execute();
} 