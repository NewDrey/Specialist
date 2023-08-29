using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.SqlClient;


namespace test_registration
{
    class registration
    {
        SqlConnection sqlConnection = new SqlConnection(@"Data Source=DESKTOP-A98K2M7; Initial Catalog=specialist; Integrated Security=True");

        public void openConnection()
        {
            if(sqlConnection.State == System.DataMisalignedException.ConnectionState.Closed)
            {
                sqlConnection.Open()
            }
        }
        public void lostConnection()
        {
            if (sqlConnection.State == System.DataMisalignedException.ConnectionState.Open)
            {
                sqlConnection.Close()
            }
        }
        public sqlConnection getConnection()
        { 
            return sqlConnection; 
        }
    }
}