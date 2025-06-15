import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';


interface QueryResult {
    [key: string]: any;
}




let conn: AsyncDuckDBConnection | null = null;

async function initDuckDB(): Promise<void> {
    try {
        const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
            mvp: {
                mainModule: duckdb_wasm,
                mainWorker: mvp_worker,
            },
            eh: {
                mainModule: duckdb_wasm_eh,
                mainWorker: eh_worker,
            },
        };
        // Select a bundle based on browser checks
        const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
        // Instantiate the asynchronus version of DuckDB-wasm
        const worker = new Worker(bundle.mainWorker!);
        const logger = new duckdb.ConsoleLogger();
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

        conn = await db.connect();

        // Create a sample table with some data
        await conn.query(`
            CREATE TABLE IF NOT EXISTS data AS 
            SELECT * FROM (VALUES 
                (1, 'John', 25),
                (2, 'Jane', 30),
                (3, 'Bob', 35),
                (4, 'Alice', 28),
                (5, 'Charlie', 32)
            ) AS t(id, name, age);
        `);

        console.log('DuckDB initialized successfully');
    } catch (error) {
        console.error('Error initializing DuckDB:', error);
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `<div class="error">Error initializing DuckDB: ${error instanceof Error ? error.message : String(error)}</div>`;
        }
    }
}

async function executeQuery(query: string): Promise<QueryResult[]> {
    try {
        if (!conn) {
            throw new Error('Database connection not initialized');
        }

        const result = await conn.query(query);
        return result.toArray();
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
}

function displayResults(result: QueryResult[]): void {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    if (!result || !result.length) {
        resultsDiv.innerHTML = '<div class="no-results">No results found</div>';
        return;
    }

    const table = document.createElement('table');
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(result[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    result.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = String(value);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(table);
}

// Initialize DuckDB when the page loads
window.addEventListener('load', initDuckDB);

// Handle query execution
document.getElementById('runQuery')?.addEventListener('click', async () => {
    const queryInput = document.getElementById('queryInput') as HTMLTextAreaElement;
    const query = queryInput.value.trim();

    if (!query) {
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.innerHTML = '<div class="error">Please enter a query</div>';
        }
        return;
    }

    try {
        const result = await executeQuery(query);
        displayResults(result);
    } catch (error) {
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `<div class="error">Error executing query: ${error instanceof Error ? error.message : String(error)}</div>`;
        }
    }
}); 