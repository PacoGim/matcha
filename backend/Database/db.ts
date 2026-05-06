// fetch database
import pg from "pg"

const { Pool } = pg

let pool: pg.Pool
let isInit: boolean = false

function initPool() {
    if (isInit === true) {
        console.warn("initPool() already done")
        return
    }
    pool = new Pool({
        host: "localhost",
        port: 5432,
        user: "matcha_user",
        password: "matcha_password",
        database: "matcha_db",
    })
    isInit = true
}

function getPool(): pg.Pool {
    if (isInit === false) {
        console.error("don't forget to call initPool() before getPool()")
        process.exit(1)
    }
    return pool
}

export default { getPool, initPool }