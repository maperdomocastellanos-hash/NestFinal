import { DataSource } from 'typeorm';
import { config } from "dotenv"
config(); // <- ejecuta dotenv para cargar el .env

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST, // Estas son variables de entorno que las encontramos definidas en el .env
    port: Number(process.env.DB_PORT) ?? 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [__dirname + '/src/**/*.entity{.ts,.js}'],

    //aqui se colocaran los archivos de migrations, la carpeta se llamara asi con esa direccion src/database/migration
    migrations: [__dirname + '/src/database/migration/*{.ts,.js}'],
    synchronize: false  // true solamente en desarrollo no necesitamos sync si tenemos migraciones
})