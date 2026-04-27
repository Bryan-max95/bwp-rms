import { NextResponse } from 'next/server';
import sql from 'mssql';

export async function POST(req: Request) {
  try {
    const { config, queryType, filters } = await req.json();

    if (!config?.ip || !config?.user || !config?.password || !config?.dbName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración incompleta. Se requieren IP, Usuario, Contraseña y Base de Datos.' 
      }, { status: 400 });
    }

    const sqlConfig: any = {
      user: config.user,
      password: config.password,
      server: config.ip,
      database: config.dbName,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 15000,
        requestTimeout: 15000,
        instanceName: config.instanceName || 'SQLEXPRESS'
      },
      pool: {
        max: 5,
        min: 0,
        idleTimeoutMillis: 30000
      }
    };

    let pool;
    try {
      pool = await sql.connect(sqlConfig);
    } catch (connErr: any) {
      console.error('Connection Error:', connErr);
      return NextResponse.json({ 
        success: false, 
        error: `Error de conexión: ${connErr.message}. Verifique que el servidor acepte conexiones remotas y que el puerto 1433 esté abierto.` 
      }, { status: 500 });
    }

    try {
      let result;

      switch (queryType) {
        case 'DASHBOARD_FULL':
          const [statsQ, historyQ, regsQ] = await Promise.all([
            pool.request().query(`
              SELECT 
                (SELECT ISNULL(SUM(Total), 0) FROM [Transaction] WHERE CONVERT(date, Time) = CONVERT(date, GETDATE())) as DailySales,
                (SELECT COUNT(*) FROM [Transaction] WHERE CONVERT(date, Time) = CONVERT(date, GETDATE())) as TransactionCount,
                (SELECT COUNT(DISTINCT CashierID) FROM [Transaction] WHERE CONVERT(date, Time) = CONVERT(date, GETDATE())) as ActiveCashiers,
                (SELECT ISNULL(AVG(Total), 0) FROM [Transaction] WHERE CONVERT(date, Time) = CONVERT(date, GETDATE())) as AvgTicket
            `),
            pool.request().query(`
              SELECT 
                DATEPART(HOUR, Time) as [hour], 
                SUM(Total) as total 
              FROM [Transaction] 
              WHERE CONVERT(date, Time) = CONVERT(date, GETDATE())
              GROUP BY DATEPART(HOUR, Time)
              ORDER BY [hour]
            `),
            pool.request().query(`
              SELECT 
                Number as id, 
                Description as type,
                (SELECT ISNULL(SUM(Total), 0) FROM [Transaction] WHERE RegisterID = R.ID AND CONVERT(date, Time) = CONVERT(date, GETDATE())) as total
              FROM [Register] R
            `)
          ]);

          return NextResponse.json({ 
            success: true, 
            data: {
              stats: statsQ.recordset[0],
              history: historyQ.recordset,
              registers: regsQ.recordset
            } 
          });

        case 'TEST_CONNECTION':
          result = await pool.request().query('SELECT TOP 1 StoreID FROM [Store]');
          return NextResponse.json({ success: true, data: result.recordset });

        case 'TOP_PRODUCTS':
          result = await pool.request().query(`
            SELECT TOP 10 
              I.Description as name, 
              SUM(TE.Quantity) as sold, 
              SUM(TE.Price * TE.Quantity) as revenue
            FROM [TransactionEntry] TE
            JOIN [Item] I ON TE.ItemID = I.ID
            JOIN [Transaction] T ON TE.TransactionNumber = T.TransactionNumber
            WHERE CONVERT(date, T.Time) = CONVERT(date, GETDATE())
            GROUP BY I.Description
            ORDER BY sold DESC
          `);
          return NextResponse.json({ success: true, data: result.recordset });

        case 'CASHIERS_PERFORMANCE':
          result = await pool.request().query(`
            SELECT 
              C.Name as name, 
              SUM(T.Total) as sales, 
              COUNT(T.ID) as tickets,
              AVG(T.Total) as avgTicket
            FROM [Transaction] T
            JOIN [Cashier] C ON T.CashierID = C.ID
            WHERE CONVERT(date, T.Time) = CONVERT(date, GETDATE())
            GROUP BY C.Name
            ORDER BY sales DESC
          `);
          return NextResponse.json({ success: true, data: result.recordset });

        case 'SALES_BY_RANGE':
          result = await pool.request()
            .input('dateFrom', sql.VarChar, filters.dateFrom)
            .input('dateTo', sql.VarChar, filters.dateTo)
            .query(`
              SELECT 
                T.TransactionNumber, 
                T.Time, 
                T.Total, 
                C.Name as CashierName
              FROM [Transaction] T
              JOIN [Cashier] C ON T.CashierID = C.ID
              WHERE CONVERT(date, T.Time) >= @dateFrom 
                AND CONVERT(date, T.Time) <= @dateTo
              ORDER BY T.Time DESC
            `);
          return NextResponse.json({ success: true, data: result.recordset });

        default:
          throw new Error('Tipo de consulta no soportado');
      }
    } finally {
      await pool.close();
    }

  } catch (error: any) {
    console.error('SQL Global Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor SQL' 
    }, { status: 500 });
  }
}
